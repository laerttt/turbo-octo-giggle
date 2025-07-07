// src/routes/analytics.ts
import { Router } from 'express';
import axios from 'axios';
import { pool } from '../db';
import { RowDataPacket } from 'mysql2';

// MySQL row type
type DBInvoiceItem = RowDataPacket & {
    id: number;
    name: string;
    category: string;
    unit: string;
    unit_price: number;
    quantity: number;
    price: number;
    date: Date;
};

// Response shape for front-end
interface AnalyticsResponse {
    answer: string;
}

// Request body shape
interface AnalyticsRequest {
    question: string;
}

// n8n webhook returns an array of items with `output`
interface N8nItem {
    output: string;
}

const router = Router();

router.post('/', async (req, res, next) => {
    try {
        const { question } = req.body as AnalyticsRequest;
        console.log('🔍 Received question:', question);

        if (!question?.trim()) {
            return res.status(400).json({ answer: 'Question is required.' });
        }

        // Fetch all invoice_items
        const [rows] = await pool.query<DBInvoiceItem[]>(
            `SELECT id, name, category, unit, unit_price, quantity, price, date FROM invoice_items`
        );

        console.log('📊 Fetched rows from database:', rows.length);

        // Map to plain payload, formatting dates
        const items = rows.map(r => ({
            id: r.id,
            name: r.name,
            category: r.category,
            unit: r.unit,
            unit_price: r.unit_price,
            quantity: r.quantity,
            price: r.price,
            date: r.date.toISOString().split('T')[0],
        }));

        console.log('📦 Mapped items:', items.length);
        console.log('📦 Sample item:', items[0]);

        // Forward to n8n webhook
        const webhookUrl = process.env.N8N_ANALYTICS_WEBHOOK_URL!;
        console.log('📡 Calling n8n webhook:', webhookUrl);

        const payload = { question, items };
        console.log('📤 Sending payload:', { question, itemsCount: items.length });

        const response = await axios.post<N8nItem[]>(
            webhookUrl,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );

        console.log('📦 N8n response status:', response.status);
        console.log('📦 N8n response data:', response.data);

        const data = response.data;
        const answer = Array.isArray(data) && data.length > 0 && data[0].output
            ? data[0].output
            : 'No answer received from analytics service.';

        console.log('✅ Extracted answer:', answer);
        console.log('✅ Answer type:', typeof answer);
        console.log('✅ Answer length:', answer?.length);

        const result: AnalyticsResponse = { answer };
        console.log('📤 Sending result:', result);

        res.json(result);
    } catch (err) {
        console.error('❌ Analytics → N8N error:', err);

        // Send a proper error response
        if (err instanceof Error) {
            res.status(500).json({ answer: `Error: ${err.message}` });
        } else {
            res.status(500).json({ answer: 'An unexpected error occurred.' });
        }
    }
});

export default router;