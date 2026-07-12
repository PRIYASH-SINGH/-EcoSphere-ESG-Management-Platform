import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth.js";
import { adminOnly } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import { AdminController } from "../controllers/admin.controller.js";

const router = Router();
const controller = new AdminController();

// ── Validation Schemas ────────────────────────

const createDepartmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  head: z.string().optional(),
  parentDeptId: z.number().int().positive().optional(),
});

const updateDepartmentSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  head: z.string().optional(),
  parentDeptId: z.number().int().positive().nullable().optional(),
});

const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["environmental", "social", "governance"]),
  description: z.string().optional(),
});

const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(["environmental", "social", "governance"]).optional(),
  description: z.string().nullable().optional(),
});

const updateUserRoleSchema = z.object({
  role: z.enum(["admin", "fleet_manager", "employee"]),
});

const assignDepartmentSchema = z.object({
  departmentId: z.number().int().positive("Department ID must be a positive integer"),
});

// ── Department Routes ─────────────────────────

router.get("/departments", authenticate, controller.getAllDepartments);

router.post(
  "/departments",
  authenticate,
  adminOnly,
  validate(createDepartmentSchema),
  controller.createDepartment
);

router.put(
  "/departments/:id",
  authenticate,
  adminOnly,
  validate(updateDepartmentSchema),
  controller.updateDepartment
);

router.delete(
  "/departments/:id",
  authenticate,
  adminOnly,
  controller.deleteDepartment
);

// ── Category Routes ───────────────────────────

router.get("/categories", authenticate, controller.getCategories);

router.post(
  "/categories",
  authenticate,
  adminOnly,
  validate(createCategorySchema),
  controller.createCategory
);

router.put(
  "/categories/:id",
  authenticate,
  adminOnly,
  validate(updateCategorySchema),
  controller.updateCategory
);

// ── User Management Routes ────────────────────

router.get("/users", authenticate, adminOnly, controller.getUsers);

router.put(
  "/users/:id/role",
  authenticate,
  adminOnly,
  validate(updateUserRoleSchema),
  controller.updateUserRole
);

router.put(
  "/users/:id/department",
  authenticate,
  adminOnly,
  validate(assignDepartmentSchema),
  controller.assignUserDepartment
);

router.delete(
  "/users/:id",
  authenticate,
  adminOnly,
  controller.deactivateUser
);

export default router;
