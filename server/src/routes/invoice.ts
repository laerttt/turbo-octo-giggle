import { Router } from 'express';
import { pool } from '../db';

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
            await conn.query(`
                INSERT INTO 
                    invoice_items 
                        (invoice_id, name, category, unit, unit_price, quantity, price, date)
                VALUES 
                    ?
                `,
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
/**
 * GET /api/invoice
 * → Returns all invoice_items with the shape of InvoiceItemPayload
 */
router.get('/', async (req, res, next) => {
    try {
        // Pull every column you defined in InvoiceItemPayload
        const [rows] = await pool.query<any[]>(`
            SELECT 
                id, name, category, unit, unit_price, quantity, price, date
            FROM 
                invoice_items`
        );

        // Map and format date as ISO yyyy-MM-dd strings
        const items: InvoiceItemPayload[] = rows.map(r => ({
            id: r.id,
            name: r.name,
            category: r.category,
            unit: r.unit,
            unit_price: r.unit_price,
            quantity: r.quantity,
            price: r.price,
            date: (r.date instanceof Date)
                ? r.date.toISOString().split('T')[0]
                : r.date,
        }));

        res.json(items);
    } catch (err) {
        next(err);
    }
});
export default router;