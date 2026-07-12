import prisma from "../database/prisma.js";
import type { EmissionFactor, CarbonTransaction, EnvironmentalGoal } from "@prisma/client";

// ── Helper ─────────────────────────────────────

function throwError(message: string, statusCode: number): never {
  const error: any = new Error(message);
  error.statusCode = statusCode;
  throw error;
}

// ── Input types ────────────────────────────────

interface CreateEmissionFactorInput {
  name: string;
  factor: number;
  unit: string;
  categoryId?: number | null;
}

interface CreateCarbonTransactionInput {
  source: string;
  emissionFactorId: number;
  value: number;
  departmentId: number;
  date: string | Date;
  createdBy: number;
}

interface CarbonTransactionFilters {
  departmentId?: number;
  startDate?: string | Date;
  endDate?: string | Date;
}

interface CreateGoalInput {
  title: string;
  targetValue: number;
  departmentId: number;
  deadline: string | Date;
}

// ── Service ────────────────────────────────────

export class EnvironmentalService {
  // ─── Emission Factors ─────────────────────

  async createEmissionFactor(data: CreateEmissionFactorInput): Promise<EmissionFactor> {
    return prisma.emissionFactor.create({
      data: {
        name: data.name,
        factor: data.factor,
        unit: data.unit,
        categoryId: data.categoryId ?? null,
      },
    });
  }

  async getAllEmissionFactors(): Promise<EmissionFactor[]> {
    return prisma.emissionFactor.findMany({ orderBy: { createdAt: "asc" } });
  }

  async updateEmissionFactor(id: number, data: Partial<CreateEmissionFactorInput>): Promise<EmissionFactor> {
    const existing = await prisma.emissionFactor.findUnique({ where: { id } });
    if (!existing) throwError(`Emission factor with id ${id} not found`, 404);

    return prisma.emissionFactor.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.factor !== undefined && { factor: data.factor }),
        ...(data.unit !== undefined && { unit: data.unit }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId ?? null }),
      },
    });
  }

  async deleteEmissionFactor(id: number): Promise<void> {
    const existing = await prisma.emissionFactor.findUnique({ where: { id } });
    if (!existing) throwError(`Emission factor with id ${id} not found`, 404);
    await prisma.emissionFactor.delete({ where: { id } });
  }

  // ─── Carbon Transactions ──────────────────

  async createCarbonTransaction(data: CreateCarbonTransactionInput): Promise<CarbonTransaction> {
    const ef = await prisma.emissionFactor.findUnique({ where: { id: data.emissionFactorId } });
    if (!ef) throwError(`Emission factor with id ${data.emissionFactorId} not found`, 404);

    const carbonEmitted = data.value * ef!.factor;

    return prisma.carbonTransaction.create({
      data: {
        source: data.source,
        emissionFactorId: data.emissionFactorId,
        value: data.value,
        carbonEmitted,
        departmentId: data.departmentId,
        date: new Date(data.date),
        createdBy: data.createdBy,
      },
    });
  }

  async getCarbonTransactions(filters: CarbonTransactionFilters = {}): Promise<CarbonTransaction[]> {
    return prisma.carbonTransaction.findMany({
      where: {
        ...(filters.departmentId !== undefined && { departmentId: filters.departmentId }),
        ...(filters.startDate || filters.endDate
          ? {
              date: {
                ...(filters.startDate && { gte: new Date(filters.startDate) }),
                ...(filters.endDate && { lte: new Date(filters.endDate) }),
              },
            }
          : {}),
      },
      orderBy: { date: "desc" },
    });
  }

  async getCarbonSummary(filters: CarbonTransactionFilters = {}): Promise<{
    totalEmissions: number;
    byDepartment: { departmentId: number; totalEmissions: number }[];
    trend: { date: string; emissions: number }[];
  }> {
    const transactions = await this.getCarbonTransactions(filters);

    const totalEmissions = transactions.reduce((sum, tx) => sum + tx.carbonEmitted, 0);

    const deptMap = new Map<number, number>();
    const trendMap = new Map<string, number>();

    for (const tx of transactions) {
      const current = deptMap.get(tx.departmentId) ?? 0;
      deptMap.set(tx.departmentId, current + tx.carbonEmitted);

      const dateKey = new Date(tx.date).toISOString().slice(0, 10);
      trendMap.set(dateKey, (trendMap.get(dateKey) ?? 0) + tx.carbonEmitted);
    }

    const byDepartment = Array.from(deptMap.entries()).map(([departmentId, totalEmissions]) => ({
      departmentId,
      totalEmissions,
    }));

    const trend = Array.from(trendMap.entries())
      .map(([date, emissions]) => ({ date, emissions }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return { totalEmissions, byDepartment, trend };
  }

  // ─── Environmental Goals ──────────────────

  async createGoal(data: CreateGoalInput): Promise<EnvironmentalGoal> {
    return prisma.environmentalGoal.create({
      data: {
        title: data.title,
        targetValue: data.targetValue,
        currentValue: 0,
        departmentId: data.departmentId,
        deadline: new Date(data.deadline),
        status: "active",
      },
    });
  }

  async getGoals(departmentId?: number): Promise<EnvironmentalGoal[]> {
    return prisma.environmentalGoal.findMany({
      where: departmentId !== undefined ? { departmentId } : {},
      orderBy: { createdAt: "asc" },
    });
  }

  async updateGoalProgress(id: number, currentValue: number): Promise<EnvironmentalGoal> {
    const goal = await prisma.environmentalGoal.findUnique({ where: { id } });
    if (!goal) throwError(`Environmental goal with id ${id} not found`, 404);

    const newStatus = currentValue >= goal!.targetValue ? "completed" : goal!.status;

    return prisma.environmentalGoal.update({
      where: { id },
      data: { currentValue, status: newStatus },
    });
  }
}
