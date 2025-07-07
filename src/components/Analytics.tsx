import { useState } from 'react';

export default function Analytics() {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Simple markdown formatter for basic formatting
    const formatMarkdown = (text: string) => {
        let formatted = text
            // Convert **bold** to <strong>
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Convert *italic* to <em> (but not if it's already part of **)
            .replace(/\*([^*\n]+?)\*/g, '<em>$1</em>')
            // Convert newlines to <br>
            .replace(/\n/g, '<br>')
            // Convert bullet points (starting with * or -) to HTML lists
            .replace(/^\s*[\*\-]\s+(.+)$/gm, '<li>$1</li>');

        // Wrap consecutive <li> items in <ul> (without using 's' flag)
        const liRegex = /(<li>.*?<\/li>)/g;
        const matches = formatted.match(liRegex);
        if (matches) {
            const listItems = matches.join('');
            formatted = formatted.replace(liRegex, '').replace(/(<br>){2,}/g, '<br>') + '<ul>' + listItems + '</ul>';
        }

        return formatted;
    };

    const handleAsk = async () => {
        if (!question.trim()) return;

        setLoading(true);
        setError('');
        setAnswer('');

        try {
            const response = await fetch('/api/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data && typeof data === 'object' && 'answer' in data) {
                setAnswer(data.answer || 'No answer returned.');
            } else {
                setAnswer('Unexpected response format.');
            }

        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError(err instanceof Error ? err.message : 'Error fetching answer.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', maxWidth: '700px', margin: '2rem auto' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '8px', color: '#111827' }}>Analytics</h1>
            <p style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '20px' }}>Ask questions about your spending data</p>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <input
                    type="text"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    placeholder="e.g., How much did I spend on groceries last month?"
                    style={{
                        flex: 1,
                        padding: '12px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '8px',
                        outline: 'none',
                        fontSize: '14px',
                        transition: 'border-color 0.2s'
                    }}
                    onKeyPress={e => e.key === 'Enter' && handleAsk()}
                    onFocus={e => e.target.style.borderColor = '#3B82F6'}
                    onBlur={e => e.target.style.borderColor = '#D1D5DB'}
                />
                <button
                    onClick={handleAsk}
                    disabled={loading || !question.trim()}
                    style={{
                        padding: '12px 20px',
                        backgroundColor: loading || !question.trim() ? '#9CA3AF' : '#3B82F6',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: loading || !question.trim() ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.2s',
                        fontSize: '14px',
                        fontWeight: '500',
                        minWidth: '80px'
                    }}
                >
                    {loading ? 'Asking...' : 'Ask'}
                </button>
            </div>

            <div style={{
                padding: '20px',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                minHeight: '120px',
                backgroundColor: '#F9FAFB',
                position: 'relative'
            }}>
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '20px',
                            height: '20px',
                            border: '2px solid #E5E7EB',
                            borderTop: '2px solid #3B82F6',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }}></div>
                        <span style={{ color: '#6B7280', fontSize: '14px' }}>Analyzing your spending data...</span>
                        <style>{`
                            @keyframes spin {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }
                        `}</style>
                    </div>
                ) : error ? (
                    <div style={{ color: '#EF4444', fontSize: '14px' }}>
                        <strong>Error:</strong> {error}
                    </div>
                ) : answer ? (
                    <div style={{
                        color: '#111827',
                        lineHeight: '1.6',
                        fontSize: '14px'
                    }}>
                        <div dangerouslySetInnerHTML={{ __html: formatMarkdown(answer) }} />
                        <style>{`
                            ul { margin: 8px 0; padding-left: 20px; }
                            li { margin: 4px 0; }
                            strong { color: #059669; font-weight: 600; }
                            em { font-style: italic; color: #6B7280; }
                        `}</style>
                    </div>
                ) : (
                    <div style={{
                        color: '#9CA3AF',
                        fontSize: '14px',
                        textAlign: 'center',
                        paddingTop: '20px'
                    }}>
                        💬 Your answer will appear here
                    </div>
                )}
            </div>
        </div>
    );
}