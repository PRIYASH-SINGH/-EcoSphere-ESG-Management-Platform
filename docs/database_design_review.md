# Database Design & Architecture Review: EcoSphere ESG Platform

This document serves as the complete technical blueprint and review of the Database Architecture for the **EcoSphere ESG Management Platform**. Designed for Enterprise SaaS standards, it details normalization patterns, multi-tenancy isolation, index layouts, and time-series optimizations.

---

## 1. Architectural Highlights

### Multi-Tenancy Isolation
Data isolation is enforced at the database engine layer via **PostgreSQL Row-Level Security (RLS)** rather than relying solely on query filters in backend code.
*   The parent table `organizations` acts as the root boundary.
*   Every child table contains an `organization_id` column.
*   RLS policies evaluate access via a localized session variable: `CURRENT_SETTING('app.current_organization_id', true)`.

### 3NF Compliance & Calculations snapped
Master and relational tables adhere strictly to **Third Normal Form (3NF)**:
*   Physical properties (energy, water, waste) are logged separately from demographic details (employee, departments).
*   **Audit Snapshots**: Calculated CO2e output records store a static snapshot of the raw consumption value, conversion factor used, and reference document. This ensures retro-calculation stability when emissions methodologies or grid grid factors change annually.

---

## 2. Model & Schema Definitions

The database includes **41 tables** categorized across 8 operational modules:
1.  **Authentication & Security**: RBAC schemas mapping Users, Roles, Permissions, UserRoles, and RolePermissions.
2.  **Organization Structure**: Multi-layered company trees (Organizations -> Locations -> Departments -> Teams -> Employees).
3.  **Environmental Module**: Logs physical raw inputs (Energy, Water, Waste, Renewables), emission sources, factors, and computed Greenhouse Gas (GHG) outputs.
4.  **Social Module**: Tracks CSR engagement, volunteer programs, health & safety indicators (LTIFR), and workforce diversity metrics.
5.  **Governance Module**: Manages audits, compliance issues, policies, risk registers, board members, and operational incidents.
6.  **Gamification Module**: Drives sustainable initiatives via Challenges, Rewards, Badges, Points Ledgers, and Leaderboards.
7.  **Reports & Analytics**: Caches aggregated analytics (`kpi_metrics`) and logs generated file hashes (`generated_reports`).
8.  **System Module**: System settings, user activity logs, and JSON-based audit log changesets.

### Schema Configurations
*   **Prisma Mapping**: Located at [schema.prisma](file:///a:/-EcoSphere-ESG-Management-Platform/backend/prisma/schema.prisma).
*   **Seed Script**: Located at [seed.sql](file:///a:/-EcoSphere-ESG-Management-Platform/backend/prisma/seed.sql).

---

## 3. High Performance & Scalability Strategy

### A. Indexing Blueprint
*   **Partial Indexes**: Configured on active records (`WHERE is_deleted = FALSE`), decreasing overall index size by ignoring soft-deleted rows.
*   **Composite Indexing**: Applied on time-series queries to optimize analytical dashboard ranges:
    `CREATE INDEX idx_carbon_emissions_rollup ON carbon_emissions(organization_id, location_id, start_date, end_date);`
*   **GIN Indexes**: Implemented on dynamic JSONB columns like `audit_logs(new_state)` and `kpi_metrics(dimensions)` to allow fast querying of nested keys.

### B. Time-Series Partitioning
To manage continuous data streams from facilities and utilities, range-based partitioning is recommended for tables like `carbon_emissions` and `audit_logs` using year boundaries.

```sql
CREATE TABLE carbon_emissions (
    id UUID,
    organization_id UUID NOT NULL,
    start_date DATE NOT NULL,
    total_co2e_mt NUMERIC,
    PRIMARY KEY (id, start_date)
) PARTITION BY RANGE (start_date);
```

### C. Automatic Modified Column Triggers
Enforced via database triggers, updating `updated_at` timestamps on record modification:
```sql
CREATE TRIGGER update_organizations_modtime
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();
```

---

## 4. Database Security Best Practices
1.  **Strict TLS Enforcement**: Force SSL/TLS v1.3 for all database connections in transit.
2.  **Least Privilege Database Roles**:
    *   `migration_runner`: Full DDL privileges (table alterations/migrations).
    *   `app_client`: Standard DML privileges (`SELECT`, `INSERT`, `UPDATE`), restricted from dropping tables.
3.  **Cryptographic Signatures**: Generated reports include a SHA-256 hash checksum stored in `generated_reports(checksum)` to verify report integrity.
