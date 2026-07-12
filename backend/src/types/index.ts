// ──────────────────────────────────────────────
// EcoSphere ESG — Shared Type Definitions
// ──────────────────────────────────────────────

// ── Enums / Literals ──────────────────────────

export type UserRole = "admin" | "fleet_manager" | "employee";

export type CategoryType = "environmental" | "social" | "governance";

export type ParticipationStatus = "pending" | "approved" | "rejected";

export type GoalStatus = "active" | "completed" | "missed";

export type ActivityStatus = "upcoming" | "active" | "completed";

export type AuditStatus = "scheduled" | "in_progress" | "completed";

export type Severity = "low" | "medium" | "high" | "critical";

export type ComplianceStatus = "open" | "in_progress" | "resolved" | "closed";

export type Difficulty = "easy" | "medium" | "hard";

export type ChallengeStatus = "active" | "completed" | "expired";

export type ChallengeParticipationStatus =
  | "started"
  | "submitted"
  | "approved"
  | "rejected";

// ── Core ──────────────────────────────────────

export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  departmentId: number | null;
  totalXp: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Safe user object (no password) */
export type SafeUser = Omit<User, "password">;

export interface Department {
  id: number;
  name: string;
  code: string;
  head: string | null;
  parentDeptId: number | null;
  createdAt: Date;
}

export interface Category {
  id: number;
  name: string;
  type: CategoryType;
  description: string | null;
  createdAt: Date;
}

// ── Environmental ─────────────────────────────

export interface EmissionFactor {
  id: number;
  name: string;
  factor: number;
  unit: string;
  categoryId: number | null;
  createdAt: Date;
}

export interface CarbonTransaction {
  id: number;
  source: string;
  emissionFactorId: number;
  value: number;
  carbonEmitted: number;
  departmentId: number;
  date: Date;
  createdBy: number;
  createdAt: Date;
}

export interface EnvironmentalGoal {
  id: number;
  title: string;
  targetValue: number;
  currentValue: number;
  departmentId: number;
  deadline: Date;
  status: GoalStatus;
  createdAt: Date;
}

// ── Social ────────────────────────────────────

export interface CsrActivity {
  id: number;
  title: string;
  description: string;
  categoryId: number | null;
  startDate: Date;
  endDate: Date;
  status: ActivityStatus;
  createdAt: Date;
}

export interface EmployeeParticipation {
  id: number;
  userId: number;
  csrActivityId: number;
  proof: string | null;
  status: ParticipationStatus;
  pointsEarned: number;
  approvedBy: number | null;
  createdAt: Date;
}

export interface DiversityMetric {
  id: number;
  metric: string;
  value: number;
  departmentId: number | null;
  date: Date;
  createdAt: Date;
}

// ── Governance ────────────────────────────────

export interface PolicyAcknowledgement {
  id: number;
  userId: number;
  policyName: string;
  acknowledgedAt: Date;
}

export interface Audit {
  id: number;
  title: string;
  departmentId: number;
  auditor: string;
  auditDate: Date;
  findings: string | null;
  status: AuditStatus;
  createdAt: Date;
}

export interface ComplianceIssue {
  id: number;
  auditId: number | null;
  severity: Severity;
  description: string;
  owner: string;
  dueDate: Date;
  status: ComplianceStatus;
  createdAt: Date;
}

// ── Gamification ──────────────────────────────

export interface Challenge {
  id: number;
  title: string;
  categoryId: number | null;
  description: string;
  xpReward: number;
  difficulty: Difficulty;
  deadline: Date | null;
  status: ChallengeStatus;
  createdAt: Date;
}

export interface ChallengeParticipation {
  id: number;
  userId: number;
  challengeId: number;
  proof: string | null;
  status: ChallengeParticipationStatus;
  xpAwarded: number;
  createdAt: Date;
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  unlockRule: string;
  icon: string | null;
  createdAt: Date;
}

export interface UserBadge {
  id: number;
  userId: number;
  badgeId: number;
  earnedAt: Date;
}

export interface Reward {
  id: number;
  name: string;
  description: string;
  pointsRequired: number;
  stock: number;
  createdAt: Date;
}

export interface RewardRedemption {
  id: number;
  userId: number;
  rewardId: number;
  redeemedAt: Date;
}

// ── Reports ───────────────────────────────────

export interface DepartmentScore {
  id: number;
  departmentId: number;
  date: Date;
  environmental: number;
  social: number;
  governance: number;
  total: number;
}

export interface AuditLog {
  id: number;
  userId: number;
  action: string;
  entity: string;
  entityId: number;
  details: string | null;
  timestamp: Date;
}

// ── Express Augmentation ──────────────────────

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  departmentId: number | null;
}

// Augment Express Request
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// ── API Response Types ────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  limit: number;
  offset: number;
}
