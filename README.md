# SIGI - Sistema de Gestão Integrada

O **SIGI** é uma solução completa para a gestão de pequenos e médios negócios, centralizando vendas, stock, clientes e relatórios numa interface moderna e intuitiva.

## 🚀 Funcionalidades Principais

*   **Ponto de Venda (POS)**: Interface de vendas rápida com carrinho, seleção de produtos e clientes.
*   **Gestão de Vendas**: Histórico detalhado com filtros, paginação, ordenação e exportação CSV.
*   **Gestão de Produtos**: Catálogo de produtos com categorias e preços.
*   **Gestão de Clientes**: Base de dados de clientes com histórico de compras.
*   **Controlo de Acesso (RBAC)**: Perfis diferenciados para Administradores, Gerentes e Vendedores.
*   **Multi-Empresa**: Suporte a múltiplas empresas com registo independente e seleção de planos.
*   **Dashboard**: Visão geral do negócio com gráficos e métricas chave em tempo real.
*   **Segurança**: Autenticação JWT segura e proteção contra acessos não autorizados.

## 🛠️ Tecnologias Utilizadas

### Frontend
*   **React** (Vite): Framework principal.
*   **TypeScript**: Tipagem estática para maior robustez.
*   **Tailwind CSS**: Estilização moderna e responsiva.
*   **Lucide React**: Ícones vetoriais.
*   **React Query**: Gestão de estado do servidor e caching.
*   **Formik + Yup**: Gestão e validação de formulários complexos.

### Backend
*   **Node.js & Express**: API RESTful robusta.
*   **MySQL**: Base de dados relacional.
*   **JWT**: Autenticação segura via JSON Web Tokens.
*   **Bcrypt**: Hashing de palavras-passe.

## 📦 Instalação e Configuração

### Pré-requisitos
*   Node.js (v18 ou superior)
*   MySQL Server

### 1. Configuração da Base de Dados
Certifique-se de que o MySQL está a correr. Crie uma base de dados (ex: `gestao_db`) e configure as variáveis de ambiente.

### 2. Configuração do Backend
```bash
cd backend
npm install
npm run migrate # (Opcional: Se tiver script de migração)
node seed.js    # Para popular a base de dados com dados iniciais
npm run dev
```
O servidor iniciará na porta `3000`.

### 3. Configuração do Frontend
```bash
cd frontend
npm install
npm run dev
```
A aplicação ficará disponível em `http://localhost:5173`.

## 🧪 Contas de Teste (Seed)

Se correu o `seed.js`, pode usar as seguintes credenciais:

| Perfil | Email | Senha |
|---|---|---|
| **Admin** | `admin@test.com` | `123456` |
| **Gerente** | `manager@test.com` | `123456` |
| **Vendedor** | `joao@test.com` | `123456` |

## 📄 Estrutura do Projeto

```
/
├── backend/            # API e Lógica de Servidor
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── ...
│   └── seed.js         # Script de dados iniciais
└── frontend/           # Interface de Utilizador React
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   └── ...
    └── ...
```

## ✨ Licença
Todos os direitos reservados © 2025 SIGI.
