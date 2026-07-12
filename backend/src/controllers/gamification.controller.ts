import { Request, Response } from "express";
import { GamificationService } from "../services/gamification.service.js";

export class GamificationController {
  private service = new GamificationService();

  // ── Challenges ──────────────────────────────

  getChallenges = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const result = await this.service.getChallenges(userId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  createChallenge = async (req: Request, res: Response): Promise<void> => {
    try {
      const challenge = await this.service.createChallenge(req.body);
      res.status(201).json({ success: true, data: challenge });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  updateChallenge = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, error: "Invalid challenge id" });
        return;
      }
      const updated = await this.service.updateChallenge(id, req.body);
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  // ── Challenge Participation ──────────────────

  joinChallenge = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { challengeId } = req.body;
      const participation = await this.service.joinChallenge(userId, challengeId);
      res.status(201).json({ success: true, data: participation });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  submitChallenge = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { challengeParticipationId, proof } = req.body;
      const result = await this.service.submitChallenge(userId, challengeParticipationId, proof);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  getUserChallenges = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const result = await this.service.getUserChallenges(userId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  getPendingChallengeApprovals = async (_req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.getPendingChallengeApprovals();
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  approveChallengeParticipation = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, error: "Invalid participation id" });
        return;
      }
      const { xpAwarded } = req.body;
      const result = await this.service.approveChallengeParticipation(id, xpAwarded);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  rejectChallengeParticipation = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, error: "Invalid participation id" });
        return;
      }
      const result = await this.service.rejectChallengeParticipation(id);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  // ── Badges ──────────────────────────────────

  getAllBadges = async (_req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.getAllBadges();
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  createBadge = async (req: Request, res: Response): Promise<void> => {
    try {
      const badge = await this.service.createBadge(req.body);
      res.status(201).json({ success: true, data: badge });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  getMyBadges = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const result = await this.service.getUserBadges(userId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  // ── Rewards ──────────────────────────────────

  getRewards = async (_req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.getRewards();
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  createReward = async (req: Request, res: Response): Promise<void> => {
    try {
      const reward = await this.service.createReward(req.body);
      res.status(201).json({ success: true, data: reward });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  redeemReward = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { rewardId } = req.body;
      const result = await this.service.redeemReward(userId, rewardId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  // ── Leaderboard ──────────────────────────────

  getLeaderboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string, 10) || 100;
      const offset = parseInt(req.query.offset as string, 10) || 0;
      const result = await this.service.getLeaderboard(limit, offset);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  getMyRank = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const result = await this.service.getUserRank(userId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };
}
