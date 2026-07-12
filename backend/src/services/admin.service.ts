import { departments, categories, users } from "../store/index.js";
import type {
  Department,
  Category,
  User,
  SafeUser,
  UserRole,
  CategoryType,
} from "../types/index.js";

// ── Helper ────────────────────────────────────

function sanitizeUser(user: User): SafeUser {
  const { password, ...safeUser } = user;
  return safeUser as SafeUser;
}

function throwError(message: string, statusCode: number): never {
  const error: any = new Error(message);
  error.statusCode = statusCode;
  throw error;
}

// ── Service ───────────────────────────────────

export class AdminService {
  // ─── Departments ──────────────────────────

  createDepartment(data: {
    name: string;
    code: string;
    head?: string;
    parentDeptId?: number;
  }): Department {
    // Check code uniqueness
    const existing = departments.findOne((d) => d.code === data.code);
    if (existing) {
      throwError(
        `Department with code "${data.code}" already exists`,
        409
      );
    }

    const department = departments.create({
      name: data.name,
      code: data.code,
      head: data.head ?? null,
      parentDeptId: data.parentDeptId ?? null,
      createdAt: new Date(),
    });

    return department;
  }

  getAllDepartments(): Department[] {
    return departments.findAll();
  }

  updateDepartment(
    id: number,
    data: Partial<{ name: string; code: string; head: string; parentDeptId: number }>
  ): Department {
    // If updating code, check uniqueness against other departments
    if (data.code) {
      const existing = departments.findOne(
        (d) => d.code === data.code && d.id !== id
      );
      if (existing) {
        throwError(
          `Department with code "${data.code}" already exists`,
          409
        );
      }
    }

    const updated = departments.update(id, data);
    if (!updated) {
      throwError("Department not found", 404);
    }
    return updated;
  }

  deleteDepartment(id: number): void {
    const department = departments.findById(id);
    if (!department) {
      throwError("Department not found", 404);
    }

    // Check no users are assigned to this department
    const assignedUsers = users.findMany((u) => u.departmentId === id);
    if (assignedUsers.length > 0) {
      throwError(
        `Cannot delete department: ${assignedUsers.length} user(s) are still assigned to it`,
        400
      );
    }

    departments.delete(id);
  }

  // ─── Categories ───────────────────────────

  createCategory(data: {
    name: string;
    type: CategoryType;
    description?: string;
  }): Category {
    const category = categories.create({
      name: data.name,
      type: data.type,
      description: data.description ?? null,
      createdAt: new Date(),
    });

    return category;
  }

  getCategories(): Category[] {
    return categories.findAll();
  }

  updateCategory(
    id: number,
    data: Partial<{ name: string; type: CategoryType; description: string }>
  ): Category {
    const updated = categories.update(id, data);
    if (!updated) {
      throwError("Category not found", 404);
    }
    return updated;
  }

  // ─── Users ────────────────────────────────

  getUsers(filters?: {
    role?: UserRole;
    departmentId?: number;
    search?: string;
  }): SafeUser[] {
    let result: User[];

    if (!filters) {
      result = users.findAll();
    } else {
      result = users.findMany((user) => {
        // Role filter
        if (filters.role && user.role !== filters.role) {
          return false;
        }

        // Department filter
        if (
          filters.departmentId !== undefined &&
          user.departmentId !== filters.departmentId
        ) {
          return false;
        }

        // Search filter — match against name or email (case-insensitive)
        if (filters.search) {
          const term = filters.search.toLowerCase();
          const matchesName = user.name.toLowerCase().includes(term);
          const matchesEmail = user.email.toLowerCase().includes(term);
          if (!matchesName && !matchesEmail) {
            return false;
          }
        }

        return true;
      });
    }

    return result.map(sanitizeUser);
  }

  updateUserRole(id: number, role: UserRole): SafeUser {
    const user = users.findById(id);
    if (!user) {
      throwError("User not found", 404);
    }

    const updated = users.update(id, { role, updatedAt: new Date() });
    return sanitizeUser(updated!);
  }

  assignUserDepartment(id: number, departmentId: number): SafeUser {
    const user = users.findById(id);
    if (!user) {
      throwError("User not found", 404);
    }

    const department = departments.findById(departmentId);
    if (!department) {
      throwError("Department not found", 404);
    }

    const updated = users.update(id, {
      departmentId,
      updatedAt: new Date(),
    });
    return sanitizeUser(updated!);
  }

  deactivateUser(id: number): SafeUser {
    const user = users.findById(id);
    if (!user) {
      throwError("User not found", 404);
    }

    const updated = users.update(id, {
      isActive: false,
      updatedAt: new Date(),
    });
    return sanitizeUser(updated!);
  }
}
