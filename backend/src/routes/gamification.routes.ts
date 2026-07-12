// ──────────────────────────────────────────────
// Gamification Routes
// ──────────────────────────────────────────────

import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth.js";
import { adminOnly, fleetManagerOrAbove } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import { GamificationController } from "../controllers/gamification.controller.js";

const router = Router();
const controller = new GamificationController();

// ── Zod Schemas ───────────────────────────────

const createChallengeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  categoryId: z.number().int().optional(),
  description: z.string().min(1, "Description is required"),
  xpReward: z.number().int().positive("XP reward must be positive"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  deadline: z.coerce.date().optional(),
});

const updateChallengeSchema = z.object({
  title: z.string().min(1).optional(),
  categoryId: z.number().int().nullable().optional(),
  description: z.string().min(1).optional(),
  xpReward: z.number().int().positive().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  deadline: z.coerce.date().nullable().optional(),
  status: z.enum(["active", "completed", "expired"]).optional(),
});

const joinChallengeSchema = z.object({
  challengeId: z.number().int(),
});

const submitChallengeSchema = z.object({
  challengeParticipationId: z.number().int(),
  proof: z.string().min(1, "Proof is required"),
});

const approveChallengeSchema = z.object({
  xpAwarded: z.number().int().min(0, "XP awarded must be non-negative"),
});

const createBadgeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  unlockRule: z.string().min(1, "Unlock rule is required"),
  icon: z.string().optional(),
});

const createRewardSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  pointsRequired: z.number().int().positive("Points required must be positive"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
});

const redeemRewardSchema = z.object({
  rewardId: z.number().int(),
});

// ── Challenge Routes ──────────────────────────

// GET  /challenges — list active challenges (any authenticated user)
router.get("/challenges", authenticate, controller.getChallenges);

// POST /challenges — create a challenge (admin only)
router.post(
  "/challenges",
  authenticate,
  adminOnly,
  validate(createChallengeSchema),
  controller.createChallenge
);

// PUT  /challenges/:id — update a challenge (admin only)
router.put(
  "/challenges/:id",
  authenticate,
  adminOnly,
  validate(updateChallengeSchema),
  controller.updateChallenge
);

// ── Challenge Participation Routes ────────────

// POST /join-challenge — join a challenge
router.post(
  "/join-challenge",
  authenticate,
  validate(joinChallengeSchema),
  controller.joinChallenge
);

// POST /submit-challenge — submit proof for a participation
router.post(
  "/submit-challenge",
  authenticate,
  validate(submitChallengeSchema),
  controller.submitChallenge
);

// GET  /my-challenges — get current user's participations
router.get("/my-challenges", authenticate, controller.getUserChallenges);

// GET  /pending-challenge-approvals — submitted participations awaiting review
router.get(
  "/pending-challenge-approvals",
  authenticate,
  fleetManagerOrAbove,
  controller.getPendingChallengeApprovals
);

// PUT  /challenge-participations/:id/approve — approve a participation
router.put(
  "/challenge-participations/:id/approve",
  authenticate,
  fleetManagerOrAbove,
  validate(approveChallengeSchema),
  controller.approveChallengeParticipation
);

// PUT  /challenge-participations/:id/reject — reject a participation
router.put(
  "/challenge-participations/:id/reject",
  authenticate,
  fleetManagerOrAbove,
  controller.rejectChallengeParticipation
);

// ── Badge Routes ──────────────────────────────

// GET  /badges — list all badges
router.get("/badges", authenticate, controller.getAllBadges);

// POST /badges — create a badge (admin only)
router.post(
  "/badges",
  authenticate,
  adminOnly,
  validate(createBadgeSchema),
  controller.createBadge
);

// GET  /my-badges — current user's earned badges
router.get("/my-badges", authenticate, controller.getMyBadges);

// ── Reward Routes ─────────────────────────────

// GET  /rewards — list all rewards
router.get("/rewards", authenticate, controller.getRewards);

// POST /rewards — create a reward (admin only)
router.post(
  "/rewards",
  authenticate,
  adminOnly,
  validate(createRewardSchema),
  controller.createReward
);

// POST /redeem-reward — redeem a reward
router.post(
  "/redeem-reward",
  authenticate,
  validate(redeemRewardSchema),
  controller.redeemReward
);

// ── Leaderboard Routes ────────────────────────

// GET  /leaderboard — paginated leaderboard
router.get("/leaderboard", authenticate, controller.getLeaderboard);

// GET  /my-rank — current user's rank
router.get("/my-rank", authenticate, controller.getMyRank);

export default router;
