const db = require('./src/config/db');
const bcrypt = require('bcryptjs');

const rolesMap = {};
const productIds = [];
const customerIds = [];
const userIds = [];

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDate = (daysBack) => {
    const date = new Date();
    date.setDate(date.getDate() - getRandomInt(0, daysBack));
    return date;
};

async function seed() {
    console.log('--- Starting Seeder ---');
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        // 1. Ensure Company Exists
        console.log('Seeding Company...');
        let [companies] = await connection.query('SELECT id FROM companies LIMIT 1');
        let company_id;
        if (companies.length === 0) {
            const [res] = await connection.query("INSERT INTO companies (name, nif, address, currency) VALUES ('Tech Store Demo', '999999999', 'Lisboa, Portugal', 'EUR')");
            company_id = res.insertId;
        } else {
            company_id = companies[0].id;
        }

        // 2. Fetch Roles (Assuming migration ran)
        console.log('Fetching Roles...');
        const [roles] = await connection.query('SELECT id, name FROM roles');
        if (roles.length === 0) {
            throw new Error('Roles table empty! Run migrate.js first.');
        }
        roles.forEach(r => rolesMap[r.name] = r.id);

        // 3. Create Users
        console.log('Seeding Users...');
        const passwordHash = await bcrypt.hash('123456', 10);
        
        const usersToCreate = [
            { name: 'Admin User', email: 'admin@test.com', role: 'COMPANY_ADMIN' },
            { name: 'Loja Manager', email: 'manager@test.com', role: 'MANAGER' },
            { name: 'João Vendedor', email: 'joao@test.com', role: 'SELLER' },
            { name: 'Maria Vendedora', email: 'maria@test.com', role: 'SELLER' },
            { name: 'Ana Caixa', email: 'ana@test.com', role: 'CASHIER' }
        ];

        for (const u of usersToCreate) {
            const roleId = rolesMap[u.role];
            // Check existence
            const [exists] = await connection.query('SELECT id FROM users WHERE email = ?', [u.email]);
            let uid;
            if (exists.length === 0) {
                const [res] = await connection.query(
                    'INSERT INTO users (name, email, password_hash, role, role_id, company_id, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)',
                    [u.name, u.email, passwordHash, u.role, roleId, company_id]
                );
                uid = res.insertId;
                console.log(`Created user: ${u.email}`);
            } else {
                uid = exists[0].id;
                // Update role_id just in case
                await connection.query('UPDATE users SET role_id = ? WHERE id = ?', [roleId, uid]);
                console.log(`User exists: ${u.email}`);
            }
            if(u.role === 'SELLER') userIds.push(uid); // Keep sellers for sales generation
        }
        // Fallback if no sellers created/found above (unlikely)
        if (userIds.length === 0) {
             const [anyUser] = await connection.query('SELECT id FROM users LIMIT 1');
             userIds.push(anyUser[0].id);
        }

        // 4. Seeding Products
        console.log('Seeding Products...');
        const products = [
            { name: 'Laptop Gaming', price: 1200.00, category: 'Computers' },
            { name: 'Mouse Wireless', price: 25.50, category: 'Accessories' },
            { name: 'Teclado Mecânico', price: 89.90, category: 'Accessories' },
            { name: 'Monitor 24"', price: 150.00, category: 'Monitors' },
            { name: 'Headset RGB', price: 55.00, category: 'Audio' },
            { name: 'Smartphone Pro', price: 999.00, category: 'Mobile' },
            { name: 'Cabo USB-C', price: 9.99, category: 'Cables' },
            { name: 'Webcam HD', price: 45.00, category: 'Peripherals' }
        ];

        for (const p of products) {
            const [exists] = await connection.query('SELECT id FROM products WHERE name = ?', [p.name]);
            if (exists.length === 0) {
                const [res] = await connection.query(
                    'INSERT INTO products (name, price, category, company_id) VALUES (?, ?, ?, ?)',
                    [p.name, p.price, p.category, company_id]
                );
                productIds.push(res.insertId);
            } else {
                productIds.push(exists[0].id);
            }
        }

        // 5. Seeding Customers
        console.log('Seeding Customers...');
        customersData = [
            { name: 'Cliente Final', nif: '999999990', email: 'cliente@mail.com', phone: '910000000' },
            { name: 'Empresa ABC', nif: '500100200', email: 'compras@abc.pt', phone: '210000000' },
            { name: 'Tech Solutions', nif: '500300400', email: 'info@tech.pt', phone: '220000000' },
            { name: 'Particular VIP', nif: '200300400', email: 'vip@mail.com', phone: '960000000' }
        ];

        for (const c of customersData) {
             const [exists] = await connection.query('SELECT id FROM customers WHERE nif = ?', [c.nif]);
             if (exists.length === 0) {
                 const [res] = await connection.query(
                     'INSERT INTO customers (name, nif, email, phone, company_id) VALUES (?, ?, ?, ?, ?)',
                     [c.name, c.nif, c.email, c.phone, company_id]
                 );
                 customerIds.push(res.insertId);
             } else {
                 customerIds.push(exists[0].id);
             }
        }

        // 6. Generate Sales
        console.log('Generating Sales History (this may take a moment)...');
        // Generate existing sales count check to avoid over-seeding if run multiple times
        const [salesCount] = await connection.query('SELECT COUNT(*) as c FROM sales');
        if (salesCount[0].c < 100) {
            const SALES_TO_GENERATE = 50;
            const channels = ['STORE', 'ONLINE', 'MOBILE'];

            for (let i = 0; i < SALES_TO_GENERATE; i++) {
                const userId = userIds[getRandomInt(0, userIds.length - 1)];
                const customerId = Math.random() > 0.3 ? customerIds[getRandomInt(0, customerIds.length - 1)] : null; // 70% chance of customer
                const channel = channels[getRandomInt(0, channels.length - 1)];
                const date = getRandomDate(60); // Last 60 days
                
                // Random items for this sale
                const numItems = getRandomInt(1, 4);
                let total = 0;
                let items = [];

                for (let j = 0; j < numItems; j++) {
                    const pid = productIds[getRandomInt(0, productIds.length - 1)];
                    // Get price (mock fetch, ideally we have it in map but fetching is safer for consistency)
                    const [prod] = await connection.query('SELECT price FROM products WHERE id = ?', [pid]);
                    const price = parseFloat(prod[0].price);
                    const qty = getRandomInt(1, 3);
                    
                    items.push({ pid, price, qty, line_total: price * qty });
                    total += price * qty;
                }

                // Insert Sale
                const [saleRes] = await connection.query(
                    'INSERT INTO sales (company_id, user_id, customer_id, total, sale_date, channel) VALUES (?, ?, ?, ?, ?, ?)',
                    [company_id, userId, customerId, total, date, channel]
                );
                const saleId = saleRes.insertId;

                // Insert Items
                const itemValues = items.map(item => [saleId, item.pid, item.qty, item.price, item.line_total]);
                await connection.query(
                    'INSERT INTO sales_items (sale_id, product_id, quantity, unit_price, line_total) VALUES ?',
                    [itemValues]
                );
            }
            console.log(`Generated ${SALES_TO_GENERATE} new sales.`);
        } else {
            console.log('Skipping sales generation (enough data exists).');
        }

        await connection.commit();
        console.log('--- Seeding Completed Successfully ---');
        process.exit(0);

    } catch (error) {
        await connection.rollback();
        console.error('Seeding failed:', error);
        process.exit(1);
    } finally {
        connection.release();
    }
}

seed();
