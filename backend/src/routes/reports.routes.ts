// ──────────────────────────────────────────────
// Reports Routes
// ──────────────────────────────────────────────

import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { adminOnly } from "../middleware/rbac.js";
import { ReportsController } from "../controllers/reports.controller.js";

const router = Router();
const controller = new ReportsController();

// ── Department scores ─────────────────────────
// GET /department-scores?departmentId=&date=
router.get("/department-scores", authenticate, controller.getDepartmentScores);

// POST /calculate-scores  (admin only)
router.post("/calculate-scores", authenticate, adminOnly, controller.calculateScores);

// ── ESG pillar reports ────────────────────────
// GET /report/environmental?startDate=&endDate=&departmentId=
router.get("/report/environmental", authenticate, controller.getEnvironmentalReport);

// GET /report/social?startDate=&endDate=&departmentId=
router.get("/report/social", authenticate, controller.getSocialReport);

// GET /report/governance?startDate=&endDate=&departmentId=
router.get("/report/governance", authenticate, controller.getGovernanceReport);

// GET /report/custom?startDate=&endDate=&modules=environmental,social&departmentId=
router.get("/report/custom", authenticate, controller.getCustomReport);

// ── Export ────────────────────────────────────
// GET /export/csv?reportType=&startDate=&endDate=&departmentId=
router.get("/export/csv", authenticate, controller.exportCsv);

// GET /export/pdf?reportType=&startDate=&endDate=&departmentId=
router.get("/export/pdf", authenticate, controller.exportPdf);

export default router;
