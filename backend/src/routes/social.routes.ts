import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth.js";
import { adminOnly, fleetManagerOrAbove } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import { SocialController } from "../controllers/social.controller.js";

const router = Router();
const controller = new SocialController();

// ── Zod Schemas ───────────────────────────────

const createCsrActivitySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  categoryId: z.number().int().positive().optional(),
});

const updateCsrActivitySchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  startDate: z.string().min(1).optional(),
  endDate: z.string().min(1).optional(),
  categoryId: z.number().int().positive().nullable().optional(),
  status: z.enum(["upcoming", "active", "completed"]).optional(),
});

const participateCsrSchema = z.object({
  csrActivityId: z.number().int().positive("CSR Activity ID is required"),
  proof: z.string().optional(),
});

const approveParticipationSchema = z.object({
  pointsEarned: z.number().min(0, "Points must be non-negative"),
});

const createDiversityMetricSchema = z.object({
  metric: z.string().min(1, "Metric name is required"),
  value: z.number(),
  departmentId: z.number().int().positive().nullable().optional(),
  date: z.string().min(1, "Date is required"),
});

// ── CSR Activity Routes ───────────────────────

router.get(
  "/csr-activities",
  authenticate,
  controller.getAllCsrActivities
);

router.post(
  "/csr-activities",
  authenticate,
  adminOnly,
  validate(createCsrActivitySchema),
  controller.createCsrActivity
);

router.put(
  "/csr-activities/:id",
  authenticate,
  adminOnly,
  validate(updateCsrActivitySchema),
  controller.updateCsrActivity
);

// ── Participation Routes ──────────────────────

router.post(
  "/participate-csr",
  authenticate,
  validate(participateCsrSchema),
  controller.participateInCsr
);

router.get(
  "/my-participations",
  authenticate,
  controller.getUserParticipations
);

router.get(
  "/pending-approvals",
  authenticate,
  fleetManagerOrAbove,
  controller.getPendingApprovals
);

router.put(
  "/participations/:id/approve",
  authenticate,
  fleetManagerOrAbove,
  validate(approveParticipationSchema),
  controller.approveParticipation
);

router.put(
  "/participations/:id/reject",
  authenticate,
  fleetManagerOrAbove,
  controller.rejectParticipation
);

// ── Diversity Metric Routes ───────────────────

router.get(
  "/diversity-metrics",
  authenticate,
  controller.getDiversityMetrics
);

router.post(
  "/diversity-metrics",
  authenticate,
  adminOnly,
  validate(createDiversityMetricSchema),
  controller.createDiversityMetric
);

export default router;
