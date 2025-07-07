// src/services/webhook.ts

import axios from 'axios'
import { getInvoiceItems } from './invoiceService'  // assumes you already have an API client for invoice_items

export interface InvoiceItem {
    name: string
    category: string
    date: string        // or `Date`, depending on your API
}

/**
 * Send a payload to the n8n webhook that includes both
 * the scanned QR URL and every invoice item (name, category, date).
 */
export async function sendReceiptWebhook(qrUrl: string) {
    try {
        // 1. Fetch all invoice items from your MySQL-backed API
        const items: InvoiceItem[] = await getInvoiceItems()

        // 2. Build the payload
        const payload = {
            qrUrl,
            items: items.map(({ name, category, date }) => ({ name, category, date })),
        }

        // 3. POST to the n8n webhook
        const webhookUrl = process.env.REACT_APP_N8N_WEBHOOK_URL!
        const response = await axios.post(webhookUrl, payload)

        console.log('✅ Webhook delivered:', response.data)
        return response.data
    } catch (err) {
        console.error('❌ Failed to send webhook:', err)
        throw err
    }
}
