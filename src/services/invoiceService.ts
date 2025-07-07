// src/services/invoiceService.ts

import axios from 'axios'
import type { InvoiceItem } from './webhook'

/**
 * Retrieves every invoice_item (name, category, date) 
 * from your back-end MySQL instance.
 */
export async function getInvoiceItems(): Promise<InvoiceItem[]> {
    const { data } = await axios.get<InvoiceItem[]>('/api/invoice')
    return data
}
