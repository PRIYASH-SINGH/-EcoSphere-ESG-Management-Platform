import { Request, Response } from "express";
import { EnvironmentalService } from "../services/environmental.service.js";

export class EnvironmentalController {
  private service = new EnvironmentalService();

  // ─── Emission Factors ─────────────────────

  createEmissionFactor = async (req: Request, res: Response): Promise<void> => {
    try {
      const factor = await this.service.createEmissionFactor(req.body);
      res.status(201).json({ success: true, data: factor });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  getAllEmissionFactors = async (_req: Request, res: Response): Promise<void> => {
    try {
      const factors = await this.service.getAllEmissionFactors();
      res.json({ success: true, data: factors });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  updateEmissionFactor = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, error: "Invalid id parameter" });
        return;
      }
      const factor = await this.service.updateEmissionFactor(id, req.body);
      res.json({ success: true, data: factor });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  deleteEmissionFactor = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, error: "Invalid id parameter" });
        return;
      }
      await this.service.deleteEmissionFactor(id);
      res.json({ success: true, data: { message: "Emission factor deleted" } });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  // ─── Carbon Transactions ──────────────────

  createCarbonTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
      const transaction = await this.service.createCarbonTransaction(req.body);
      res.status(201).json({ success: true, data: transaction });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  getCarbonTransactions = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters: Record<string, any> = {};
      if (req.query.departmentId) filters.departmentId = parseInt(req.query.departmentId as string, 10);
      if (req.query.startDate) filters.startDate = req.query.startDate as string;
      if (req.query.endDate) filters.endDate = req.query.endDate as string;

      const transactions = await this.service.getCarbonTransactions(filters);
      res.json({ success: true, data: transactions });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  getCarbonSummary = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters: Record<string, any> = {};
      if (req.query.departmentId) filters.departmentId = parseInt(req.query.departmentId as string, 10);
      if (req.query.startDate) filters.startDate = req.query.startDate as string;
      if (req.query.endDate) filters.endDate = req.query.endDate as string;

      const summary = await this.service.getCarbonSummary(filters);
      res.json({ success: true, data: summary });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  // ─── Environmental Goals ──────────────────

  createGoal = async (req: Request, res: Response): Promise<void> => {
    try {
      const goal = await this.service.createGoal(req.body);
      res.status(201).json({ success: true, data: goal });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  getGoals = async (req: Request, res: Response): Promise<void> => {
    try {
      const departmentId = req.query.departmentId
        ? parseInt(req.query.departmentId as string, 10)
        : undefined;

      const goals = await this.service.getGoals(departmentId);
      res.json({ success: true, data: goals });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };

  updateGoalProgress = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, error: "Invalid id parameter" });
        return;
      }
      const goal = await this.service.updateGoalProgress(id, req.body.currentValue);
      res.json({ success: true, data: goal });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
  };
}
