// src/services/webhook.ts

// Load the webhook URL from environment variables (must start with REACT_APP_ for Create React App)
const WEBHOOK_URL = process.env.REACT_APP_N8N_WEBHOOK_URL;

if (!WEBHOOK_URL) {
    console.warn('Environment variable REACT_APP_N8N_WEBHOOK_URL is not defined.');
}

/**
 * Sends a scanned QR URL to the configured n8n webhook and returns the response payload.
 * @param qrUrl - The URL extracted from the QR code
 * @returns The JSON response from n8n, or null if non-JSON or on error.
 */
export async function sendQrToWebhook(qrUrl: string): Promise<any> {
    if (!WEBHOOK_URL) {
        throw new Error('Missing n8n webhook URL');
    }

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ qrUrl }),
        });

        if (!response.ok) {
            throw new Error(`Webhook responded with status ${response.status}`);
        }

        // Attempt to parse and return JSON payload
        const contentType = response.headers.get('Content-Type') || '';
        if (contentType.includes('application/json')) {
            const data = await response.json();
            console.log(data);
            return data;
        } else {
            // Return text if not JSON
            const text = await response.text();
            return text;
        }
    } catch (error) {
        console.error('Failed to send QR to webhook:', error);
        throw error;
    }
}
