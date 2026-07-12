import { Request, Response } from "express";
import { GovernanceService } from "../services/governance.service.js";

export class GovernanceController {
  private service = new GovernanceService();

  // ── Policy Acknowledgements ─────────────────

  acknowledgePolicy = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { policyName } = req.body;

      const acknowledgement = this.service.acknowledgePolicy(userId, policyName);
      res.status(201).json({ success: true, data: acknowledgement });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  getAllAcknowledgements = async (req: Request, res: Response): Promise<void> => {
    try {
      const acknowledgements = this.service.getAllAcknowledgements();
      res.json({ success: true, data: acknowledgements });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  getMyPolicies = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const policies = this.service.getUserPolicies(userId);
      res.json({ success: true, data: policies });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  // ── Audits ──────────────────────────────────

  createAudit = async (req: Request, res: Response): Promise<void> => {
    try {
      const audit = this.service.createAudit(req.body);
      res.status(201).json({ success: true, data: audit });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  getAudits = async (req: Request, res: Response): Promise<void> => {
    try {
      const auditList = this.service.getAudits();
      res.json({ success: true, data: auditList });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  updateAudit = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, error: "Invalid audit id" });
        return;
      }

      const audit = this.service.updateAudit(id, req.body);
      res.json({ success: true, data: audit });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  // ── Compliance Issues ───────────────────────

  createComplianceIssue = async (req: Request, res: Response): Promise<void> => {
    try {
      const issue = this.service.createComplianceIssue(req.body);
      res.status(201).json({ success: true, data: issue });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  getComplianceIssues = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters: { severity?: string; status?: string } = {};
      if (req.query.severity) filters.severity = req.query.severity as string;
      if (req.query.status) filters.status = req.query.status as string;

      const issues = this.service.getComplianceIssues(filters as any);
      res.json({ success: true, data: issues });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  updateComplianceIssue = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, error: "Invalid compliance issue id" });
        return;
      }

      const issue = this.service.updateComplianceIssue(id, req.body);
      res.json({ success: true, data: issue });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };
}
