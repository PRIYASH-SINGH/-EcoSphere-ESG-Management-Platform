// ──────────────────────────────────────────────
// Generic in-memory store
// Replace each store instance with Drizzle DB queries when the database is ready.
// ──────────────────────────────────────────────

export class InMemoryStore<T extends { id: number }> {
  private items: T[] = [];
  private nextId = 1;

  /** Seed initial data (for dev/testing) */
  seed(data: T[]): void {
    this.items = [...data];
    const maxId = data.reduce((max, item) => Math.max(max, item.id), 0);
    this.nextId = maxId + 1;
  }

  /** Create a new record. Auto-assigns `id`. */
  create(data: Omit<T, "id">): T {
    const item = { ...data, id: this.nextId++ } as T;
    this.items.push(item);
    return item;
  }

  /** Return all records, optionally filtered by a partial match. */
  findAll(filter?: Partial<T>): T[] {
    if (!filter) return [...this.items];
    return this.items.filter((item) =>
      Object.entries(filter).every(
        ([key, value]) => item[key as keyof T] === value
      )
    );
  }

  /** Find a single record by id. */
  findById(id: number): T | undefined {
    return this.items.find((item) => item.id === id);
  }

  /** Find the first record matching a predicate. */
  findOne(predicate: (item: T) => boolean): T | undefined {
    return this.items.find(predicate);
  }

  /** Find all records matching a predicate. */
  findMany(predicate: (item: T) => boolean): T[] {
    return this.items.filter(predicate);
  }

  /** Update a record by id. Returns the updated record or undefined. */
  update(id: number, data: Partial<T>): T | undefined {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return undefined;
    this.items[index] = { ...this.items[index], ...data };
    return this.items[index];
  }

  /** Delete a record by id. Returns true if deleted. */
  delete(id: number): boolean {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return false;
    this.items.splice(index, 1);
    return true;
  }

  /** Count records, optionally filtered. */
  count(predicate?: (item: T) => boolean): number {
    if (!predicate) return this.items.length;
    return this.items.filter(predicate).length;
  }

  /** Paginated query. */
  paginate(
    offset: number,
    limit: number,
    predicate?: (item: T) => boolean
  ): { items: T[]; total: number } {
    const filtered = predicate ? this.items.filter(predicate) : [...this.items];
    return {
      items: filtered.slice(offset, offset + limit),
      total: filtered.length,
    };
  }
}

// ──────────────────────────────────────────────
// Store instances — one per entity
// When DB is ready: delete these, import drizzle `db` instead.
// ──────────────────────────────────────────────

import type {
  User,
  Department,
  Category,
  EmissionFactor,
  CarbonTransaction,
  EnvironmentalGoal,
  CsrActivity,
  EmployeeParticipation,
  DiversityMetric,
  PolicyAcknowledgement,
  Audit,
  ComplianceIssue,
  Challenge,
  ChallengeParticipation,
  Badge,
  UserBadge,
  Reward,
  RewardRedemption,
  DepartmentScore,
  AuditLog,
} from "../types/index.js";

export const users = new InMemoryStore<User>();
export const departments = new InMemoryStore<Department>();
export const categories = new InMemoryStore<Category>();
export const emissionFactors = new InMemoryStore<EmissionFactor>();
export const carbonTransactions = new InMemoryStore<CarbonTransaction>();
export const environmentalGoals = new InMemoryStore<EnvironmentalGoal>();
export const csrActivities = new InMemoryStore<CsrActivity>();
export const employeeParticipations = new InMemoryStore<EmployeeParticipation>();
export const diversityMetrics = new InMemoryStore<DiversityMetric>();
export const policyAcknowledgements = new InMemoryStore<PolicyAcknowledgement>();
export const audits = new InMemoryStore<Audit>();
export const complianceIssues = new InMemoryStore<ComplianceIssue>();
export const challenges = new InMemoryStore<Challenge>();
export const challengeParticipations = new InMemoryStore<ChallengeParticipation>();
export const badges = new InMemoryStore<Badge>();
export const userBadges = new InMemoryStore<UserBadge>();
export const rewards = new InMemoryStore<Reward>();
export const rewardRedemptions = new InMemoryStore<RewardRedemption>();
export const departmentScores = new InMemoryStore<DepartmentScore>();
export const auditLogs = new InMemoryStore<AuditLog>();
