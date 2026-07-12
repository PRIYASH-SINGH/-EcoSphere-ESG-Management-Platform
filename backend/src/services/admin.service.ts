import prisma from "../database/prisma.js";
import type { User } from "@prisma/client";

// ── Helpers ────────────────────────────────────

type SafeUser = Omit<User, "password">;

function sanitizeUser(user: User): SafeUser {
  const { password, ...safeUser } = user;
  return safeUser;
}

function throwError(message: string, statusCode: number): never {
  const error: any = new Error(message);
  error.statusCode = statusCode;
  throw error;
}

// ── Service ────────────────────────────────────

export class AdminService {
  // ─── Departments ──────────────────────────

  async createDepartment(data: {
    name: string;
    code: string;
    head?: string;
    parentDeptId?: number;
  }) {
    const existing = await prisma.department.findUnique({ where: { code: data.code } });
    if (existing) {
      throwError(`Department with code "${data.code}" already exists`, 409);
    }

    return prisma.department.create({
      data: {
        name: data.name,
        code: data.code,
        head: data.head ?? null,
        parentDeptId: data.parentDeptId ?? null,
      },
    });
  }

  async getAllDepartments() {
    return prisma.department.findMany({ orderBy: { name: "asc" } });
  }

  async updateDepartment(
    id: number,
    data: Partial<{ name: string; code: string; head: string; parentDeptId: number }>
  ) {
    if (data.code) {
      const existing = await prisma.department.findFirst({
        where: { code: data.code, NOT: { id } },
      });
      if (existing) {
        throwError(`Department with code "${data.code}" already exists`, 409);
      }
    }

    const dept = await prisma.department.findUnique({ where: { id } });
    if (!dept) throwError("Department not found", 404);

    return prisma.department.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.code !== undefined && { code: data.code }),
        ...(data.head !== undefined && { head: data.head }),
        ...(data.parentDeptId !== undefined && { parentDeptId: data.parentDeptId }),
      },
    });
  }

  async deleteDepartment(id: number): Promise<void> {
    const department = await prisma.department.findUnique({ where: { id } });
    if (!department) throwError("Department not found", 404);

    const assignedCount = await prisma.user.count({ where: { departmentId: id } });
    if (assignedCount > 0) {
      throwError(
        `Cannot delete department: ${assignedCount} user(s) are still assigned to it`,
        400
      );
    }

    await prisma.department.delete({ where: { id } });
  }

  // ─── Categories ───────────────────────────

  async createCategory(data: { name: string; type: string; description?: string }) {
    return prisma.category.create({
      data: {
        name: data.name,
        type: data.type as any,
        description: data.description ?? null,
      },
    });
  }

  async getCategories() {
    return prisma.category.findMany({ orderBy: { name: "asc" } });
  }

  async updateCategory(
    id: number,
    data: Partial<{ name: string; type: string; description: string }>
  ) {
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) throwError("Category not found", 404);

    return prisma.category.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.type !== undefined && { type: data.type as any }),
        ...(data.description !== undefined && { description: data.description }),
      },
    });
  }

  // ─── Users ────────────────────────────────

  async getUsers(filters?: {
    role?: string;
    departmentId?: number;
    search?: string;
  }): Promise<SafeUser[]> {
    const users = await prisma.user.findMany({
      where: {
        ...(filters?.role && { role: filters.role as any }),
        ...(filters?.departmentId !== undefined && { departmentId: filters.departmentId }),
        ...(filters?.search && {
          OR: [
            { name: { contains: filters.search, mode: "insensitive" } },
            { email: { contains: filters.search, mode: "insensitive" } },
          ],
        }),
      },
      orderBy: { name: "asc" },
    });

    return users.map(sanitizeUser);
  }

  async updateUserRole(id: number, role: string): Promise<SafeUser> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throwError("User not found", 404);

    const updated = await prisma.user.update({
      where: { id },
      data: { role: role as any },
    });
    return sanitizeUser(updated);
  }

  async assignUserDepartment(id: number, departmentId: number): Promise<SafeUser> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throwError("User not found", 404);

    const dept = await prisma.department.findUnique({ where: { id: departmentId } });
    if (!dept) throwError("Department not found", 404);

    const updated = await prisma.user.update({
      where: { id },
      data: { departmentId },
    });
    return sanitizeUser(updated);
  }

  async deactivateUser(id: number): Promise<SafeUser> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throwError("User not found", 404);

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
    return sanitizeUser(updated);
  }
}
