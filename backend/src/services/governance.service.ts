import prisma from "../database/prisma.js";
import type { PolicyAcknowledgement, Audit, ComplianceIssue } from "@prisma/client";

// ── Helper ─────────────────────────────────────

function throwError(message: string, statusCode: number): never {
  const error: any = new Error(message);
  error.statusCode = statusCode;
  throw error;
}

// ── Input types ────────────────────────────────

interface CreateAuditInput {
  title: string;
  departmentId: number;
  auditor: string;
  auditDate: string | Date;
  findings?: string | null;
}

interface UpdateAuditInput {
  title?: string;
  departmentId?: number;
  auditor?: string;
  auditDate?: string | Date;
  findings?: string | null;
  status?: string;
}

interface CreateComplianceIssueInput {
  auditId?: number | null;
  severity: string;
  description: string;
  owner: string;
  dueDate: string | Date;
}

interface ComplianceIssueFilters {
  severity?: string;
  status?: string;
}

// ── Service ────────────────────────────────────

export class GovernanceService {
  // ── Policy Acknowledgements ─────────────────

  async acknowledgePolicy(userId: number, policyName: string): Promise<PolicyAcknowledgement> {
    const existing = await prisma.policyAcknowledgement.findUnique({
      where: { userId_policyName: { userId, policyName } },
    });
    if (existing) {
      throwError(`You have already acknowledged the policy "${policyName}"`, 409);
    }

    return prisma.policyAcknowledgement.create({
      data: { userId, policyName },
    });
  }

  async getAllAcknowledgements(): Promise<PolicyAcknowledgement[]> {
    return prisma.policyAcknowledgement.findMany({ orderBy: { acknowledgedAt: "desc" } });
  }

  async getUserPolicies(userId: number): Promise<PolicyAcknowledgement[]> {
    return prisma.policyAcknowledgement.findMany({
      where: { userId },
      orderBy: { acknowledgedAt: "desc" },
    });
  }

  // ── Audits ──────────────────────────────────

  async createAudit(data: CreateAuditInput): Promise<Audit> {
    return prisma.audit.create({
      data: {
        title: data.title,
        departmentId: data.departmentId,
        auditor: data.auditor,
        auditDate: new Date(data.auditDate),
        findings: data.findings ?? null,
        status: "scheduled",
      },
    });
  }

  async getAudits(): Promise<Audit[]> {
    return prisma.audit.findMany({ orderBy: { auditDate: "desc" } });
  }

  async updateAudit(id: number, data: UpdateAuditInput): Promise<Audit> {
    const existing = await prisma.audit.findUnique({ where: { id } });
    if (!existing) throwError(`Audit with id ${id} not found`, 404);

    return prisma.audit.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.departmentId !== undefined && { departmentId: data.departmentId }),
        ...(data.auditor !== undefined && { auditor: data.auditor }),
        ...(data.auditDate !== undefined && { auditDate: new Date(data.auditDate) }),
        ...(data.findings !== undefined && { findings: data.findings ?? null }),
        ...(data.status !== undefined && { status: data.status as any }),
      },
    });
  }

  // ── Compliance Issues ───────────────────────

  async createComplianceIssue(data: CreateComplianceIssueInput): Promise<ComplianceIssue> {
    return prisma.complianceIssue.create({
      data: {
        auditId: data.auditId ?? null,
        severity: data.severity as any,
        description: data.description,
        owner: data.owner,
        dueDate: new Date(data.dueDate),
        status: "open",
      },
    });
  }

  async getComplianceIssues(filters?: ComplianceIssueFilters): Promise<ComplianceIssue[]> {
    return prisma.complianceIssue.findMany({
      where: {
        ...(filters?.severity && { severity: filters.severity as any }),
        ...(filters?.status && { status: filters.status as any }),
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateComplianceIssue(id: number, data: { status: string }): Promise<ComplianceIssue> {
    const validStatuses = ["open", "in_progress", "resolved", "closed"];
    if (!validStatuses.includes(data.status)) {
      throwError(
        `Invalid status "${data.status}". Must be one of: ${validStatuses.join(", ")}`,
        400
      );
    }

    const existing = await prisma.complianceIssue.findUnique({ where: { id } });
    if (!existing) throwError(`Compliance issue with id ${id} not found`, 404);

    return prisma.complianceIssue.update({
      where: { id },
      data: { status: data.status as any },
    });
  }
}
