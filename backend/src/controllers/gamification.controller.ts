// ──────────────────────────────────────────────
// Gamification Controller
// ──────────────────────────────────────────────

import { Request, Response } from "express";
import { GamificationService } from "../services/gamification.service.js";

export class GamificationController {
  private service = new GamificationService();

  // ────────────────────────────────────────────
  // Challenges
  // ────────────────────────────────────────────

  /** GET /challenges — list active challenges (with user participation if logged in) */
  getChallenges = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const result = this.service.getChallenges(userId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  /** POST /challenges — create a challenge (admin only) */
  createChallenge = async (req: Request, res: Response): Promise<void> => {
    try {
      const challenge = this.service.createChallenge(req.body);
      res.status(201).json({ success: true, data: challenge });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  /** PUT /challenges/:id — update a challenge (admin only) */
  updateChallenge = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, error: "Invalid challenge id" });
        return;
      }
      const updated = this.service.updateChallenge(id, req.body);
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  // ────────────────────────────────────────────
  // Challenge Participation
  // ────────────────────────────────────────────

  /** POST /join-challenge — join a challenge */
  joinChallenge = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { challengeId } = req.body;
      const participation = this.service.joinChallenge(userId, challengeId);
      res.status(201).json({ success: true, data: participation });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  /** POST /submit-challenge — submit proof for a participation */
  submitChallenge = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { challengeParticipationId, proof } = req.body;
      const result = this.service.submitChallenge(
        userId,
        challengeParticipationId,
        proof
      );
      res.json({ success: true, data: result });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  /** GET /my-challenges — get current user's challenge participations */
  getUserChallenges = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const result = this.service.getUserChallenges(userId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  /** GET /pending-challenge-approvals — list submitted participations */
  getPendingChallengeApprovals = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result = this.service.getPendingChallengeApprovals();
      res.json({ success: true, data: result });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  /** PUT /challenge-participations/:id/approve */
  approveChallengeParticipation = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res
          .status(400)
          .json({ success: false, error: "Invalid participation id" });
        return;
      }
      const { xpAwarded } = req.body;
      const result = this.service.approveChallengeParticipation(id, xpAwarded);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  /** PUT /challenge-participations/:id/reject */
  rejectChallengeParticipation = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res
          .status(400)
          .json({ success: false, error: "Invalid participation id" });
        return;
      }
      const result = this.service.rejectChallengeParticipation(id);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  // ────────────────────────────────────────────
  // Badges
  // ────────────────────────────────────────────

  /** GET /badges — list all badges */
  getAllBadges = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = this.service.getAllBadges();
      res.json({ success: true, data: result });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  /** POST /badges — create a badge (admin only) */
  createBadge = async (req: Request, res: Response): Promise<void> => {
    try {
      const badge = this.service.createBadge(req.body);
      res.status(201).json({ success: true, data: badge });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  /** GET /my-badges — get current user's earned badges */
  getMyBadges = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const result = this.service.getUserBadges(userId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  // ────────────────────────────────────────────
  // Rewards
  // ────────────────────────────────────────────

  /** GET /rewards — list all rewards */
  getRewards = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = this.service.getRewards();
      res.json({ success: true, data: result });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  /** POST /rewards — create a reward (admin only) */
  createReward = async (req: Request, res: Response): Promise<void> => {
    try {
      const reward = this.service.createReward(req.body);
      res.status(201).json({ success: true, data: reward });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  /** POST /redeem-reward — redeem a reward using XP */
  redeemReward = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { rewardId } = req.body;
      const result = this.service.redeemReward(userId, rewardId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  // ────────────────────────────────────────────
  // Leaderboard
  // ────────────────────────────────────────────

  /** GET /leaderboard — paginated leaderboard */
  getLeaderboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string, 10) || 100;
      const offset = parseInt(req.query.offset as string, 10) || 0;
      const result = this.service.getLeaderboard(limit, offset);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  /** GET /my-rank — current user's rank */
  getMyRank = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const result = this.service.getUserRank(userId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };
}
