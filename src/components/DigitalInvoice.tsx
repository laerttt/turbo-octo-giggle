// src/components/DigitalInvoice.tsx
import React, { useState, useEffect } from 'react';

export interface InvoiceItem {
    id: number;
    name: string;
    code: string;
    unit: string;
    quantity: number;
    category: string;
    unitPriceAfterVat: number;
    priceAfterVat: number;
}

// We now expect items[0] to be your "header" with a `crtd` string,
// and the rest to match InvoiceItem
type DigitalInvoiceProps = {
    items: any[];
};

const DigitalInvoice: React.FC<DigitalInvoiceProps> = ({ items }) => {
    // 1. Extract header (first element) and real items
    const header = items[0] || {};
    const dataItems = items.slice(1) as InvoiceItem[];

    // 2. Enhance each item with its original AI category for feedback
    type WithOriginal = InvoiceItem & { originalCategory: string };
    const [invoiceItems, setInvoiceItems] = useState<WithOriginal[]>([]);

    useEffect(() => {
        const list = dataItems.map(i => ({
            ...i,
            originalCategory: i.category
        }));
        setInvoiceItems(list);
    }, [items]);

    // 3. Parse the header.crtd into a nice date string
    const formatDate = (raw: string) => {
        // fix the space before timezone to a plus
        const fixed = raw.replace(' ', '+');
        const d = new Date(fixed);
        if (isNaN(d.getTime())) return raw;
        return d.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };
    const invoiceDateDisplay = header.crtd ? formatDate(header.crtd) : '';

    // 4. Handle category edits
    const handleCategoryChange = (id: number, newCat: string) => {
        setInvoiceItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, category: newCat } : item
            )
        );
    };

    // 5. Save both date and items back to your API
    const saveInvoice = async () => {
        try {
            // convert to ISO for storage
            const isoDate = header.crtd
                ? new Date(header.crtd.replace(' ', '+')).toISOString()
                : null;

            const payload = {
                date: isoDate,
                items: invoiceItems.map(({ originalCategory, ...item }) => ({
                    id: item.id,
                    name: item.name,
                    category: item.category,
                    unit: item.unit,
                    unit_price: item.unitPriceAfterVat,  // Map unitPriceAfterVat to unit_price
                    quantity: item.quantity,
                    price: item.priceAfterVat,           // Map priceAfterVat to price
                    date: isoDate ? isoDate.split('T')[0] : new Date().toISOString().split('T')[0] // Convert to YYYY-MM-DD format
                }))
            };

            const res = await fetch('api/invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error(await res.text());
            alert('Invoice saved successfully!');
        } catch (err: any) {
            console.error(err);
            alert('Failed to save invoice: ' + err.message);
        }
    };

    return (
        <div>
            {invoiceDateDisplay && (
                <p style={{ fontWeight: 'bold', marginBottom: '1rem' }}>
                    Invoice Date: {invoiceDateDisplay}
                </p>
            )}

            <div style={{ overflowX: 'auto' }}>
                <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f3f3f3' }}>
                            {['Name', 'Unit', 'Unit Price', 'Quantity', 'Price', 'Category'].map(col => (
                                <th
                                    key={col}
                                    style={{
                                        padding: '8px 12px',
                                        border: '1px solid #ddd',
                                        textAlign: 'center',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {invoiceItems.map(item => (
                            <tr key={item.id}>
                                <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                                    {item.name}
                                </td>
                                <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                                    {item.unit}
                                </td>
                                <td style={{
                                    padding: '8px',
                                    border: '1px solid #ddd',
                                    textAlign: 'right'
                                }}
                                >
                                    {item.unitPriceAfterVat.toFixed(2)}
                                </td>
                                <td
                                    style={{
                                        padding: '8px',
                                        border: '1px solid #ddd',
                                        textAlign: 'right'
                                    }}
                                >
                                    {item.quantity}
                                </td>
                                <td
                                    style={{
                                        padding: '8px',
                                        border: '1px solid #ddd',
                                        textAlign: 'right'
                                    }}
                                >
                                    {item.priceAfterVat.toFixed(2)}
                                </td>
                                <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                                    <input
                                        type="text"
                                        value={item.category}
                                        onChange={e =>
                                            handleCategoryChange(item.id, e.target.value)
                                        }
                                        style={{
                                            width: '90%',
                                            padding: '6px',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px'
                                        }}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <button
                onClick={saveInvoice}
                style={{
                    marginTop: '1rem',
                    padding: '10px 20px',
                    backgroundColor: '#0066cc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                Save to Database
            </button>
        </div>
    );
};

export default DigitalInvoice;