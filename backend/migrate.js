const db = require('./src/config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        const sqlPath = path.join(__dirname, 'rbac_migration.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        const statements = sql.split(';').filter(s => s.trim().length > 0);

        const connection = await db.getConnection();
        
        console.log('Starting migration...');
        
        for (const statement of statements) {
            try {
                await connection.query(statement);
                console.log('Executed:', statement.substring(0, 50) + '...');
            } catch (err) {
                if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_TABLE_EXISTS_ERROR') {
                    console.log('Skipping existing Field/Table');
                } else {
                    console.error('Error executing statement:', err.message);
                }
            }
        }
        
        console.log('Migration completed.');
        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
