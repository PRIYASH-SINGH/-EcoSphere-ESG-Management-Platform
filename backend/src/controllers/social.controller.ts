import { Request, Response } from "express";
import { SocialService } from "../services/social.service.js";

export class SocialController {
  private service = new SocialService();

  // ─── CSR Activities ───────────────────────

  createCsrActivity = async (req: Request, res: Response): Promise<void> => {
    try {
      const activity = await this.service.createCsrActivity(req.body);
      res.status(201).json({ success: true, data: activity });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  getAllCsrActivities = async (_req: Request, res: Response): Promise<void> => {
    try {
      const activities = await this.service.getAllCsrActivities();
      res.json({ success: true, data: activities });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  updateCsrActivity = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, error: "Invalid activity ID" });
        return;
      }
      const updated = await this.service.updateCsrActivity(id, req.body);
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  // ─── Participation ────────────────────────

  participateInCsr = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { csrActivityId, proof } = req.body;
      const participation = await this.service.participateInCsr(userId, csrActivityId, proof);
      res.status(201).json({ success: true, data: participation });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  getUserParticipations = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const participations = await this.service.getUserParticipations(userId);
      res.json({ success: true, data: participations });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  getPendingApprovals = async (_req: Request, res: Response): Promise<void> => {
    try {
      const pending = await this.service.getPendingApprovals();
      res.json({ success: true, data: pending });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  approveParticipation = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, error: "Invalid participation ID" });
        return;
      }
      const approvedBy = req.user!.id;
      const { pointsEarned } = req.body;
      const result = await this.service.approveParticipation(id, approvedBy, pointsEarned);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  rejectParticipation = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, error: "Invalid participation ID" });
        return;
      }
      const approvedBy = req.user!.id;
      const result = await this.service.rejectParticipation(id, approvedBy);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  // ─── Diversity Metrics ────────────────────

  getDiversityMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      const departmentId = req.query.departmentId
        ? parseInt(req.query.departmentId as string, 10)
        : undefined;
      const metrics = await this.service.getDiversityMetrics(departmentId);
      res.json({ success: true, data: metrics });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  createDiversityMetric = async (req: Request, res: Response): Promise<void> => {
    try {
      const metric = await this.service.createDiversityMetric(req.body);
      res.status(201).json({ success: true, data: metric });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };
}
