import React, { useState } from 'react';
import Camera from './components/Camera';
import DigitalInvoice, { InvoiceItem } from './components/DigitalInvoice';
import Analytics from './components/Analytics';

const App: React.FC = () => {
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);

  return (
    <div style={{
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      padding: '0',
      margin: '0',
      fontFamily: 'Lucida Grande, Tahoma, Verdana, Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#3b5998',
        color: 'white',
        padding: '20px 0',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        marginBottom: '20px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px'
        }}>
          <h1 style={{
            margin: '0',
            fontSize: '28px',
            fontWeight: 'bold',
            letterSpacing: '-1px'
          }}>Receipt Scanner</h1>
          <p style={{
            margin: '5px 0 0 0',
            fontSize: '14px',
            opacity: '0.9'
          }}>Scan and manage your receipts</p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        {/* Camera Section */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e5e5',
          borderRadius: '8px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <div style={{
            padding: '20px',
            borderBottom: '1px solid #e5e5e5'
          }}>
            <h2 style={{
              margin: '0',
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#1d2129'
            }}>QR Code Scanner</h2>
            <p style={{
              margin: '5px 0 0 0',
              fontSize: '14px',
              color: '#8a8d91'
            }}>Scan QR codes from receipts or upload images</p>
          </div>
          <div style={{ padding: '20px' }}>
            <Camera onQrResponse={data => {
              // assume webhook returns an object like { items: InvoiceItem[] }
              setInvoiceItems(data || []);
              // console.log(data);
            }} />
          </div>
        </div>

        {/* Invoice Section */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e5e5',
          borderRadius: '8px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <div style={{
            padding: '20px',
            borderBottom: '1px solid #e5e5e5'
          }}>
            <h2 style={{
              margin: '0',
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#1d2129'
            }}>Invoice Details</h2>
            <p style={{
              margin: '5px 0 0 0',
              fontSize: '14px',
              color: '#8a8d91'
            }}>Review and edit your receipt items</p>
          </div>
          <div style={{ padding: '20px' }}>
            <DigitalInvoice items={invoiceItems} />
          </div>
        </div>

        {/* Analytics Section */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e5e5',
          borderRadius: '8px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <div style={{
            padding: '20px',
            borderBottom: '1px solid #e5e5e5'
          }}>
            <h2 style={{
              margin: '0',
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#1d2129'
            }}>Analytics</h2>
            <p style={{
              margin: '5px 0 0 0',
              fontSize: '14px',
              color: '#8a8d9 1'
            }}>Ask questions about your spending</p>
          </div>
          <div style={{ padding: '20px' }}>
            <Analytics />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;