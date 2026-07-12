// ──────────────────────────────────────────────
// Reports Service — ESG reporting & analytics
// ──────────────────────────────────────────────

import {
  departments,
  users,
  carbonTransactions,
  environmentalGoals,
  csrActivities,
  employeeParticipations,
  diversityMetrics,
  audits,
  complianceIssues,
  policyAcknowledgements,
  departmentScores,
} from "../store/index.js";

import type {
  DepartmentScore,
  CarbonTransaction,
  EnvironmentalGoal,
  CsrActivity,
  EmployeeParticipation,
  DiversityMetric,
  Audit,
  ComplianceIssue,
  PolicyAcknowledgement,
} from "../types/index.js";

// ── Helper: date range predicate ──────────────
function inDateRange(
  recordDate: Date,
  startDate: Date,
  endDate: Date
): boolean {
  const d = new Date(recordDate).getTime();
  return d >= startDate.getTime() && d <= endDate.getTime();
}

// ── Helper: build month key from date ─────────
function monthKey(date: Date): string {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// ── Report result interfaces ──────────────────

interface EnvironmentalReport {
  summary: {
    totalEmissions: number;
    goalCount: number;
    goalsCompleted: number;
    averageGoalProgress: number;
  };
  carbonData: CarbonTransaction[];
  goals: EnvironmentalGoal[];
  trends: { month: string; emissions: number }[];
}

interface SocialReport {
  summary: {
    totalActivities: number;
    totalParticipations: number;
    approvedParticipations: number;
    participationRate: number;
    diversityMetricsCount: number;
  };
  csrActivities: CsrActivity[];
  participation: EmployeeParticipation[];
  diversity: DiversityMetric[];
}

interface GovernanceReport {
  summary: {
    totalAudits: number;
    completedAudits: number;
    totalIssues: number;
    resolvedIssues: number;
    complianceRate: number;
    policyAcknowledgementsCount: number;
  };
  audits: Audit[];
  compliance: ComplianceIssue[];
  policies: PolicyAcknowledgement[];
}

// ── Service ───────────────────────────────────

export class ReportsService {
  // ── Department scores ─────────────────────

  getDepartmentScores(
    departmentId?: number,
    date?: string
  ): DepartmentScore[] {
    let scores = departmentScores.findAll();

    if (departmentId) {
      scores = scores.filter((s) => s.departmentId === departmentId);
    }

    if (date) {
      const target = new Date(date);
      const targetDay = target.toISOString().slice(0, 10);
      scores = scores.filter(
        (s) => new Date(s.date).toISOString().slice(0, 10) === targetDay
      );
    }

    return scores;
  }

  // ── Calculate & persist scores for all departments ──

  calculateScores(): DepartmentScore[] {
    const allDepartments = departments.findAll();
    const allGoals = environmentalGoals.findAll();
    const allParticipations = employeeParticipations.findAll();
    const allUsers = users.findAll();
    const allIssues = complianceIssues.findAll();

    const now = new Date();
    const calculated: DepartmentScore[] = [];

    for (const dept of allDepartments) {
      // ── Environmental score ───────────────
      const deptGoals = allGoals.filter((g) => g.departmentId === dept.id);
      let envScore: number;

      if (deptGoals.length === 0) {
        envScore = 50;
      } else {
        const totalCompletion = deptGoals.reduce((sum, g) => {
          const progress = g.targetValue > 0
            ? (g.currentValue / g.targetValue) * 100
            : 0;
          return sum + Math.min(progress, 100);
        }, 0);
        envScore = Math.round((totalCompletion / deptGoals.length) * 100) / 100;
      }

      // ── Social score ──────────────────────
      const deptUsers = allUsers.filter((u) => u.departmentId === dept.id);
      const deptUserIds = new Set(deptUsers.map((u) => u.id));
      const deptParticipations = allParticipations.filter((p) =>
        deptUserIds.has(p.userId)
      );
      let socialScore: number;

      if (deptUsers.length === 0) {
        socialScore = 50;
      } else {
        const approvedCount = deptParticipations.filter(
          (p) => p.status === "approved"
        ).length;
        socialScore =
          Math.round((approvedCount / deptUsers.length) * 100 * 100) / 100;
        socialScore = Math.min(socialScore, 100);
      }

      // ── Governance score ──────────────────
      // ComplianceIssue does not have departmentId directly;
      // we use audit → department link to scope by department.
      const deptAudits = audits
        .findAll()
        .filter((a) => a.departmentId === dept.id);
      const deptAuditIds = new Set(deptAudits.map((a) => a.id));
      const deptIssues = allIssues.filter(
        (i) => i.auditId !== null && deptAuditIds.has(i.auditId)
      );
      let govScore: number;

      if (deptIssues.length === 0) {
        govScore = 80;
      } else {
        const resolvedCount = deptIssues.filter(
          (i) => i.status === "resolved" || i.status === "closed"
        ).length;
        govScore =
          Math.round((resolvedCount / deptIssues.length) * 100 * 100) / 100;
      }

      // ── Total score ───────────────────────
      const total =
        Math.round(
          (envScore * 0.4 + socialScore * 0.3 + govScore * 0.3) * 100
        ) / 100;

      const record = departmentScores.create({
        departmentId: dept.id,
        date: now,
        environmental: envScore,
        social: socialScore,
        governance: govScore,
        total,
      });

      calculated.push(record);
    }

    return calculated;
  }

  // ── Environmental report ──────────────────

  getEnvironmentalReport(
    startDate: Date,
    endDate: Date,
    departmentId?: number
  ): EnvironmentalReport {
    // Carbon transactions in range
    let transactions = carbonTransactions.findMany(
      (t) => inDateRange(t.date, startDate, endDate)
    );
    if (departmentId) {
      transactions = transactions.filter((t) => t.departmentId === departmentId);
    }

    // Goals
    let goals = environmentalGoals.findAll();
    if (departmentId) {
      goals = goals.filter((g) => g.departmentId === departmentId);
    }

    const totalEmissions = transactions.reduce(
      (sum, t) => sum + t.carbonEmitted,
      0
    );
    const goalsCompleted = goals.filter((g) => g.status === "completed").length;
    const averageGoalProgress =
      goals.length > 0
        ? Math.round(
            goals.reduce((sum, g) => {
              const pct =
                g.targetValue > 0
                  ? (g.currentValue / g.targetValue) * 100
                  : 0;
              return sum + Math.min(pct, 100);
            }, 0) / goals.length
          )
        : 0;

    // Monthly trends
    const monthlyMap = new Map<string, number>();
    for (const t of transactions) {
      const key = monthKey(t.date);
      monthlyMap.set(key, (monthlyMap.get(key) || 0) + t.carbonEmitted);
    }
    const trends = Array.from(monthlyMap.entries())
      .map(([month, emissions]) => ({
        month,
        emissions: Math.round(emissions * 100) / 100,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      summary: {
        totalEmissions: Math.round(totalEmissions * 100) / 100,
        goalCount: goals.length,
        goalsCompleted,
        averageGoalProgress,
      },
      carbonData: transactions,
      goals,
      trends,
    };
  }

  // ── Social report ─────────────────────────

  getSocialReport(
    startDate: Date,
    endDate: Date,
    departmentId?: number
  ): SocialReport {
    // CSR activities in date range
    let activities = csrActivities.findMany(
      (a) =>
        inDateRange(a.startDate, startDate, endDate) ||
        inDateRange(a.endDate, startDate, endDate)
    );

    // Participations in date range
    let participations = employeeParticipations.findMany((p) =>
      inDateRange(p.createdAt, startDate, endDate)
    );

    // Diversity metrics in date range
    let diversity = diversityMetrics.findMany((d) =>
      inDateRange(d.date, startDate, endDate)
    );

    // Department filtering
    if (departmentId) {
      const deptUserIds = new Set(
        users
          .findAll()
          .filter((u) => u.departmentId === departmentId)
          .map((u) => u.id)
      );

      participations = participations.filter((p) => deptUserIds.has(p.userId));
      diversity = diversity.filter(
        (d) => d.departmentId === null || d.departmentId === departmentId
      );
    }

    const approvedParticipations = participations.filter(
      (p) => p.status === "approved"
    ).length;

    const totalUsers = departmentId
      ? users.count((u) => u.departmentId === departmentId)
      : users.count();

    const participationRate =
      totalUsers > 0
        ? Math.round((approvedParticipations / totalUsers) * 100 * 100) / 100
        : 0;

    return {
      summary: {
        totalActivities: activities.length,
        totalParticipations: participations.length,
        approvedParticipations,
        participationRate,
        diversityMetricsCount: diversity.length,
      },
      csrActivities: activities,
      participation: participations,
      diversity,
    };
  }

  // ── Governance report ─────────────────────

  getGovernanceReport(
    startDate: Date,
    endDate: Date,
    departmentId?: number
  ): GovernanceReport {
    let auditList = audits.findMany((a) =>
      inDateRange(a.auditDate, startDate, endDate)
    );

    if (departmentId) {
      auditList = auditList.filter((a) => a.departmentId === departmentId);
    }

    const auditIds = new Set(auditList.map((a) => a.id));

    let issues = complianceIssues.findMany(
      (i) =>
        inDateRange(i.createdAt, startDate, endDate) ||
        (i.auditId !== null && auditIds.has(i.auditId))
    );

    let policies = policyAcknowledgements.findMany((p) =>
      inDateRange(p.acknowledgedAt, startDate, endDate)
    );

    // Department filtering for policies (via user → department)
    if (departmentId) {
      const deptUserIds = new Set(
        users
          .findAll()
          .filter((u) => u.departmentId === departmentId)
          .map((u) => u.id)
      );
      policies = policies.filter((p) => deptUserIds.has(p.userId));
    }

    const completedAudits = auditList.filter(
      (a) => a.status === "completed"
    ).length;
    const resolvedIssues = issues.filter(
      (i) => i.status === "resolved" || i.status === "closed"
    ).length;
    const complianceRate =
      issues.length > 0
        ? Math.round((resolvedIssues / issues.length) * 100 * 100) / 100
        : 100;

    return {
      summary: {
        totalAudits: auditList.length,
        completedAudits,
        totalIssues: issues.length,
        resolvedIssues,
        complianceRate,
        policyAcknowledgementsCount: policies.length,
      },
      audits: auditList,
      compliance: issues,
      policies,
    };
  }

  // ── Custom report ─────────────────────────

  getCustomReport(
    startDate: Date,
    endDate: Date,
    modules: string[],
    departmentId?: number
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const mod of modules) {
      switch (mod.toLowerCase().trim()) {
        case "environmental":
          result.environmental = this.getEnvironmentalReport(
            startDate,
            endDate,
            departmentId
          );
          break;
        case "social":
          result.social = this.getSocialReport(
            startDate,
            endDate,
            departmentId
          );
          break;
        case "governance":
          result.governance = this.getGovernanceReport(
            startDate,
            endDate,
            departmentId
          );
          break;
        case "scores":
          result.scores = this.getDepartmentScores(departmentId);
          break;
        default:
          result[mod] = { error: `Unknown module: ${mod}` };
      }
    }

    return result;
  }

  // ── CSV export ────────────────────────────

  exportCsv(
    reportType: string,
    filters: { startDate: Date; endDate: Date; departmentId?: number }
  ): string {
    const { startDate, endDate, departmentId } = filters;

    switch (reportType) {
      case "environmental": {
        const report = this.getEnvironmentalReport(
          startDate,
          endDate,
          departmentId
        );
        const header =
          "ID,Source,EmissionFactorId,Value,CarbonEmitted,DepartmentId,Date";
        const rows = report.carbonData.map(
          (t) =>
            `${t.id},${escapeCsv(t.source)},${t.emissionFactorId},${t.value},${t.carbonEmitted},${t.departmentId},${new Date(t.date).toISOString()}`
        );
        return [header, ...rows].join("\n");
      }

      case "social": {
        const report = this.getSocialReport(startDate, endDate, departmentId);
        const header =
          "ID,Title,Description,StartDate,EndDate,Status";
        const rows = report.csrActivities.map(
          (a) =>
            `${a.id},${escapeCsv(a.title)},${escapeCsv(a.description)},${new Date(a.startDate).toISOString()},${new Date(a.endDate).toISOString()},${a.status}`
        );
        return [header, ...rows].join("\n");
      }

      case "governance": {
        const report = this.getGovernanceReport(
          startDate,
          endDate,
          departmentId
        );
        const header =
          "ID,Title,DepartmentId,Auditor,AuditDate,Status";
        const rows = report.audits.map(
          (a) =>
            `${a.id},${escapeCsv(a.title)},${a.departmentId},${escapeCsv(a.auditor)},${new Date(a.auditDate).toISOString()},${a.status}`
        );
        return [header, ...rows].join("\n");
      }

      case "scores": {
        const scores = this.getDepartmentScores(departmentId);
        const header =
          "ID,DepartmentId,Date,Environmental,Social,Governance,Total";
        const rows = scores.map(
          (s) =>
            `${s.id},${s.departmentId},${new Date(s.date).toISOString()},${s.environmental},${s.social},${s.governance},${s.total}`
        );
        return [header, ...rows].join("\n");
      }

      default: {
        const error = new Error(`Unknown report type: ${reportType}`);
        (error as any).statusCode = 400;
        throw error;
      }
    }
  }
}

// ── CSV helper ────────────────────────────────
function escapeCsv(value: string): string {
  if (
    value.includes(",") ||
    value.includes('"') ||
    value.includes("\n")
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
