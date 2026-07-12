import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import prisma from "../database/prisma.js";
import type { User } from "@prisma/client";

// ── Types ──────────────────────────────────────

export type SafeUser = Omit<User, "password">;

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: string;
  departmentId: number | null;
}

// ── Helpers ────────────────────────────────────

function sanitizeUser(user: User): SafeUser {
  const { password, ...safeUser } = user;
  return safeUser;
}

function throwError(message: string, statusCode: number): never {
  const error: any = new Error(message);
  error.statusCode = statusCode;
  throw error;
}

// ── Service ───────────────────────────────────

export class AuthService {
  async signup(email: string, password: string, name: string): Promise<SafeUser> {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throwError("A user with this email already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "employee",
        totalXp: 0,
        isActive: true,
      },
    });

    return sanitizeUser(user);
  }

  async login(email: string, password: string): Promise<{ token: string; user: SafeUser }> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throwError("Invalid email or password", 401);
    }

    const isMatch = await bcrypt.compare(password, user!.password);
    if (!isMatch) {
      throwError("Invalid email or password", 401);
    }

    const token = jwt.sign(
      {
        id: user!.id,
        email: user!.email,
        name: user!.name,
        role: user!.role,
        departmentId: user!.departmentId,
      },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return { token, user: sanitizeUser(user!) };
  }

  async getProfile(userId: number): Promise<SafeUser> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throwError("User not found", 404);
    }
    return sanitizeUser(user!);
  }
}
