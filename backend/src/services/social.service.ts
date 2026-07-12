import prisma from "../database/prisma.js";
import type { CsrActivity, EmployeeParticipation, DiversityMetric } from "@prisma/client";

// ── Helper ─────────────────────────────────────

function throwError(message: string, statusCode: number): never {
  const error: any = new Error(message);
  error.statusCode = statusCode;
  throw error;
}

// ── Input DTOs ─────────────────────────────────

interface CreateCsrActivityInput {
  title: string;
  description: string;
  categoryId?: number | null;
  startDate: string | Date;
  endDate: string | Date;
}

interface UpdateCsrActivityInput {
  title?: string;
  description?: string;
  categoryId?: number | null;
  startDate?: string | Date;
  endDate?: string | Date;
  status?: string;
}

interface CreateDiversityMetricInput {
  metric: string;
  value: number;
  departmentId?: number | null;
  date: string | Date;
}

// ── Service ────────────────────────────────────

export class SocialService {
  // ─── CSR Activities ───────────────────────

  async createCsrActivity(data: CreateCsrActivityInput): Promise<CsrActivity> {
    return prisma.csrActivity.create({
      data: {
        title: data.title,
        description: data.description,
        categoryId: data.categoryId ?? null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: "upcoming",
      },
    });
  }

  async getAllCsrActivities(): Promise<(CsrActivity & { participantCount: number })[]> {
    const activities = await prisma.csrActivity.findMany({ orderBy: { createdAt: "asc" } });
    const withCounts = await Promise.all(
      activities.map(async (activity) => {
        const participantCount = await prisma.employeeParticipation.count({
          where: { csrActivityId: activity.id },
        });
        return { ...activity, participantCount };
      })
    );
    return withCounts;
  }

  async updateCsrActivity(id: number, data: UpdateCsrActivityInput): Promise<CsrActivity> {
    const existing = await prisma.csrActivity.findUnique({ where: { id } });
    if (!existing) throwError("CSR activity not found", 404);

    return prisma.csrActivity.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId ?? null }),
        ...(data.startDate !== undefined && { startDate: new Date(data.startDate) }),
        ...(data.endDate !== undefined && { endDate: new Date(data.endDate) }),
        ...(data.status !== undefined && { status: data.status as any }),
      },
    });
  }

  // ─── Participation ────────────────────────

  async participateInCsr(
    userId: number,
    csrActivityId: number,
    proof?: string | null
  ): Promise<EmployeeParticipation> {
    const activity = await prisma.csrActivity.findUnique({ where: { id: csrActivityId } });
    if (!activity) throwError("CSR activity not found", 404);

    const duplicate = await prisma.employeeParticipation.findUnique({
      where: { userId_csrActivityId: { userId, csrActivityId } },
    });
    if (duplicate) throwError("You have already participated in this activity", 409);

    return prisma.employeeParticipation.create({
      data: {
        userId,
        csrActivityId,
        proof: proof ?? null,
        status: "pending",
        pointsEarned: 0,
        approvedBy: null,
      },
    });
  }

  async getUserParticipations(userId: number): Promise<EmployeeParticipation[]> {
    return prisma.employeeParticipation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getPendingApprovals(): Promise<EmployeeParticipation[]> {
    return prisma.employeeParticipation.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "asc" },
    });
  }

  async approveParticipation(
    id: number,
    approvedBy: number,
    pointsEarned: number
  ): Promise<EmployeeParticipation> {
    const participation = await prisma.employeeParticipation.findUnique({ where: { id } });
    if (!participation) throwError("Participation not found", 404);
    if (participation!.status !== "pending") {
      throwError(`Participation already ${participation!.status}`, 400);
    }

    // Use a transaction to update participation and user XP atomically
    const [updated] = await prisma.$transaction([
      prisma.employeeParticipation.update({
        where: { id },
        data: { status: "approved", pointsEarned, approvedBy },
      }),
      prisma.user.update({
        where: { id: participation!.userId },
        data: { totalXp: { increment: pointsEarned } },
      }),
    ]);

    return updated;
  }

  async rejectParticipation(id: number, approvedBy: number): Promise<EmployeeParticipation> {
    const participation = await prisma.employeeParticipation.findUnique({ where: { id } });
    if (!participation) throwError("Participation not found", 404);
    if (participation!.status !== "pending") {
      throwError(`Participation already ${participation!.status}`, 400);
    }

    return prisma.employeeParticipation.update({
      where: { id },
      data: { status: "rejected", approvedBy },
    });
  }

  // ─── Diversity Metrics ────────────────────

  async getDiversityMetrics(departmentId?: number): Promise<DiversityMetric[]> {
    return prisma.diversityMetric.findMany({
      where: departmentId !== undefined ? { departmentId } : {},
      orderBy: { date: "desc" },
    });
  }

  async createDiversityMetric(data: CreateDiversityMetricInput): Promise<DiversityMetric> {
    return prisma.diversityMetric.create({
      data: {
        metric: data.metric,
        value: data.value,
        departmentId: data.departmentId ?? null,
        date: new Date(data.date),
      },
    });
  }
}
