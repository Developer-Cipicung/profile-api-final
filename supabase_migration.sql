-- Migration to add Role-Based Access Control (RBAC)

-- 1. Add the role column if it doesn't exist. 
-- We temporarily omit the NOT NULL and DEFAULT constraint to avoid errors if the table is already populated.
ALTER TABLE admins ADD COLUMN IF NOT EXISTS role VARCHAR(50);

-- 2. Set all existing administrators to SUPER_ADMIN to prevent lockouts.
UPDATE admins SET role = 'SUPER_ADMIN' WHERE role IS NULL;

-- 3. Apply the NOT NULL constraint and DEFAULT value now that all rows have a role.
ALTER TABLE admins ALTER COLUMN role SET NOT NULL;
ALTER TABLE admins ALTER COLUMN role SET DEFAULT 'PROFILE_ADMIN';

-- 4. Apply the CHECK constraint to enforce allowed roles.
-- Drop it first if it exists to make it idempotent
ALTER TABLE admins DROP CONSTRAINT IF EXISTS admins_role_check;
ALTER TABLE admins ADD CONSTRAINT admins_role_check CHECK (role IN ('SUPER_ADMIN', 'PROFILE_ADMIN', 'MARKETING_ADMIN'));
