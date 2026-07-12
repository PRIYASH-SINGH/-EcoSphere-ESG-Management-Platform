import { policyAcknowledgements, audits, complianceIssues } from "../store/index.js";
import type {
  PolicyAcknowledgement,
  Audit,
  ComplianceIssue,
  AuditStatus,
  Severity,
  ComplianceStatus,
} from "../types/index.js";

// ── Input types ───────────────────────────────

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
  status?: AuditStatus;
}

interface CreateComplianceIssueInput {
  auditId?: number | null;
  severity: Severity;
  description: string;
  owner: string;
  dueDate: string | Date;
}

interface ComplianceIssueFilters {
  severity?: Severity;
  status?: ComplianceStatus;
}

// ── Service ───────────────────────────────────

export class GovernanceService {
  // ── Policy Acknowledgements ─────────────────

  /**
   * Acknowledge a policy for a user. 409 if already acknowledged.
   */
  acknowledgePolicy(userId: number, policyName: string): PolicyAcknowledgement {
    const existing = policyAcknowledgements.findOne(
      (ack) => ack.userId === userId && ack.policyName === policyName
    );

    if (existing) {
      const error: any = new Error(
        `You have already acknowledged the policy "${policyName}"`
      );
      error.statusCode = 409;
      throw error;
    }

    const acknowledgement = policyAcknowledgements.create({
      userId,
      policyName,
      acknowledgedAt: new Date(),
    });

    return acknowledgement;
  }

  /**
   * Return every policy acknowledgement (admin view).
   */
  getAllAcknowledgements(): PolicyAcknowledgement[] {
    return policyAcknowledgements.findAll();
  }

  /**
   * Return acknowledgements for a specific user.
   */
  getUserPolicies(userId: number): PolicyAcknowledgement[] {
    return policyAcknowledgements.findMany((ack) => ack.userId === userId);
  }

  // ── Audits ──────────────────────────────────

  /**
   * Schedule a new audit.
   */
  createAudit(data: CreateAuditInput): Audit {
    const audit = audits.create({
      title: data.title,
      departmentId: data.departmentId,
      auditor: data.auditor,
      auditDate: new Date(data.auditDate),
      findings: data.findings ?? null,
      status: "scheduled" as const,
      createdAt: new Date(),
    });

    return audit;
  }

  /**
   * Return all audits.
   */
  getAudits(): Audit[] {
    return audits.findAll();
  }

  /**
   * Update an existing audit. 404 if not found.
   */
  updateAudit(id: number, data: UpdateAuditInput): Audit {
    const existing = audits.findById(id);
    if (!existing) {
      const error: any = new Error(`Audit with id ${id} not found`);
      error.statusCode = 404;
      throw error;
    }

    const updatePayload: Partial<Audit> = {};

    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.departmentId !== undefined) updatePayload.departmentId = data.departmentId;
    if (data.auditor !== undefined) updatePayload.auditor = data.auditor;
    if (data.auditDate !== undefined) updatePayload.auditDate = new Date(data.auditDate);
    if (data.findings !== undefined) updatePayload.findings = data.findings ?? null;
    if (data.status !== undefined) updatePayload.status = data.status;

    const updated = audits.update(id, updatePayload)!;
    return updated;
  }

  // ── Compliance Issues ───────────────────────

  /**
   * Create a new compliance issue.
   */
  createComplianceIssue(data: CreateComplianceIssueInput): ComplianceIssue {
    const issue = complianceIssues.create({
      auditId: data.auditId ?? null,
      severity: data.severity,
      description: data.description,
      owner: data.owner,
      dueDate: new Date(data.dueDate),
      status: "open" as const,
      createdAt: new Date(),
    });

    return issue;
  }

  /**
   * Return compliance issues, optionally filtered by severity and/or status.
   */
  getComplianceIssues(filters?: ComplianceIssueFilters): ComplianceIssue[] {
    if (!filters || (!filters.severity && !filters.status)) {
      return complianceIssues.findAll();
    }

    return complianceIssues.findMany((issue) => {
      if (filters.severity && issue.severity !== filters.severity) return false;
      if (filters.status && issue.status !== filters.status) return false;
      return true;
    });
  }

  /**
   * Update a compliance issue's status. 404 if not found.
   * Status must be one of: open, in_progress, resolved, closed.
   */
  updateComplianceIssue(
    id: number,
    data: { status: ComplianceStatus }
  ): ComplianceIssue {
    const existing = complianceIssues.findById(id);
    if (!existing) {
      const error: any = new Error(`Compliance issue with id ${id} not found`);
      error.statusCode = 404;
      throw error;
    }

    const validStatuses: ComplianceStatus[] = [
      "open",
      "in_progress",
      "resolved",
      "closed",
    ];
    if (!validStatuses.includes(data.status)) {
      const error: any = new Error(
        `Invalid status "${data.status}". Must be one of: ${validStatuses.join(", ")}`
      );
      error.statusCode = 400;
      throw error;
    }

    const updated = complianceIssues.update(id, { status: data.status })!;
    return updated;
  }
}
