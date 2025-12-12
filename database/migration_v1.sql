-- Migration V1: Add Companies and Multi-tenancy Support

USE dashboard_vendas;

-- 1. Create Companies Table
CREATE TABLE IF NOT EXISTS companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    nif VARCHAR(20),
    address TEXT,
    currency VARCHAR(10) DEFAULT 'EUR',
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Create Default Company (to migrate existing data)
INSERT INTO companies (name, currency) 
SELECT 'Minha Empresa', 'EUR' 
WHERE NOT EXISTS (SELECT * FROM companies);

-- Store default company id in a variable for use (MySQL variable syntax)
SET @default_company_id = (SELECT id FROM companies LIMIT 1);

-- 3. Update Users Table
-- Add company_id
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_id INT AFTER id;
-- Update existing users to belong to default company
UPDATE users SET company_id = @default_company_id WHERE company_id IS NULL;
-- Add FK
ALTER TABLE users ADD CONSTRAINT fk_users_company FOREIGN KEY (company_id) REFERENCES companies(id);

-- Add Permission JSON column
ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSON AFTER role;

-- Update Enum for Role (Workaround to change ENUM values)
-- Current: 'ADMIN', 'OPERATOR'
-- New: 'SUPER_ADMIN', 'COMPANY_ADMIN', 'EMPLOYEE'
ALTER TABLE users MODIFY COLUMN role ENUM('ADMIN', 'OPERATOR', 'SUPER_ADMIN', 'COMPANY_ADMIN', 'EMPLOYEE') DEFAULT 'EMPLOYEE';

-- Migrate Roles
UPDATE users SET role = 'COMPANY_ADMIN' WHERE role = 'ADMIN';
UPDATE users SET role = 'EMPLOYEE' WHERE role = 'OPERATOR';

-- Clean up ENUM permissions (Optional, but good for strictness. 
-- In MySQL, modifying to remove old values that aren't used is safe)
ALTER TABLE users MODIFY COLUMN role ENUM('SUPER_ADMIN', 'COMPANY_ADMIN', 'EMPLOYEE') DEFAULT 'EMPLOYEE';

-- 4. Update Products Table
ALTER TABLE products ADD COLUMN IF NOT EXISTS company_id INT AFTER id;
UPDATE products SET company_id = @default_company_id WHERE company_id IS NULL;
ALTER TABLE products ADD CONSTRAINT fk_products_company FOREIGN KEY (company_id) REFERENCES companies(id);

-- 5. Update Sales Table
ALTER TABLE sales ADD COLUMN IF NOT EXISTS company_id INT AFTER id;
UPDATE sales SET company_id = @default_company_id WHERE company_id IS NULL;
ALTER TABLE sales ADD CONSTRAINT fk_sales_company FOREIGN KEY (company_id) REFERENCES companies(id);

-- Add indexes for company-based lookups
CREATE INDEX idx_products_company ON products(company_id);
CREATE INDEX idx_sales_company ON sales(company_id);
CREATE INDEX idx_users_company ON users(company_id);

SELECT 'Migration completed successfully.' as status;
