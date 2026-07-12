import { Request, Response } from "express";
import { AdminService } from "../services/admin.service.js";

export class AdminController {
  private service = new AdminService();

  // ─── Departments ──────────────────────────

  createDepartment = async (req: Request, res: Response): Promise<void> => {
    try {
      const department = this.service.createDepartment(req.body);
      res.status(201).json({ success: true, data: department });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  getAllDepartments = async (_req: Request, res: Response): Promise<void> => {
    try {
      const departments = this.service.getAllDepartments();
      res.status(200).json({ success: true, data: departments });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  updateDepartment = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res
          .status(400)
          .json({ success: false, error: "Invalid department ID" });
        return;
      }
      const department = this.service.updateDepartment(id, req.body);
      res.status(200).json({ success: true, data: department });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  deleteDepartment = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res
          .status(400)
          .json({ success: false, error: "Invalid department ID" });
        return;
      }
      this.service.deleteDepartment(id);
      res.status(200).json({ success: true, data: { message: "Department deleted" } });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  // ─── Categories ───────────────────────────

  createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const category = this.service.createCategory(req.body);
      res.status(201).json({ success: true, data: category });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  getCategories = async (_req: Request, res: Response): Promise<void> => {
    try {
      const categories = this.service.getCategories();
      res.status(200).json({ success: true, data: categories });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  updateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res
          .status(400)
          .json({ success: false, error: "Invalid category ID" });
        return;
      }
      const category = this.service.updateCategory(id, req.body);
      res.status(200).json({ success: true, data: category });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  // ─── Users ────────────────────────────────

  getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters: { role?: string; departmentId?: number; search?: string } = {};

      if (req.query.role) {
        filters.role = req.query.role as string;
      }
      if (req.query.departmentId) {
        filters.departmentId = parseInt(req.query.departmentId as string, 10);
      }
      if (req.query.search) {
        filters.search = req.query.search as string;
      }

      const users = this.service.getUsers(filters as any);
      res.status(200).json({ success: true, data: users });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  updateUserRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, error: "Invalid user ID" });
        return;
      }
      const user = this.service.updateUserRole(id, req.body.role);
      res.status(200).json({ success: true, data: user });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  assignUserDepartment = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, error: "Invalid user ID" });
        return;
      }
      const user = this.service.assignUserDepartment(id, req.body.departmentId);
      res.status(200).json({ success: true, data: user });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };

  deactivateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, error: "Invalid user ID" });
        return;
      }
      const user = this.service.deactivateUser(id);
      res.status(200).json({ success: true, data: user });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, error: err.message });
    }
  };
}
