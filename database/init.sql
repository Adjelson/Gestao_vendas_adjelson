-- Criação da Base de Dados
CREATE DATABASE IF NOT EXISTS dashboard_vendas;
USE dashboard_vendas;

-- --------------------------------------------------------
-- Tabela de Utilizadores
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'OPERATOR') DEFAULT 'OPERATOR',
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Tabela de Produtos
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    category VARCHAR(50),
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Tabela de Vendas
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    user_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- --------------------------------------------------------
-- Tabela de Itens de Venda
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS sales_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    line_total DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- --------------------------------------------------------
-- Índices para Performance (Sugestão)
-- --------------------------------------------------------
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_products_category ON products(category);

-- --------------------------------------------------------
-- Seed Data (Utilizador Admin Inicial)
-- Password: "admin" (hash gerado para exemplo, pode variar conforme algoritmo no backend)
-- Para o MVP, assumimos que o backend vai gerar o hash correto. 
-- Aqui usamos placeholder. A seed real deve ser feita pelo backend ou script de seed.
-- --------------------------------------------------------
-- INSERT INTO users (name, email, password_hash, role) VALUES ('Admin', 'admin@admin.com', '$2b$10$YourHashedPasswordHere', 'ADMIN');
