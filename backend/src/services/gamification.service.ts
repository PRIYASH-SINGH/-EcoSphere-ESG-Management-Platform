import prisma from "../database/prisma.js";
import type { Challenge, ChallengeParticipation, Badge, UserBadge, Reward, RewardRedemption, User } from "@prisma/client";

// ── Helper ─────────────────────────────────────

function throwError(message: string, statusCode: number): never {
  const error: any = new Error(message);
  error.statusCode = statusCode;
  throw error;
}

// ── Input types ────────────────────────────────

interface CreateChallengeInput {
  title: string;
  categoryId?: number | null;
  description: string;
  xpReward: number;
  difficulty: string;
  deadline?: Date | null;
}

interface UpdateChallengeInput {
  title?: string;
  categoryId?: number | null;
  description?: string;
  xpReward?: number;
  difficulty?: string;
  deadline?: Date | null;
  status?: string;
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

interface LeaderboardEntry {
  rank: number;
  userId: number;
  name: string;
  email: string;
  departmentId: number | null;
  totalXp: number;
  badgeCount: number;
}

// ── Service ────────────────────────────────────

export class GamificationService {
  // ── Challenges ──────────────────────────────

  async createChallenge(data: CreateChallengeInput): Promise<Challenge> {
    return prisma.challenge.create({
      data: {
        title: data.title,
        categoryId: data.categoryId ?? null,
        description: data.description,
        xpReward: data.xpReward,
        difficulty: data.difficulty as any,
        deadline: data.deadline ?? null,
        status: "active",
      },
    });
  }

  async getChallenges(userId?: number): Promise<(Challenge & { participation: ChallengeParticipation | null })[]> {
    const activeChallenges = await prisma.challenge.findMany({
      where: { status: "active" },
      orderBy: { createdAt: "asc" },
    });

    if (userId === undefined) {
      return activeChallenges.map((c) => ({ ...c, participation: null }));
    }

    const userParticipations = await prisma.challengeParticipation.findMany({
      where: { userId },
    });
    const participationMap = new Map<number, ChallengeParticipation>();
    for (const p of userParticipations) {
      participationMap.set(p.challengeId, p);
    }

    return activeChallenges.map((c) => ({
      ...c,
      participation: participationMap.get(c.id) ?? null,
    }));
  }

  async updateChallenge(id: number, data: UpdateChallengeInput): Promise<Challenge> {
    const existing = await prisma.challenge.findUnique({ where: { id } });
    if (!existing) throwError("Challenge not found", 404);

    return prisma.challenge.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId ?? null }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.xpReward !== undefined && { xpReward: data.xpReward }),
        ...(data.difficulty !== undefined && { difficulty: data.difficulty as any }),
        ...(data.deadline !== undefined && { deadline: data.deadline ?? null }),
        ...(data.status !== undefined && { status: data.status as any }),
      },
    });
  }

  // ── Challenge Participation ──────────────────

  async joinChallenge(userId: number, challengeId: number): Promise<ChallengeParticipation> {
    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
    if (!challenge) throwError("Challenge not found", 404);

    const existing = await prisma.challengeParticipation.findUnique({
      where: { userId_challengeId: { userId, challengeId } },
    });
    if (existing) throwError("You have already joined this challenge", 409);

    return prisma.challengeParticipation.create({
      data: {
        userId,
        challengeId,
        proof: null,
        status: "started",
        xpAwarded: 0,
      },
    });
  }

  async submitChallenge(
    userId: number,
    challengeParticipationId: number,
    proof: string
  ): Promise<ChallengeParticipation> {
    const participation = await prisma.challengeParticipation.findUnique({
      where: { id: challengeParticipationId },
    });
    if (!participation) throwError("Challenge participation not found", 404);
    if (participation!.userId !== userId) throwError("This participation does not belong to you", 403);
    if (participation!.status !== "started") {
      throwError(`Cannot submit — current status is '${participation!.status}'`, 400);
    }

    return prisma.challengeParticipation.update({
      where: { id: challengeParticipationId },
      data: { status: "submitted", proof },
    });
  }

  async getUserChallenges(userId: number): Promise<(ChallengeParticipation & { challenge: Challenge | null })[]> {
    return prisma.challengeParticipation.findMany({
      where: { userId },
      include: { challenge: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async getPendingChallengeApprovals(): Promise<
    (ChallengeParticipation & { challenge: Challenge | null; user: Omit<User, "password"> | null })[]
  > {
    const pending = await prisma.challengeParticipation.findMany({
      where: { status: "submitted" },
      include: {
        challenge: true,
        user: true,
      },
    });

    return pending.map(({ user, ...rest }) => {
      if (!user) return { ...rest, user: null };
      const { password, ...safeUser } = user;
      return { ...rest, user: safeUser };
    });
  }

  async approveChallengeParticipation(id: number, xpAwarded: number): Promise<ChallengeParticipation> {
    const participation = await prisma.challengeParticipation.findUnique({ where: { id } });
    if (!participation) throwError("Challenge participation not found", 404);
    if (participation!.status !== "submitted") {
      throwError(`Cannot approve — current status is '${participation!.status}'`, 400);
    }

    const [updated] = await prisma.$transaction([
      prisma.challengeParticipation.update({
        where: { id },
        data: { status: "approved", xpAwarded },
      }),
      prisma.user.update({
        where: { id: participation!.userId },
        data: { totalXp: { increment: xpAwarded } },
      }),
    ]);

    return updated;
  }

  async rejectChallengeParticipation(id: number): Promise<ChallengeParticipation> {
    const participation = await prisma.challengeParticipation.findUnique({ where: { id } });
    if (!participation) throwError("Challenge participation not found", 404);
    if (participation!.status !== "submitted") {
      throwError(`Cannot reject — current status is '${participation!.status}'`, 400);
    }

    return prisma.challengeParticipation.update({
      where: { id },
      data: { status: "rejected" },
    });
  }

  // ── Badges ──────────────────────────────────

  async createBadge(data: CreateBadgeInput): Promise<Badge> {
    return prisma.badge.create({
      data: {
        name: data.name,
        description: data.description,
        unlockRule: data.unlockRule,
        icon: data.icon ?? null,
      },
    });
  }

  async getAllBadges(): Promise<Badge[]> {
    return prisma.badge.findMany({ orderBy: { createdAt: "asc" } });
  }

  async getUserBadges(userId: number): Promise<(UserBadge & { badge: Badge | null })[]> {
    return prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: "desc" },
    });
  }

  async awardBadge(userId: number, badgeId: number): Promise<UserBadge> {
    const badge = await prisma.badge.findUnique({ where: { id: badgeId } });
    if (!badge) throwError("Badge not found", 404);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throwError("User not found", 404);

    const existing = await prisma.userBadge.findUnique({
      where: { userId_badgeId: { userId, badgeId } },
    });
    if (existing) throwError("Badge has already been awarded to this user", 409);

    return prisma.userBadge.create({
      data: { userId, badgeId },
    });
  }

  // ── Rewards ──────────────────────────────────

  async createReward(data: CreateRewardInput): Promise<Reward> {
    return prisma.reward.create({
      data: {
        name: data.name,
        description: data.description,
        pointsRequired: data.pointsRequired,
        stock: data.stock,
      },
    });
  }

  async getRewards(): Promise<Reward[]> {
    return prisma.reward.findMany({ orderBy: { createdAt: "asc" } });
  }

  async redeemReward(
    userId: number,
    rewardId: number
  ): Promise<{ redemption: RewardRedemption; remainingPoints: number }> {
    const reward = await prisma.reward.findUnique({ where: { id: rewardId } });
    if (!reward) throwError("Reward not found", 404);
    if (reward!.stock <= 0) throwError("This reward is out of stock", 400);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throwError("User not found", 404);
    if (user!.totalXp < reward!.pointsRequired) {
      throwError(
        `Insufficient points — you have ${user!.totalXp} XP but need ${reward!.pointsRequired}`,
        400
      );
    }

    const remainingPoints = user!.totalXp - reward!.pointsRequired;

    const [redemption] = await prisma.$transaction([
      prisma.rewardRedemption.create({
        data: { userId, rewardId },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { totalXp: remainingPoints },
      }),
      prisma.reward.update({
        where: { id: rewardId },
        data: { stock: { decrement: 1 } },
      }),
    ]);

    return { redemption, remainingPoints };
  }

  // ── Leaderboard ──────────────────────────────

  async getLeaderboard(
    limit: number = 100,
    offset: number = 0
  ): Promise<{ items: LeaderboardEntry[]; total: number; limit: number; offset: number }> {
    const total = await prisma.user.count({ where: { isActive: true } });

    const activeUsers = await prisma.user.findMany({
      where: { isActive: true },
      orderBy: { totalXp: "desc" },
      skip: offset,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        departmentId: true,
        totalXp: true,
        _count: { select: { userBadges: true } },
      },
    });

    const items: LeaderboardEntry[] = activeUsers.map((u, idx) => ({
      rank: offset + idx + 1,
      userId: u.id,
      name: u.name,
      email: u.email,
      departmentId: u.departmentId,
      totalXp: u.totalXp,
      badgeCount: u._count.userBadges,
    }));

    return { items, total, limit, offset };
  }

  async getUserRank(userId: number): Promise<{
    rank: number;
    totalXp: number;
    badgeCount: number;
    nextMilestone: number;
  }> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throwError("User not found", 404);

    // Count users with more XP than this user to determine rank
    const usersAbove = await prisma.user.count({
      where: { isActive: true, totalXp: { gt: user!.totalXp } },
    });
    const rank = usersAbove + 1;

    const badgeCount = await prisma.userBadge.count({ where: { userId } });

    const milestoneStep = 100;
    const nextMilestone = Math.ceil((user!.totalXp + 1) / milestoneStep) * milestoneStep;

    return { rank, totalXp: user!.totalXp, badgeCount, nextMilestone };
  }
}
