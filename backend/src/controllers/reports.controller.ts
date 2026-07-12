// ──────────────────────────────────────────────
// Reports Controller
// ──────────────────────────────────────────────

import { Request, Response } from "express";
import { ReportsService } from "../services/reports.service.js";

export class ReportsController {
  private service = new ReportsService();

  // GET /department-scores?departmentId=&date=
  getDepartmentScores = async (req: Request, res: Response): Promise<void> => {
    try {
      const departmentId = req.query.departmentId
        ? Number(req.query.departmentId)
        : undefined;
      const date = req.query.date as string | undefined;

      const scores = this.service.getDepartmentScores(departmentId, date);
      res.json({ success: true, data: scores });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  // POST /calculate-scores
  calculateScores = async (req: Request, res: Response): Promise<void> => {
    try {
      const scores = this.service.calculateScores();
      res.status(201).json({ success: true, data: scores });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  // GET /report/environmental?startDate=&endDate=&departmentId=
  getEnvironmentalReport = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { startDate, endDate, departmentId } = this.parseReportQuery(req);
      const report = this.service.getEnvironmentalReport(
        startDate,
        endDate,
        departmentId
      );
      res.json({ success: true, data: report });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  // GET /report/social?startDate=&endDate=&departmentId=
  getSocialReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate, departmentId } = this.parseReportQuery(req);
      const report = this.service.getSocialReport(
        startDate,
        endDate,
        departmentId
      );
      res.json({ success: true, data: report });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  // GET /report/governance?startDate=&endDate=&departmentId=
  getGovernanceReport = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { startDate, endDate, departmentId } = this.parseReportQuery(req);
      const report = this.service.getGovernanceReport(
        startDate,
        endDate,
        departmentId
      );
      res.json({ success: true, data: report });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  // GET /report/custom?startDate=&endDate=&modules=environmental,social&departmentId=
  getCustomReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate, departmentId } = this.parseReportQuery(req);
      const modulesParam = req.query.modules as string | undefined;

      if (!modulesParam) {
        res.status(400).json({
          success: false,
          error:
            "modules query parameter is required (comma-separated: environmental,social,governance,scores)",
        });
        return;
      }

      const modules = modulesParam.split(",").map((m) => m.trim());
      const report = this.service.getCustomReport(
        startDate,
        endDate,
        modules,
        departmentId
      );
      res.json({ success: true, data: report });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  // GET /export/csv?reportType=&startDate=&endDate=&departmentId=
  exportCsv = async (req: Request, res: Response): Promise<void> => {
    try {
      const reportType = req.query.reportType as string | undefined;
      if (!reportType) {
        res.status(400).json({
          success: false,
          error:
            "reportType query parameter is required (environmental, social, governance, scores)",
        });
        return;
      }

      const { startDate, endDate, departmentId } = this.parseReportQuery(req);
      const csv = this.service.exportCsv(reportType, {
        startDate,
        endDate,
        departmentId,
      });

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${reportType}-report.csv`
      );
      res.send(csv);
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  // GET /export/pdf?reportType=&startDate=&endDate=&departmentId=
  exportPdf = async (req: Request, res: Response): Promise<void> => {
    try {
      const reportType = req.query.reportType as string | undefined;
      if (!reportType) {
        res.status(400).json({
          success: false,
          error: "reportType query parameter is required",
        });
        return;
      }

      const { startDate, endDate, departmentId } = this.parseReportQuery(req);

      // Build the JSON data that would be rendered to PDF
      let data: unknown;
      switch (reportType) {
        case "environmental":
          data = this.service.getEnvironmentalReport(
            startDate,
            endDate,
            departmentId
          );
          break;
        case "social":
          data = this.service.getSocialReport(
            startDate,
            endDate,
            departmentId
          );
          break;
        case "governance":
          data = this.service.getGovernanceReport(
            startDate,
            endDate,
            departmentId
          );
          break;
        case "scores":
          data = this.service.getDepartmentScores(departmentId);
          break;
        default: {
          res.status(400).json({
            success: false,
            error: `Unknown report type: ${reportType}`,
          });
          return;
        }
      }

      res.json({
        success: true,
        message:
          "PDF export requires a PDF library integration (e.g. pdfkit or puppeteer). Returning report data as JSON for now.",
        data,
      });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  // ── Private helper ────────────────────────

  private parseReportQuery(req: Request): {
    startDate: Date;
    endDate: Date;
    departmentId?: number;
  } {
    const startDateStr = req.query.startDate as string | undefined;
    const endDateStr = req.query.endDate as string | undefined;

    if (!startDateStr || !endDateStr) {
      const err: any = new Error(
        "startDate and endDate query parameters are required (ISO 8601 format)"
      );
      err.statusCode = 400;
      throw err;
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      const err: any = new Error(
        "startDate and endDate must be valid ISO 8601 dates"
      );
      err.statusCode = 400;
      throw err;
    }

    const departmentId = req.query.departmentId
      ? Number(req.query.departmentId)
      : undefined;

    return { startDate, endDate, departmentId };
  }
}
