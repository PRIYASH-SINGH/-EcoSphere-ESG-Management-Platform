import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth.js";
import { adminOnly, fleetManagerOrAbove } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import { EnvironmentalController } from "../controllers/environmental.controller.js";

const router = Router();
const controller = new EnvironmentalController();

// ── Zod Schemas ───────────────────────────────

const createEmissionFactorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  factor: z.number().positive("Factor must be a positive number"),
  unit: z.string().min(1, "Unit is required"),
  categoryId: z.number().int().positive().optional(),
});

const updateEmissionFactorSchema = z.object({
  name: z.string().min(1).optional(),
  factor: z.number().positive().optional(),
  unit: z.string().min(1).optional(),
  categoryId: z.number().int().positive().nullable().optional(),
});

const createCarbonTransactionSchema = z.object({
  source: z.string().min(1, "Source is required"),
  emissionFactorId: z.number().int().positive("Emission factor ID is required"),
  value: z.number().positive("Value must be a positive number"),
  departmentId: z.number().int().positive("Department ID is required"),
  date: z.string().min(1, "Date is required"),
  createdBy: z.number().int().positive("Created by user ID is required"),
});

const createGoalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  targetValue: z.number().positive("Target value must be a positive number"),
  departmentId: z.number().int().positive("Department ID is required"),
  deadline: z.string().min(1, "Deadline is required"),
});

const updateGoalProgressSchema = z.object({
  currentValue: z.number().min(0, "Current value must be non-negative"),
});

// ── Emission Factor Routes ────────────────────

router.get(
  "/emission-factors",
  authenticate,
  controller.getAllEmissionFactors
);

router.post(
  "/emission-factors",
  authenticate,
  adminOnly,
  validate(createEmissionFactorSchema),
  controller.createEmissionFactor
);

router.put(
  "/emission-factors/:id",
  authenticate,
  adminOnly,
  validate(updateEmissionFactorSchema),
  controller.updateEmissionFactor
);

router.delete(
  "/emission-factors/:id",
  authenticate,
  adminOnly,
  controller.deleteEmissionFactor
);

// ── Carbon Transaction Routes ─────────────────

router.get(
  "/carbon-transactions",
  authenticate,
  controller.getCarbonTransactions
);

router.post(
  "/carbon-transactions",
  authenticate,
  fleetManagerOrAbove,
  validate(createCarbonTransactionSchema),
  controller.createCarbonTransaction
);

// ── Carbon Summary Route ──────────────────────

router.get(
  "/carbon-summary",
  authenticate,
  controller.getCarbonSummary
);

// ── Environmental Goal Routes ─────────────────

router.get(
  "/environmental-goals",
  authenticate,
  controller.getGoals
);

router.post(
  "/environmental-goals",
  authenticate,
  adminOnly,
  validate(createGoalSchema),
  controller.createGoal
);

router.put(
  "/environmental-goals/:id/progress",
  authenticate,
  fleetManagerOrAbove,
  validate(updateGoalProgressSchema),
  controller.updateGoalProgress
);

export default router;
