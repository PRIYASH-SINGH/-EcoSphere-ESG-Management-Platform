import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { users } from "../store/index.js";
import type { User, SafeUser, AuthUser } from "../types/index.js";

export class AuthService {
  private sanitizeUser(user: User): SafeUser {
    const { password, ...safeUser } = user;
    return safeUser as SafeUser;
  }

  signup(email: string, password: string, name: string): SafeUser {
    const existing = users.findOne({ email });
    if (existing) {
      const error: any = new Error("A user with this email already exists");
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const user = users.create({
      email,
      password: hashedPassword,
      name,
      role: "employee" as const,
      totalXp: 0,
      isActive: true,
      createdAt: new Date(),
    });

    return this.sanitizeUser(user);
  }

  login(email: string, password: string): AuthUser {
    const user = users.findOne({ email });
    if (!user) {
      const error: any = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      const error: any = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        departmentId: user.departmentId,
      },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return { token, user: this.sanitizeUser(user) };
  }

  getProfile(userId: string): SafeUser {
    const user = users.findOne({ id: userId });
    if (!user) {
      const error: any = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    return this.sanitizeUser(user);
  }
}
