import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth.js";
import { adminOnly, fleetManagerOrAbove } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import { GovernanceController } from "../controllers/governance.controller.js";

const router = Router();
const controller = new GovernanceController();

// ── Zod Schemas ───────────────────────────────

const acknowledgePolicySchema = z.object({
  policyName: z.string().min(1, "Policy name is required"),
});

const createAuditSchema = z.object({
  title: z.string().min(1, "Title is required"),
  departmentId: z.number().int().positive("Department ID must be a positive integer"),
  auditor: z.string().min(1, "Auditor name is required"),
  auditDate: z.string().min(1, "Audit date is required"),
  findings: z.string().nullable().optional(),
});

const updateAuditSchema = z.object({
  title: z.string().min(1).optional(),
  departmentId: z.number().int().positive().optional(),
  auditor: z.string().min(1).optional(),
  auditDate: z.string().min(1).optional(),
  findings: z.string().nullable().optional(),
  status: z.enum(["scheduled", "in_progress", "completed"]).optional(),
});

const createComplianceIssueSchema = z.object({
  auditId: z.number().int().positive().nullable().optional(),
  severity: z.enum(["low", "medium", "high", "critical"]),
  description: z.string().min(1, "Description is required"),
  owner: z.string().min(1, "Owner is required"),
  dueDate: z.string().min(1, "Due date is required"),
});

const updateComplianceIssueSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved", "closed"]),
});

// ── Policy Acknowledgement Routes ─────────────

router.post(
  "/acknowledge-policy",
  authenticate,
  validate(acknowledgePolicySchema),
  controller.acknowledgePolicy
);

router.get(
  "/policy-acknowledgements",
  authenticate,
  adminOnly,
  controller.getAllAcknowledgements
);

router.get(
  "/my-policies",
  authenticate,
  controller.getMyPolicies
);

// ── Audit Routes ──────────────────────────────

router.post(
  "/audits",
  authenticate,
  adminOnly,
  validate(createAuditSchema),
  controller.createAudit
);

router.get(
  "/audits",
  authenticate,
  controller.getAudits
);

router.put(
  "/audits/:id",
  authenticate,
  adminOnly,
  validate(updateAuditSchema),
  controller.updateAudit
);

// ── Compliance Issue Routes ───────────────────

router.post(
  "/compliance-issues",
  authenticate,
  adminOnly,
  validate(createComplianceIssueSchema),
  controller.createComplianceIssue
);

router.get(
  "/compliance-issues",
  authenticate,
  controller.getComplianceIssues
);

router.put(
  "/compliance-issues/:id",
  authenticate,
  fleetManagerOrAbove,
  validate(updateComplianceIssueSchema),
  controller.updateComplianceIssue
);

export default router;
