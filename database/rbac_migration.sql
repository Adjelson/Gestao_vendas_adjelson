-- Create Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    label VARCHAR(100) NOT NULL,
    description TEXT
);

-- Create Permissions Table
CREATE TABLE IF NOT EXISTS permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- Create Role-Permissions Table
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- Seed Permissions
INSERT INTO permissions (code, description) VALUES
('DASHBOARD_VIEW', 'Visualizar Dashboard Geral'),
('SALES_VIEW_ALL', 'Visualizar Todas as Vendas'),
('SALES_VIEW_OWN', 'Visualizar Próprias Vendas'),
('SALES_CREATE', 'Registar Vendas'),
('USERS_MANAGE', 'Gerir Utilizadores'),
('PRODUCTS_MANAGE', 'Gerir Produtos'),
('COMPANY_SETTINGS', 'Gerir Definições da Empresa'),
('REPORTS_EXPORT', 'Exportar Relatórios')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- Seed Roles
INSERT INTO roles (name, label, description) VALUES
('SUPER_ADMIN', 'Super Administrador', 'Acesso total ao sistema'),
('COMPANY_ADMIN', 'administrador da Empresa', 'Gestão total da empresa'),
('MANAGER', 'Gerente', 'Gestão de loja e equipa'),
('SELLER', 'Vendedor', 'Registo de vendas'),
('CASHIER', 'Caixa', 'Operações de caixa'),
('FINANCIAL', 'Financeiro', 'Acesso a relatórios financeiros'),
('VIEWER', 'Consulta', 'Apenas visualização')
ON DUPLICATE KEY UPDATE label=VALUES(label);

-- Map Permissions to Roles (Example Setup)
-- Admin: All Permissions (handled via logic or full mapping, mapping here for consistency)
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'COMPANY_ADMIN';

-- Seller: Create Sales, View Own Sales, View Dashboard (limited)
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'SELLER' AND p.code IN ('SALES_CREATE', 'SALES_VIEW_OWN', 'DASHBOARD_VIEW');

-- Financial: View All Sales, Export Reports, Dashboard
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'FINANCIAL' AND p.code IN ('SALES_VIEW_ALL', 'DASHBOARD_VIEW', 'REPORTS_EXPORT');

-- Update Users Table to use Role ID (Migration step)
-- Add role_id column if not exists
SET @dbname = DATABASE();
SET @tablename = "users";
SET @columnname = "role_id";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 1",
  "ALTER TABLE users ADD COLUMN role_id INT DEFAULT NULL, ADD CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES roles(id);"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Migrate existing string roles to role_id
UPDATE users u 
JOIN roles r ON u.role = r.name 
SET u.role_id = r.id 
WHERE u.role_id IS NULL;

-- Default fallback for nulls (optional, e.g. to SELLER)
UPDATE users SET role_id = (SELECT id FROM roles WHERE name='SELLER') WHERE role_id IS NULL;
