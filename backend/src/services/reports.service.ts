import prisma from "../database/prisma.js";

// ── Helpers ─────────────────────────────────────

function inDateRange(recordDate: Date, startDate: Date, endDate: Date): boolean {
  const d = new Date(recordDate).getTime();
  return d >= startDate.getTime() && d <= endDate.getTime();
}

function monthKey(date: Date): string {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// ── Service ─────────────────────────────────────

export class ReportsService {
  // ── Department scores ─────────────────────

  async getDepartmentScores(departmentId?: number, date?: string) {
    return prisma.departmentScore.findMany({
      where: {
        ...(departmentId && { departmentId }),
        ...(date && {
          date: {
            gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
            lte: new Date(new Date(date).setHours(23, 59, 59, 999)),
          },
        }),
      },
      orderBy: { date: "desc" },
    });
  }

  async calculateScores() {
    const allDepartments = await prisma.department.findMany();
    const allGoals = await prisma.environmentalGoal.findMany();
    const allParticipations = await prisma.employeeParticipation.findMany();
    const allUsers = await prisma.user.findMany();
    const allIssues = await prisma.complianceIssue.findMany();
    const allAudits = await prisma.audit.findMany();

    const now = new Date();
    const calculated = [];

    for (const dept of allDepartments) {
      const deptGoals = allGoals.filter((g) => g.departmentId === dept.id);
      let envScore: number;
      if (deptGoals.length === 0) {
        envScore = 50;
      } else {
        const totalCompletion = deptGoals.reduce((sum, g) => {
          const progress = g.targetValue > 0 ? (g.currentValue / g.targetValue) * 100 : 0;
          return sum + Math.min(progress, 100);
        }, 0);
        envScore = Math.round((totalCompletion / deptGoals.length) * 100) / 100;
      }

      const deptUsers = allUsers.filter((u) => u.departmentId === dept.id);
      const deptUserIds = new Set(deptUsers.map((u) => u.id));
      const deptParticipations = allParticipations.filter((p) => deptUserIds.has(p.userId));
      let socialScore: number;
      if (deptUsers.length === 0) {
        socialScore = 50;
      } else {
        const approvedCount = deptParticipations.filter((p) => p.status === "approved").length;
        socialScore = Math.round((approvedCount / deptUsers.length) * 100 * 100) / 100;
        socialScore = Math.min(socialScore, 100);
      }

      const deptAudits = allAudits.filter((a) => a.departmentId === dept.id);
      const deptAuditIds = new Set(deptAudits.map((a) => a.id));
      const deptIssues = allIssues.filter((i) => i.auditId !== null && deptAuditIds.has(i.auditId));
      let govScore: number;
      if (deptIssues.length === 0) {
        govScore = 80;
      } else {
        const resolvedCount = deptIssues.filter(
          (i) => i.status === "resolved" || i.status === "closed"
        ).length;
        govScore = Math.round((resolvedCount / deptIssues.length) * 100 * 100) / 100;
      }

      const total = Math.round((envScore * 0.4 + socialScore * 0.3 + govScore * 0.3) * 100) / 100;

      const record = await prisma.departmentScore.create({
        data: {
          departmentId: dept.id,
          date: now,
          environmental: envScore,
          social: socialScore,
          governance: govScore,
          total,
        },
      });
      calculated.push(record);
    }

    return calculated;
  }

  // ── Environmental report ──────────────────

  async getEnvironmentalReport(startDate: Date, endDate: Date, departmentId?: number) {
    const transactions = await prisma.carbonTransaction.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
        ...(departmentId && { departmentId }),
      },
      orderBy: { date: "asc" },
    });

    const goals = await prisma.environmentalGoal.findMany({
      where: departmentId ? { departmentId } : {},
    });

    const totalEmissions = transactions.reduce((sum, t) => sum + t.carbonEmitted, 0);
    const goalsCompleted = goals.filter((g) => g.status === "completed").length;
    const averageGoalProgress =
      goals.length > 0
        ? Math.round(
            goals.reduce((sum, g) => {
              const pct = g.targetValue > 0 ? (g.currentValue / g.targetValue) * 100 : 0;
              return sum + Math.min(pct, 100);
            }, 0) / goals.length
          )
        : 0;

    const monthlyMap = new Map<string, number>();
    for (const t of transactions) {
      const key = monthKey(t.date);
      monthlyMap.set(key, (monthlyMap.get(key) || 0) + t.carbonEmitted);
    }
    const trends = Array.from(monthlyMap.entries())
      .map(([month, emissions]) => ({ month, emissions: Math.round(emissions * 100) / 100 }))
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

  async getSocialReport(startDate: Date, endDate: Date, departmentId?: number) {
    const activities = await prisma.csrActivity.findMany({
      where: {
        OR: [
          { startDate: { gte: startDate, lte: endDate } },
          { endDate: { gte: startDate, lte: endDate } },
        ],
      },
    });

    const participationWhere: any = {
      createdAt: { gte: startDate, lte: endDate },
    };
    if (departmentId) {
      const deptUserIds = await prisma.user
        .findMany({ where: { departmentId }, select: { id: true } })
        .then((users) => users.map((u) => u.id));
      participationWhere.userId = { in: deptUserIds };
    }

    const participations = await prisma.employeeParticipation.findMany({
      where: participationWhere,
    });

    const diversity = await prisma.diversityMetric.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
        ...(departmentId && { OR: [{ departmentId: null }, { departmentId }] }),
      },
    });

    const approvedParticipations = participations.filter((p) => p.status === "approved").length;
    const totalUsers = departmentId
      ? await prisma.user.count({ where: { departmentId } })
      : await prisma.user.count();
    const participationRate =
      totalUsers > 0 ? Math.round((approvedParticipations / totalUsers) * 100 * 100) / 100 : 0;

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

  async getGovernanceReport(startDate: Date, endDate: Date, departmentId?: number) {
    const auditList = await prisma.audit.findMany({
      where: {
        auditDate: { gte: startDate, lte: endDate },
        ...(departmentId && { departmentId }),
      },
    });

    const auditIds = auditList.map((a) => a.id);

    const issues = await prisma.complianceIssue.findMany({
      where: {
        OR: [
          { createdAt: { gte: startDate, lte: endDate } },
          { auditId: { in: auditIds } },
        ],
      },
    });

    const policyWhere: any = {
      acknowledgedAt: { gte: startDate, lte: endDate },
    };
    if (departmentId) {
      const deptUserIds = await prisma.user
        .findMany({ where: { departmentId }, select: { id: true } })
        .then((users) => users.map((u) => u.id));
      policyWhere.userId = { in: deptUserIds };
    }

    const policies = await prisma.policyAcknowledgement.findMany({ where: policyWhere });

    const completedAudits = auditList.filter((a) => a.status === "completed").length;
    const resolvedIssues = issues.filter((i) => i.status === "resolved" || i.status === "closed").length;
    const complianceRate =
      issues.length > 0 ? Math.round((resolvedIssues / issues.length) * 100 * 100) / 100 : 100;

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

  async getCustomReport(
    startDate: Date,
    endDate: Date,
    modules: string[],
    departmentId?: number
  ): Promise<Record<string, unknown>> {
    const result: Record<string, unknown> = {};
    for (const mod of modules) {
      switch (mod.toLowerCase().trim()) {
        case "environmental":
          result.environmental = await this.getEnvironmentalReport(startDate, endDate, departmentId);
          break;
        case "social":
          result.social = await this.getSocialReport(startDate, endDate, departmentId);
          break;
        case "governance":
          result.governance = await this.getGovernanceReport(startDate, endDate, departmentId);
          break;
        case "scores":
          result.scores = await this.getDepartmentScores(departmentId);
          break;
        default:
          result[mod] = { error: `Unknown module: ${mod}` };
      }
    }
    return result;
  }

  // ── CSV export ────────────────────────────

  async exportCsv(
    reportType: string,
    filters: { startDate: Date; endDate: Date; departmentId?: number }
  ): Promise<string> {
    const { startDate, endDate, departmentId } = filters;

    switch (reportType) {
      case "environmental": {
        const report = await this.getEnvironmentalReport(startDate, endDate, departmentId);
        const header = "ID,Source,EmissionFactorId,Value,CarbonEmitted,DepartmentId,Date";
        const rows = report.carbonData.map(
          (t) =>
            `${t.id},${escapeCsv(t.source)},${t.emissionFactorId},${t.value},${t.carbonEmitted},${t.departmentId},${new Date(t.date).toISOString()}`
        );
        return [header, ...rows].join("\n");
      }
      case "social": {
        const report = await this.getSocialReport(startDate, endDate, departmentId);
        const header = "ID,Title,Description,StartDate,EndDate,Status";
        const rows = report.csrActivities.map(
          (a) =>
            `${a.id},${escapeCsv(a.title)},${escapeCsv(a.description)},${new Date(a.startDate).toISOString()},${new Date(a.endDate).toISOString()},${a.status}`
        );
        return [header, ...rows].join("\n");
      }
      case "governance": {
        const report = await this.getGovernanceReport(startDate, endDate, departmentId);
        const header = "ID,Title,DepartmentId,Auditor,AuditDate,Status";
        const rows = report.audits.map(
          (a) =>
            `${a.id},${escapeCsv(a.title)},${a.departmentId},${escapeCsv(a.auditor)},${new Date(a.auditDate).toISOString()},${a.status}`
        );
        return [header, ...rows].join("\n");
      }
      case "scores": {
        const scores = await this.getDepartmentScores(departmentId);
        const header = "ID,DepartmentId,Date,Environmental,Social,Governance,Total";
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
