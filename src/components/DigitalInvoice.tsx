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

type DigitalInvoiceProps = {
    items: any[];
};

const DigitalInvoice: React.FC<DigitalInvoiceProps> = ({ items }) => {
    const header: any = items[0] || {};
    const dataItems = items.slice(1) as InvoiceItem[];

    type WithOriginal = InvoiceItem & { originalCategory: string };
    const [invoiceItems, setInvoiceItems] = useState<WithOriginal[]>([]);

    // NEW: state for tracking save progress
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        const list = dataItems.map(i => ({
            ...i,
            originalCategory: i.category
        }));
        setInvoiceItems(list);
    }, [items]);

    const formatDate = (raw: string) => {
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

    const handleCategoryChange = (id: number, newCat: string) => {
        setInvoiceItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, category: newCat } : item
            )
        );
    };

    const saveInvoice = async () => {
        // avoid re-saving
        if (isSaving || isSaved) return;
        setIsSaving(true);

        try {
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
                    unit_price: item.unitPriceAfterVat,
                    quantity: item.quantity,
                    price: item.priceAfterVat,
                    date: isoDate
                        ? isoDate.split('T')[0]
                        : new Date().toISOString().split('T')[0]
                }))
            };

            const res = await fetch('api/invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error(await res.text());

            alert('Invoice saved successfully!');
            setIsSaved(true);
        } catch (err: any) {
            console.error(err);
            alert('Failed to save invoice: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (invoiceItems.length === 0) {
        return (
            <div
                style={{
                    color: '#666',
                    fontSize: '11px',
                    textAlign: 'center',
                    padding: '20px 0'
                }}
            >
                No invoice items to display
            </div>
        );
    }

    return (
        <div>
            {invoiceDateDisplay && (
                <div
                    style={{
                        fontWeight: 'bold',
                        marginBottom: '8px',
                        fontSize: '11px',
                        color: '#333'
                    }}
                >
                    Invoice Date: {invoiceDateDisplay}
                </div>
            )}

            <div
                style={{
                    border: '1px solid #d8dfea',
                    backgroundColor: '#fff',
                    borderRadius: '2px',
                    overflow: 'hidden'
                }}
            >
                <table
                    style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '11px'
                    }}
                >
                    <thead>
                        <tr
                            style={{
                                backgroundColor: '#f7f7f7',
                                borderBottom: '1px solid #d8dfea'
                            }}
                        >
                            {['Name', 'Unit', 'Unit Price', 'Quantity', 'Price', 'Category'].map(
                                col => (
                                    <th
                                        key={col}
                                        style={{
                                            padding: '6px 8px',
                                            textAlign: 'left',
                                            fontWeight: 'bold',
                                            color: '#333',
                                            borderRight: '1px solid #d8dfea'
                                        }}
                                    >
                                        {col}
                                    </th>
                                )
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {invoiceItems.map((item, index) => (
                            <tr
                                key={item.id}
                                style={{
                                    backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9',
                                    borderBottom: '1px solid #d8dfea'
                                }}
                            >
                                <td
                                    style={{
                                        padding: '6px 8px',
                                        borderRight: '1px solid #d8dfea'
                                    }}
                                >
                                    {item.name}
                                </td>
                                <td
                                    style={{
                                        padding: '6px 8px',
                                        borderRight: '1px solid #d8dfea'
                                    }}
                                >
                                    {item.unit}
                                </td>
                                <td
                                    style={{
                                        padding: '6px 8px',
                                        textAlign: 'right',
                                        borderRight: '1px solid #d8dfea'
                                    }}
                                >
                                    {item.unitPriceAfterVat.toFixed(2)}
                                </td>
                                <td
                                    style={{
                                        padding: '6px 8px',
                                        textAlign: 'right',
                                        borderRight: '1px solid #d8dfea'
                                    }}
                                >
                                    {item.quantity}
                                </td>
                                <td
                                    style={{
                                        padding: '6px 8px',
                                        textAlign: 'right',
                                        borderRight: '1px solid #d8dfea'
                                    }}
                                >
                                    {item.priceAfterVat.toFixed(2)}
                                </td>
                                <td style={{ padding: '6px 8px' }}>
                                    <input
                                        type="text"
                                        value={item.category}
                                        onChange={e =>
                                            handleCategoryChange(item.id, e.target.value)
                                        }
                                        style={{
                                            width: '95%',
                                            border: '1px solid #bdc7d8',
                                            padding: '2px 4px',
                                            fontSize: '11px',
                                            borderRadius: '2px'
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
                disabled={isSaved || isSaving}
                style={{
                    marginTop: '8px',
                    backgroundColor: isSaved ? '#ccc' : '#5b7bd5',
                    color: 'white',
                    border: isSaved ? '1px solid #999' : '1px solid #4a6bb3',
                    padding: '4px 12px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: isSaved ? 'not-allowed' : 'pointer',
                    borderRadius: '2px',
                    fontFamily:
                        'Lucida Grande, Tahoma, Verdana, Arial, sans-serif',
                    opacity: isSaving ? 0.7 : 1
                }}
            >
                {isSaved ? 'Saved' : isSaving ? 'Saving…' : 'Save to Database'}
            </button>
        </div>
    );
};

export default DigitalInvoice;
