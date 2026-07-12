import { Request, Response, NextFunction } from "express";
import type { UserRole } from "../types/index.js";

/**
 * Role-based access control middleware factory.
 * Returns middleware that checks if `req.user.role` is in the allowed list.
 * Must be used AFTER the `authenticate` middleware.
 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Authentication required" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Forbidden — requires one of: ${roles.join(", ")}`,
      });
      return;
    }

    next();
  };
}

// ── Pre-built role guards ──────────────────────

/** Only admin users */
export const adminOnly = requireRole("admin");

/** Admin or fleet_manager */
export const fleetManagerOrAbove = requireRole("admin", "fleet_manager");

/** Any authenticated user (all roles) */
export const anyAuthenticated = requireRole(
  "admin",
  "fleet_manager",
  "employee"
);
