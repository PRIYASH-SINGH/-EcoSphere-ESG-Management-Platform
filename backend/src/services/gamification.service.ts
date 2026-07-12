// ──────────────────────────────────────────────
// Gamification Service — Challenges, Badges, Rewards, Leaderboard
// ──────────────────────────────────────────────

import {
  challenges,
  challengeParticipations,
  badges,
  userBadges,
  rewards,
  rewardRedemptions,
  users,
} from "../store/index.js";

import type {
  Challenge,
  ChallengeParticipation,
  Badge,
  UserBadge,
  Reward,
  RewardRedemption,
  User,
  Difficulty,
  ChallengeStatus,
} from "../types/index.js";

// ── Helper: HTTP-style errors ─────────────────

class ServiceError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

// ── Input types ───────────────────────────────

interface CreateChallengeInput {
  title: string;
  categoryId?: number | null;
  description: string;
  xpReward: number;
  difficulty: Difficulty;
  deadline?: Date | null;
}

interface UpdateChallengeInput {
  title?: string;
  categoryId?: number | null;
  description?: string;
  xpReward?: number;
  difficulty?: Difficulty;
  deadline?: Date | null;
  status?: ChallengeStatus;
}

interface CreateBadgeInput {
  name: string;
  description: string;
  unlockRule: string;
  icon?: string | null;
}

interface CreateRewardInput {
  name: string;
  description: string;
  pointsRequired: number;
  stock: number;
}

// ── Challenge with user participation overlay ─

interface ChallengeWithParticipation extends Challenge {
  participation?: ChallengeParticipation | null;
}

// ── User badge with badge details ─────────────

interface UserBadgeWithDetails extends UserBadge {
  badge?: Badge;
}

// ── Leaderboard entry ─────────────────────────

interface LeaderboardEntry {
  rank: number;
  userId: number;
  name: string;
  email: string;
  departmentId: number | null;
  totalXp: number;
  badgeCount: number;
}

interface UserRankResult {
  rank: number;
  totalXp: number;
  badgeCount: number;
  nextMilestone: number;
}

// ── Service ───────────────────────────────────

export class GamificationService {
  // ────────────────────────────────────────────
  // Challenges
  // ────────────────────────────────────────────

  /** Create a new challenge with status='active'. */
  createChallenge(data: CreateChallengeInput): Challenge {
    const challenge = challenges.create({
      title: data.title,
      categoryId: data.categoryId ?? null,
      description: data.description,
      xpReward: data.xpReward,
      difficulty: data.difficulty,
      deadline: data.deadline ?? null,
      status: "active" as ChallengeStatus,
      createdAt: new Date(),
    });
    return challenge;
  }

  /**
   * Get all active challenges.
   * If userId is provided, attach the user's participation record (if any)
   * to each challenge so the client knows the user's status.
   */
  getChallenges(userId?: number): ChallengeWithParticipation[] {
    const activeChallenges = challenges.findAll({
      status: "active" as ChallengeStatus,
    });

    if (userId === undefined) {
      return activeChallenges.map((c) => ({ ...c, participation: null }));
    }

    const userParticipations = challengeParticipations.findMany(
      (p) => p.userId === userId
    );
    const participationMap = new Map<number, ChallengeParticipation>();
    for (const p of userParticipations) {
      participationMap.set(p.challengeId, p);
    }

    return activeChallenges.map((c) => ({
      ...c,
      participation: participationMap.get(c.id) ?? null,
    }));
  }

  /** Update a challenge by id. */
  updateChallenge(id: number, data: UpdateChallengeInput): Challenge {
    const updated = challenges.update(id, data);
    if (!updated) {
      throw new ServiceError("Challenge not found", 404);
    }
    return updated;
  }

  // ────────────────────────────────────────────
  // Challenge Participation
  // ────────────────────────────────────────────

  /** Join a challenge — creates a ChallengeParticipation. */
  joinChallenge(userId: number, challengeId: number): ChallengeParticipation {
    // Verify challenge exists
    const challenge = challenges.findById(challengeId);
    if (!challenge) {
      throw new ServiceError("Challenge not found", 404);
    }

    // Verify user hasn't already joined
    const existing = challengeParticipations.findOne(
      (p) => p.userId === userId && p.challengeId === challengeId
    );
    if (existing) {
      throw new ServiceError(
        "You have already joined this challenge",
        409
      );
    }

    const participation = challengeParticipations.create({
      userId,
      challengeId,
      proof: null,
      status: "started",
      xpAwarded: 0,
      createdAt: new Date(),
    });

    return participation;
  }

  /** Submit proof for a challenge participation. */
  submitChallenge(
    userId: number,
    challengeParticipationId: number,
    proof: string
  ): ChallengeParticipation {
    const participation = challengeParticipations.findById(
      challengeParticipationId
    );
    if (!participation) {
      throw new ServiceError("Challenge participation not found", 404);
    }

    if (participation.userId !== userId) {
      throw new ServiceError(
        "This participation does not belong to you",
        403
      );
    }

    if (participation.status !== "started") {
      throw new ServiceError(
        `Cannot submit — current status is '${participation.status}'`,
        400
      );
    }

    const updated = challengeParticipations.update(
      challengeParticipationId,
      { status: "submitted", proof }
    );

    return updated!;
  }

  /** Get all challenge participations for a user. */
  getUserChallenges(userId: number): (ChallengeParticipation & { challenge?: Challenge })[] {
    const participations = challengeParticipations.findMany(
      (p) => p.userId === userId
    );

    return participations.map((p) => {
      const challenge = challenges.findById(p.challengeId);
      return { ...p, challenge };
    });
  }

  /** Get all participations with status='submitted' (pending approval). */
  getPendingChallengeApprovals(): (ChallengeParticipation & { challenge?: Challenge; user?: Omit<User, "password"> })[] {
    const pending = challengeParticipations.findMany(
      (p) => p.status === "submitted"
    );

    return pending.map((p) => {
      const challenge = challenges.findById(p.challengeId);
      const user = users.findById(p.userId);
      const safeUser = user
        ? (({ password, ...rest }) => rest)(user)
        : undefined;
      return { ...p, challenge, user: safeUser };
    });
  }

  /** Approve a challenge participation — award XP to the user. */
  approveChallengeParticipation(
    id: number,
    xpAwarded: number
  ): ChallengeParticipation {
    const participation = challengeParticipations.findById(id);
    if (!participation) {
      throw new ServiceError("Challenge participation not found", 404);
    }

    if (participation.status !== "submitted") {
      throw new ServiceError(
        `Cannot approve — current status is '${participation.status}'`,
        400
      );
    }

    const updated = challengeParticipations.update(id, {
      status: "approved",
      xpAwarded,
    });

    // Add XP to user's totalXp
    const user = users.findById(participation.userId);
    if (user) {
      users.update(user.id, {
        totalXp: user.totalXp + xpAwarded,
        updatedAt: new Date(),
      });
    }

    return updated!;
  }

  /** Reject a challenge participation. */
  rejectChallengeParticipation(id: number): ChallengeParticipation {
    const participation = challengeParticipations.findById(id);
    if (!participation) {
      throw new ServiceError("Challenge participation not found", 404);
    }

    if (participation.status !== "submitted") {
      throw new ServiceError(
        `Cannot reject — current status is '${participation.status}'`,
        400
      );
    }

    const updated = challengeParticipations.update(id, {
      status: "rejected",
    });

    return updated!;
  }

  // ────────────────────────────────────────────
  // Badges
  // ────────────────────────────────────────────

  /** Create a new badge. */
  createBadge(data: CreateBadgeInput): Badge {
    const badge = badges.create({
      name: data.name,
      description: data.description,
      unlockRule: data.unlockRule,
      icon: data.icon ?? null,
      createdAt: new Date(),
    });
    return badge;
  }

  /** Get all badges. */
  getAllBadges(): Badge[] {
    return badges.findAll();
  }

  /** Get badges earned by a user, joined with badge details. */
  getUserBadges(userId: number): UserBadgeWithDetails[] {
    const ubs = userBadges.findMany((ub) => ub.userId === userId);

    return ubs.map((ub) => {
      const badge = badges.findById(ub.badgeId);
      return { ...ub, badge };
    });
  }

  /** Award a badge to a user. */
  awardBadge(userId: number, badgeId: number): UserBadge {
    // Ensure badge exists
    const badge = badges.findById(badgeId);
    if (!badge) {
      throw new ServiceError("Badge not found", 404);
    }

    // Ensure user exists
    const user = users.findById(userId);
    if (!user) {
      throw new ServiceError("User not found", 404);
    }

    // Check not already awarded
    const existing = userBadges.findOne(
      (ub) => ub.userId === userId && ub.badgeId === badgeId
    );
    if (existing) {
      throw new ServiceError(
        "Badge has already been awarded to this user",
        409
      );
    }

    const ub = userBadges.create({
      userId,
      badgeId,
      earnedAt: new Date(),
    });

    return ub;
  }

  // ────────────────────────────────────────────
  // Rewards
  // ────────────────────────────────────────────

  /** Create a new reward. */
  createReward(data: CreateRewardInput): Reward {
    const reward = rewards.create({
      name: data.name,
      description: data.description,
      pointsRequired: data.pointsRequired,
      stock: data.stock,
      createdAt: new Date(),
    });
    return reward;
  }

  /** Get all rewards. */
  getRewards(): Reward[] {
    return rewards.findAll();
  }

  /** Redeem a reward — deduct XP, decrement stock, create redemption. */
  redeemReward(
    userId: number,
    rewardId: number
  ): { redemption: RewardRedemption; remainingPoints: number } {
    // Check reward exists
    const reward = rewards.findById(rewardId);
    if (!reward) {
      throw new ServiceError("Reward not found", 404);
    }

    // Check stock
    if (reward.stock <= 0) {
      throw new ServiceError("This reward is out of stock", 400);
    }

    // Check user
    const user = users.findById(userId);
    if (!user) {
      throw new ServiceError("User not found", 404);
    }

    // Check sufficient points
    if (user.totalXp < reward.pointsRequired) {
      throw new ServiceError(
        `Insufficient points — you have ${user.totalXp} XP but need ${reward.pointsRequired}`,
        400
      );
    }

    // Deduct points from user
    const remainingPoints = user.totalXp - reward.pointsRequired;
    users.update(user.id, {
      totalXp: remainingPoints,
      updatedAt: new Date(),
    });

    // Decrement stock
    rewards.update(rewardId, { stock: reward.stock - 1 });

    // Create redemption record
    const redemption = rewardRedemptions.create({
      userId,
      rewardId,
      redeemedAt: new Date(),
    });

    return { redemption, remainingPoints };
  }

  // ────────────────────────────────────────────
  // Leaderboard
  // ────────────────────────────────────────────

  /**
   * Get leaderboard sorted by totalXp DESC.
   * Returns paginated results with rank, badge count, etc.
   */
  getLeaderboard(
    limit: number = 100,
    offset: number = 0
  ): { items: LeaderboardEntry[]; total: number; limit: number; offset: number } {
    // Get all active users sorted by totalXp DESC
    const activeUsers = users
      .findMany((u) => u.isActive)
      .sort((a, b) => b.totalXp - a.totalXp);

    const total = activeUsers.length;

    // Build ranked entries for the full list first so ranks are global
    const rankedAll: LeaderboardEntry[] = activeUsers.map((u, idx) => ({
      rank: idx + 1,
      userId: u.id,
      name: u.name,
      email: u.email,
      departmentId: u.departmentId,
      totalXp: u.totalXp,
      badgeCount: userBadges.count((ub) => ub.userId === u.id),
    }));

    // Paginate
    const items = rankedAll.slice(offset, offset + limit);

    return { items, total, limit, offset };
  }

  /**
   * Get a specific user's rank position on the leaderboard.
   * Returns rank, XP, badge count, and next XP milestone.
   */
  getUserRank(userId: number): UserRankResult {
    const user = users.findById(userId);
    if (!user) {
      throw new ServiceError("User not found", 404);
    }

    // Sort all active users by totalXp DESC
    const activeUsers = users
      .findMany((u) => u.isActive)
      .sort((a, b) => b.totalXp - a.totalXp);

    // Find rank (1-indexed)
    const rank =
      activeUsers.findIndex((u) => u.id === userId) + 1 || activeUsers.length;

    const badgeCount = userBadges.count((ub) => ub.userId === userId);

    // Calculate next milestone (next 100 XP boundary above current)
    const milestoneStep = 100;
    const nextMilestone =
      Math.ceil((user.totalXp + 1) / milestoneStep) * milestoneStep;

    return {
      rank,
      totalXp: user.totalXp,
      badgeCount,
      nextMilestone,
    };
  }
}
