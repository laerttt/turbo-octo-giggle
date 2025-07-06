import React, { useState } from 'react';
import Camera from './components/Camera';
import DigitalInvoice, { InvoiceItem } from './components/DigitalInvoice';

const App: React.FC = () => {
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);

  return (
    <div style={{ padding: '1rem', maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1rem' }}>Camera Demo</h1>
      <Camera onQrResponse={data => {
        // assume webhook returns an object like { items: InvoiceItem[] }
        setInvoiceItems(data || []);
        // console.log(data);

      }} />

      <h1 style={{ margin: '2rem 0 1rem' }}>Digital Invoice</h1>
      <DigitalInvoice items={invoiceItems} />
    </div>
  );
};

export default App;