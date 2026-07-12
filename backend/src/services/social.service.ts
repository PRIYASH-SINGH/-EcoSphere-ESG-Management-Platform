import {
  csrActivities,
  employeeParticipations,
  diversityMetrics,
  users,
} from "../store/index.js";
import type {
  CsrActivity,
  EmployeeParticipation,
  DiversityMetric,
  ActivityStatus,
} from "../types/index.js";

// ── Helper: throw with statusCode ─────────────
class ServiceError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

// ── Input DTOs ────────────────────────────────

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
  status?: ActivityStatus;
}

interface CreateDiversityMetricInput {
  metric: string;
  value: number;
  departmentId?: number | null;
  date: string | Date;
}

// ── Service ───────────────────────────────────

export class SocialService {
  // ─── CSR Activities ──────────────────────────

  /**
   * Create a new CSR activity with status = 'upcoming'.
   */
  createCsrActivity(data: CreateCsrActivityInput): CsrActivity {
    const activity = csrActivities.create({
      title: data.title,
      description: data.description,
      categoryId: data.categoryId ?? null,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      status: "upcoming" as ActivityStatus,
      createdAt: new Date(),
    });
    return activity;
  }

  /**
   * Return all CSR activities with a computed `participantCount`.
   */
  getAllCsrActivities(): (CsrActivity & { participantCount: number })[] {
    const activities = csrActivities.findAll();
    return activities.map((activity) => {
      const participantCount = employeeParticipations.count(
        (p) => p.csrActivityId === activity.id
      );
      return { ...activity, participantCount };
    });
  }

  /**
   * Update a CSR activity by id. Throws 404 if not found.
   */
  updateCsrActivity(
    id: number,
    data: UpdateCsrActivityInput
  ): CsrActivity {
    const existing = csrActivities.findById(id);
    if (!existing) {
      throw new ServiceError("CSR activity not found", 404);
    }

    const updatePayload: Partial<CsrActivity> = {};
    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.categoryId !== undefined) updatePayload.categoryId = data.categoryId ?? null;
    if (data.startDate !== undefined) updatePayload.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updatePayload.endDate = new Date(data.endDate);
    if (data.status !== undefined) updatePayload.status = data.status;

    const updated = csrActivities.update(id, updatePayload)!;
    return updated;
  }

  // ─── Participation ───────────────────────────

  /**
   * Let a user participate in a CSR activity.
   * - 404 if activity not found.
   * - 409 if user already has a participation for this activity.
   */
  participateInCsr(
    userId: number,
    csrActivityId: number,
    proof?: string | null
  ): EmployeeParticipation {
    const activity = csrActivities.findById(csrActivityId);
    if (!activity) {
      throw new ServiceError("CSR activity not found", 404);
    }

    const duplicate = employeeParticipations.findOne(
      (p) => p.userId === userId && p.csrActivityId === csrActivityId
    );
    if (duplicate) {
      throw new ServiceError(
        "You have already participated in this activity",
        409
      );
    }

    const participation = employeeParticipations.create({
      userId,
      csrActivityId,
      proof: proof ?? null,
      status: "pending",
      pointsEarned: 0,
      approvedBy: null,
      createdAt: new Date(),
    });

    return participation;
  }

  /**
   * Get all participations for a given user.
   */
  getUserParticipations(userId: number): EmployeeParticipation[] {
    return employeeParticipations.findMany((p) => p.userId === userId);
  }

  /**
   * Get all participations awaiting approval (status = 'pending').
   */
  getPendingApprovals(): EmployeeParticipation[] {
    return employeeParticipations.findMany((p) => p.status === "pending");
  }

  /**
   * Approve a participation, award points, and update user's totalXp.
   */
  approveParticipation(
    id: number,
    approvedBy: number,
    pointsEarned: number
  ): EmployeeParticipation {
    const participation = employeeParticipations.findById(id);
    if (!participation) {
      throw new ServiceError("Participation not found", 404);
    }
    if (participation.status !== "pending") {
      throw new ServiceError(
        `Participation already ${participation.status}`,
        400
      );
    }

    const updated = employeeParticipations.update(id, {
      status: "approved",
      pointsEarned,
      approvedBy,
    })!;

    // Also credit the user's totalXp
    const user = users.findById(participation.userId);
    if (user) {
      users.update(user.id, { totalXp: user.totalXp + pointsEarned });
    }

    return updated;
  }

  /**
   * Reject a participation.
   */
  rejectParticipation(
    id: number,
    approvedBy: number
  ): EmployeeParticipation {
    const participation = employeeParticipations.findById(id);
    if (!participation) {
      throw new ServiceError("Participation not found", 404);
    }
    if (participation.status !== "pending") {
      throw new ServiceError(
        `Participation already ${participation.status}`,
        400
      );
    }

    const updated = employeeParticipations.update(id, {
      status: "rejected",
      approvedBy,
    })!;

    return updated;
  }

  // ─── Diversity Metrics ───────────────────────

  /**
   * Return diversity metrics, optionally filtered by departmentId.
   */
  getDiversityMetrics(departmentId?: number): DiversityMetric[] {
    if (departmentId !== undefined) {
      return diversityMetrics.findMany(
        (m) => m.departmentId === departmentId
      );
    }
    return diversityMetrics.findAll();
  }

  /**
   * Create a new diversity metric record.
   */
  createDiversityMetric(data: CreateDiversityMetricInput): DiversityMetric {
    const metric = diversityMetrics.create({
      metric: data.metric,
      value: data.value,
      departmentId: data.departmentId ?? null,
      date: new Date(data.date),
      createdAt: new Date(),
    });
    return metric;
  }
}
