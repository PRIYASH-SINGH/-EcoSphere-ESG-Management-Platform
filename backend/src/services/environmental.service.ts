import {
  emissionFactors,
  carbonTransactions,
  environmentalGoals,
} from "../store/index.js";
import type {
  EmissionFactor,
  CarbonTransaction,
  EnvironmentalGoal,
} from "../types/index.js";

// ── Helper: structured error with statusCode ──
class ServiceError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

// ── Input types ───────────────────────────────

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

// ── Service ───────────────────────────────────

export class EnvironmentalService {
  // ─── Emission Factors ─────────────────────

  createEmissionFactor(data: CreateEmissionFactorInput): EmissionFactor {
    return emissionFactors.create({
      name: data.name,
      factor: data.factor,
      unit: data.unit,
      categoryId: data.categoryId ?? null,
      createdAt: new Date(),
    });
  }

  getAllEmissionFactors(): EmissionFactor[] {
    return emissionFactors.findAll();
  }

  updateEmissionFactor(
    id: number,
    data: Partial<CreateEmissionFactorInput>
  ): EmissionFactor {
    const updated = emissionFactors.update(id, data);
    if (!updated) {
      throw new ServiceError(
        `Emission factor with id ${id} not found`,
        404
      );
    }
    return updated;
  }

  deleteEmissionFactor(id: number): void {
    const deleted = emissionFactors.delete(id);
    if (!deleted) {
      throw new ServiceError(
        `Emission factor with id ${id} not found`,
        404
      );
    }
  }

  // ─── Carbon Transactions ──────────────────

  createCarbonTransaction(
    data: CreateCarbonTransactionInput
  ): CarbonTransaction {
    // Look up the emission factor to compute carbonEmitted
    const ef = emissionFactors.findById(data.emissionFactorId);
    if (!ef) {
      throw new ServiceError(
        `Emission factor with id ${data.emissionFactorId} not found`,
        404
      );
    }

    const carbonEmitted = data.value * ef.factor;

    return carbonTransactions.create({
      source: data.source,
      emissionFactorId: data.emissionFactorId,
      value: data.value,
      carbonEmitted,
      departmentId: data.departmentId,
      date: new Date(data.date),
      createdBy: data.createdBy,
      createdAt: new Date(),
    });
  }

  getCarbonTransactions(
    filters: CarbonTransactionFilters = {}
  ): CarbonTransaction[] {
    return carbonTransactions.findMany((tx) => {
      // Filter by departmentId
      if (
        filters.departmentId !== undefined &&
        tx.departmentId !== filters.departmentId
      ) {
        return false;
      }

      // Filter by date range
      if (filters.startDate) {
        const start = new Date(filters.startDate);
        if (new Date(tx.date) < start) return false;
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        if (new Date(tx.date) > end) return false;
      }

      return true;
    });
  }

  getCarbonSummary(filters: CarbonTransactionFilters = {}): {
    totalEmissions: number;
    byDepartment: { departmentId: number; totalEmissions: number }[];
    trend: { date: string; emissions: number }[];
  } {
    const transactions = this.getCarbonTransactions(filters);

    // Total emissions
    const totalEmissions = transactions.reduce(
      (sum, tx) => sum + tx.carbonEmitted,
      0
    );

    // Group by department
    const deptMap = new Map<number, number>();
    for (const tx of transactions) {
      const current = deptMap.get(tx.departmentId) ?? 0;
      deptMap.set(tx.departmentId, current + tx.carbonEmitted);
    }
    const byDepartment = Array.from(deptMap.entries()).map(
      ([departmentId, totalEmissions]) => ({ departmentId, totalEmissions })
    );

    // Trend: aggregate by date (YYYY-MM-DD)
    const trendMap = new Map<string, number>();
    for (const tx of transactions) {
      const dateKey = new Date(tx.date).toISOString().slice(0, 10);
      const current = trendMap.get(dateKey) ?? 0;
      trendMap.set(dateKey, current + tx.carbonEmitted);
    }
    const trend = Array.from(trendMap.entries())
      .map(([date, emissions]) => ({ date, emissions }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return { totalEmissions, byDepartment, trend };
  }

  // ─── Environmental Goals ──────────────────

  createGoal(data: CreateGoalInput): EnvironmentalGoal {
    return environmentalGoals.create({
      title: data.title,
      targetValue: data.targetValue,
      currentValue: 0,
      departmentId: data.departmentId,
      deadline: new Date(data.deadline),
      status: "active",
      createdAt: new Date(),
    });
  }

  getGoals(departmentId?: number): EnvironmentalGoal[] {
    if (departmentId !== undefined) {
      return environmentalGoals.findMany(
        (g) => g.departmentId === departmentId
      );
    }
    return environmentalGoals.findAll();
  }

  updateGoalProgress(
    id: number,
    currentValue: number
  ): EnvironmentalGoal {
    const goal = environmentalGoals.findById(id);
    if (!goal) {
      throw new ServiceError(
        `Environmental goal with id ${id} not found`,
        404
      );
    }

    const newStatus =
      currentValue >= goal.targetValue ? "completed" : goal.status;

    const updated = environmentalGoals.update(id, {
      currentValue,
      status: newStatus,
    });

    // update always succeeds here because we already confirmed the record exists
    return updated!;
  }
}
