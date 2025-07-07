import { Router } from 'express';
import { pool } from '../db';
import type { ResultSetHeader } from 'mysql2';

export interface InvoiceItemPayload {
    id: number;
    name: string;
    category: string;
    unit: string;
    unit_price: number;
    quantity: number;
    price: number;
    date: string;
}

const router = Router();

// POST /api/invoice
router.post('/', async (req, res, next) => {
    const { date, items } = req.body as {
        date: string | null;
        items: InvoiceItemPayload[];
    };
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // Get the next invoice_id
        const [result] = await conn.execute<any[]>(
            'SELECT COALESCE(MAX(invoice_id), 0) + 1 as next_invoice_id FROM invoice_items'
        );
        const invoiceId = result[0].next_invoice_id;

        // Bulk insert all items
        if (items.length) {
            const values = items.map(i => {
                return [
                    invoiceId,
                    i.name,
                    i.category,
                    i.unit,
                    i.unit_price,
                    i.quantity,
                    i.price,
                    i.date,
                ]
            });
            await conn.query(
                `INSERT INTO invoice_items 
                (invoice_id, name, category, unit, unit_price, quantity, price, date)
                VALUES ?`,
                [values]
            );
        }

        await conn.commit();
        res.status(201).json({ invoiceId });
    } catch (err) {
        await conn.rollback();
        next(err);
    } finally {
        conn.release();
    }
});

export default router;