-- Seed Data for EcoSphere ESG Management Platform
-- Safe to execute against the PostgreSQL database schema

-- Variables are simulated using UUID constants for stability across environments
-- Organization ID: '81bbfa12-32a2-4aeb-8c65-680cb7f10b78'
-- Admin User ID: 'a7801a61-6893-4ee1-b0db-bcf5c34e0682'

-- 1. Insert Seed Organization
INSERT INTO organizations (id, name, tax_identifier, industry_sector, headquarters_country, created_at, updated_at)
VALUES (
    '81bbfa12-32a2-4aeb-8c65-680cb7f10b78',
    'EcoSphere Technologies Inc.',
    'US-987654321',
    'Technology & Manufacturing',
    'United States',
    NOW(),
    NOW()
);

-- 2. Insert Seed User (Admin User)
-- Password Hash represents encrypted value of 'EcoSphere2026!'
INSERT INTO users (id, organization_id, email, password_hash, first_name, last_name, is_active, mfa_enabled, created_at, updated_at)
VALUES (
    'a7801a61-6893-4ee1-b0db-bcf5c34e0682',
    '81bbfa12-32a2-4aeb-8c65-680cb7f10b78',
    'admin@ecosphere.com',
    '$2b$12$L7pBghf2P77V8HqNCOvIqub2z17VpY2zZc6bK3aI5T4uC1oK3w1K.',
    'Elena',
    'Rostova',
    TRUE,
    FALSE,
    NOW(),
    NOW()
);

-- Update organization audit fields
UPDATE organizations
SET created_by = 'a7801a61-6893-4ee1-b0db-bcf5c34e0682', updated_by = 'a7801a61-6893-4ee1-b0db-bcf5c34e0682'
WHERE id = '81bbfa12-32a2-4aeb-8c65-680cb7f10b78';

-- Update user audit fields
UPDATE users
SET created_by = 'a7801a61-6893-4ee1-b0db-bcf5c34e0682', updated_by = 'a7801a61-6893-4ee1-b0db-bcf5c34e0682'
WHERE id = 'a7801a61-6893-4ee1-b0db-bcf5c34e0682';

-- 3. Insert Roles
INSERT INTO roles (id, organization_id, name, description, is_system, created_by, updated_by)
VALUES 
    ('31ad3490-50d4-4bb0-8012-70b15e12f682', '81bbfa12-32a2-4aeb-8c65-680cb7f10b78', 'System Administrator', 'Full system configuration, tenant management, and user management privileges.', TRUE, 'a7801a61-6893-4ee1-b0db-bcf5c34e0682', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682'),
    ('b8f36c53-61a8-48b0-8e10-bf9c0ea49e91', '81bbfa12-32a2-4aeb-8c65-680cb7f10b78', 'ESG Officer', 'Authorized to manage carbon factors, read consumption data, and run compliance reports.', FALSE, 'a7801a61-6893-4ee1-b0db-bcf5c34e0682', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682'),
    ('222df140-5e3e-4fb1-bc29-411a0daee6ea', '81bbfa12-32a2-4aeb-8c65-680cb7f10b78', 'Facility Manager', 'Logs localized energy, water, and waste metrics for assigned facilities.', FALSE, 'a7801a61-6893-4ee1-b0db-bcf5c34e0682', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682'),
    ('ec3583cb-9189-44d4-9d5b-a64d603aef01', '81bbfa12-32a2-4aeb-8c65-680cb7f10b78', 'General Employee', 'Standard permissions to participate in green challenges, check in CSR hours, and view team leaderboards.', FALSE, 'a7801a61-6893-4ee1-b0db-bcf5c34e0682', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682');

-- 4. Insert Permissions
INSERT INTO permissions (id, organization_id, action, description, created_by, updated_by)
VALUES 
    ('e1122a33-44bb-55cc-66dd-77ee88ff9901', '81bbfa12-32a2-4aeb-8c65-680cb7f10b78', 'admin:*', 'All administrative permissions.', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682'),
    ('e1122a33-44bb-55cc-66dd-77ee88ff9902', '81bbfa12-32a2-4aeb-8c65-680cb7f10b78', 'metrics:write', 'Log energy, water, and waste values.', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682'),
    ('e1122a33-44bb-55cc-66dd-77ee88ff9903', '81bbfa12-32a2-4aeb-8c65-680cb7f10b78', 'metrics:read', 'Read environmental data reports.', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682'),
    ('e1122a33-44bb-55cc-66dd-77ee88ff9904', '81bbfa12-32a2-4aeb-8c65-680cb7f10b78', 'gamification:participate', 'Join challenges and redeem rewards.', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682');

-- 5. Associate Roles with Permissions
INSERT INTO role_permissions (id, role_id, permission_id, created_by, updated_by)
VALUES 
    -- Sys Admin has admin:*
    (gen_random_uuid(), '31ad3490-50d4-4bb0-8012-70b15e12f682', 'e1122a33-44bb-55cc-66dd-77ee88ff9901', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682'),
    -- ESG Officer has metrics:read and metrics:write
    (gen_random_uuid(), 'b8f36c53-61a8-48b0-8e10-bf9c0ea49e91', 'e1122a33-44bb-55cc-66dd-77ee88ff9902', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682'),
    (gen_random_uuid(), 'b8f36c53-61a8-48b0-8e10-bf9c0ea49e91', 'e1122a33-44bb-55cc-66dd-77ee88ff9903', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682'),
    -- Facility Manager has metrics:write
    (gen_random_uuid(), '222df140-5e3e-4fb1-bc29-411a0daee6ea', 'e1122a33-44bb-55cc-66dd-77ee88ff9902', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682'),
    -- Employee has gamification:participate
    (gen_random_uuid(), 'ec3583cb-9189-44d4-9d5b-a64d603aef01', 'e1122a33-44bb-55cc-66dd-77ee88ff9904', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682');

-- Assign Admin user to System Admin role
INSERT INTO user_roles (id, user_id, role_id, created_by, updated_by)
VALUES (gen_random_uuid(), 'a7801a61-6893-4ee1-b0db-bcf5c34e0682', '31ad3490-50d4-4bb0-8012-70b15e12f682', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682');

-- 6. Insert Locations
INSERT INTO locations (id, organization_id, name, type, address, city, region, country, latitude, longitude, grid_emission_factor, created_by, updated_by)
VALUES
    ('2aa88aa9-33bb-44cc-55dd-66ee77ff8801', '81bbfa12-32a2-4aeb-8c65-680cb7f10b78', 'Austin Headquarters', 'Office', '100 Congress Ave', 'Austin', 'Texas', 'United States', 30.2672, -97.7431, 0.354000, 'a7801a61-6893-4ee1-b0db-bcf5c34e0682', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682'),
    ('2aa88aa9-33bb-44cc-55dd-66ee77ff8802', '81bbfa12-32a2-4aeb-8c65-680cb7f10b78', 'Munich Assembly Facility', 'Factory', 'Werner-von-Siemens-Ring 15', 'Munich', 'Bavaria', 'Germany', 48.1351, 11.5820, 0.312000, 'a7801a61-6893-4ee1-b0db-bcf5c34e0682', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682');

-- 7. Insert Departments & Teams
INSERT INTO departments (id, organization_id, location_id, name, code, created_by, updated_by)
VALUES
    ('4d44ee44-55ff-66aa-77bb-88cc99dd0001', '81bbfa12-32a2-4aeb-8c65-680cb7f10b78', '2aa88aa9-33bb-44cc-55dd-66ee77ff8801', 'Engineering', 'ENG', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682'),
    ('4d44ee44-55ff-66aa-77bb-88cc99dd0002', '81bbfa12-32a2-4aeb-8c65-680cb7f10b78', '2aa88aa9-33bb-44cc-55dd-66ee77ff8802', 'Production Assembly', 'PROD', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682');

INSERT INTO teams (id, department_id, name, created_by, updated_by)
VALUES
    ('5e55ee55-66aa-77bb-88cc-99dd00ee0001', '4d44ee44-55ff-66aa-77bb-88cc99dd0001', 'Platform Engineering', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682'),
    ('5e55ee55-66aa-77bb-88cc-99dd00ee0002', '4d44ee44-55ff-66aa-77bb-88cc99dd0002', 'Assembly Team Alpha', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682');

-- 8. Insert Emission Sources (Standard Real-world factors)
INSERT INTO emission_sources (id, location_id, name, scope, source_type, fuel_type, unit_of_measure, emission_factor, created_by, updated_by)
VALUES
    -- Scope 1 (Direct Stationary) Natural Gas - Factor: ~2.021 kg CO2e per m3
    ('e7711aa7-88bb-99cc-00dd-11ee22ff3301', '2aa88aa9-33bb-44cc-55dd-66ee77ff8801', 'Austin Office Boiler', 'Scope 1', 'Stationary Combustion', 'Natural Gas', 'm3', 2.021000, 'a7801a61-6893-4ee1-b0db-bcf5c34e0682', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682'),
    -- Scope 1 (Direct Mobile) Fleet Truck - Factor: ~2.68 kg CO2e per Liter of Diesel
    ('e7711aa7-88bb-99cc-00dd-11ee22ff3302', '2aa88aa9-33bb-44cc-55dd-66ee77ff8802', 'Munich Logistics Van A', 'Scope 1', 'Mobile Combustion', 'Diesel', 'Liter', 2.680000, 'a7801a61-6893-4ee1-b0db-bcf5c34e0682', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682'),
    -- Scope 2 (Indirect Electricity) - Uses regional location factors
    ('e7711aa7-88bb-99cc-00dd-11ee22ff3303', '2aa88aa9-33bb-44cc-55dd-66ee77ff8801', 'Austin HQ Grid Connection', 'Scope 2', 'Purchased Electricity', 'Electricity', 'kWh', 0.354000, 'a7801a61-6893-4ee1-b0db-bcf5c34e0682', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682'),
    ('e7711aa7-88bb-99cc-00dd-11ee22ff3304', '2aa88aa9-33bb-44cc-55dd-66ee77ff8802', 'Munich Factory Grid Connection', 'Scope 2', 'Purchased Electricity', 'Electricity', 'kWh', 0.312000, 'a7801a61-6893-4ee1-b0db-bcf5c34e0682', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682');

-- 9. Insert Sample Carbon Emissions Data
INSERT INTO carbon_emissions (id, organization_id, location_id, emission_source_id, start_date, end_date, raw_value, co2_emissions_mt, ch4_emissions_mt, n2o_emissions_mt, total_co2e_mt, calculation_method, created_by, updated_by)
VALUES
    -- Austin HQ Scope 2 emissions for Q1 2026: 120,000 kWh * 0.354 kg/kWh = 42.48 metric tons CO2e
    (gen_random_uuid(), '81bbfa12-32a2-4aeb-8c65-680cb7f10b78', '2aa88aa9-33bb-44cc-55dd-66ee77ff8801', 'e7711aa7-88bb-99cc-00dd-11ee22ff3303', '2026-01-01', '2026-03-31', 120000.0000, 42.200000, 0.180000, 0.100000, 42.480000, 'EPA eGRID 2024 emission factor calculation', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682');

-- 10. Insert Environmental Goals
INSERT INTO environmental_goals (id, organization_id, name, metric_type, target_value, baseline_value, baseline_year, target_year, current_value, created_by, updated_by)
VALUES
    (gen_random_uuid(), '81bbfa12-32a2-4aeb-8c65-680cb7f10b78', 'Net Zero Scope 2 Emissions', 'Carbon', 0.0000, 180.5000, 2024, 2030, 42.4800, 'a7801a61-6893-4ee1-b0db-bcf5c34e0682', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682');

-- 11. Insert Settings
INSERT INTO settings (id, organization_id, key, value, created_by, updated_by)
VALUES
    (gen_random_uuid(), '81bbfa12-32a2-4aeb-8c65-680cb7f10b78', 'esg_reporting_currency', '"USD"', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682'),
    (gen_random_uuid(), '81bbfa12-32a2-4aeb-8c65-680cb7f10b78', 'alert_thresholds', '{"carbon_variance_pct": 15.0, "waste_target_exceeded": true}', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682', 'a7801a61-6893-4ee1-b0db-bcf5c34e0682');
