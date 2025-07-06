// server/src/db.ts
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();
console.log('Loaded env:', {
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD ? '••••••' : null,
    DB_DATABASE: process.env.DB_DATABASE,
});

export const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});

const tableDefinitions = [`
    CREATE TABLE IF NOT EXISTS invoice_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    unit VARCHAR(255) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    quantity FLOAT(24) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL
);`];

export async function initDb() {
    const conn = await pool.getConnection();
    try {
        for (const sql of tableDefinitions) {
            await conn.query(sql);
        }
        console.log('✅ Tables are ready');
    } finally {
        conn.release();
    }
}
