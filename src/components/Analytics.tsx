import { useState } from 'react';

export default function Analytics() {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const formatMarkdown = (text: string) => {
        let formatted = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*([^*\n]+?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .replace(/^\s*[\*\-]\s+(.+)$/gm, '<li>$1</li>');

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
        <div>
            <h3 style={{
                fontSize: '14px',
                fontWeight: 'bold',
                margin: '0 0 8px 0',
                color: '#3b5998'
            }}>Analytics</h3>
            <div style={{
                fontSize: '11px',
                color: '#666',
                marginBottom: '12px'
            }}>
                Ask questions about your spending data
            </div>

            <div style={{
                marginBottom: '12px',
                display: 'flex',
                gap: '8px'
            }}>
                <input
                    type="text"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    placeholder="e.g., How much did I spend on groceries last month?"
                    style={{
                        flex: 1,
                        border: '1px solid #bdc7d8',
                        padding: '3px 5px',
                        fontSize: '11px',
                        fontFamily: 'Lucida Grande, Tahoma, Verdana, Arial, sans-serif',
                        borderRadius: '2px'
                    }}
                    onKeyPress={e => e.key === 'Enter' && handleAsk()}
                />
                <button
                    onClick={handleAsk}
                    disabled={loading || !question.trim()}
                    style={{
                        backgroundColor: loading || !question.trim() ? '#cccccc' : '#5b7bd5',
                        color: loading || !question.trim() ? '#666' : 'white',
                        border: '1px solid #4a6bb3',
                        padding: '3px 8px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        cursor: loading || !question.trim() ? 'not-allowed' : 'pointer',
                        borderRadius: '2px',
                        fontFamily: 'Lucida Grande, Tahoma, Verdana, Arial, sans-serif'
                    }}
                >
                    {loading ? 'Asking...' : 'Ask'}
                </button>
            </div>

            <div style={{
                border: '1px solid #d8dfea',
                backgroundColor: '#fff',
                padding: '8px',
                minHeight: '80px',
                borderRadius: '2px'
            }}>
                {loading ? (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '11px',
                        color: '#666'
                    }}>
                        <div style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid #d8dfea',
                            borderTop: '2px solid #5b7bd5',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }}></div>
                        <span>Analyzing your spending data...</span>
                        <style>{`
                            @keyframes spin {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }
                        `}</style>
                    </div>
                ) : error ? (
                    <div style={{
                        color: '#8b0000',
                        fontSize: '11px',
                        backgroundColor: '#ffefef',
                        padding: '4px',
                        border: '1px solid #ff9999',
                        borderRadius: '2px'
                    }}>
                        <strong>Error:</strong> {error}
                    </div>
                ) : answer ? (
                    <div style={{
                        color: '#333',
                        lineHeight: '1.4',
                        fontSize: '11px'
                    }}>
                        <div dangerouslySetInnerHTML={{ __html: formatMarkdown(answer) }} />
                        <style>{`
                            ul { margin: 4px 0; padding-left: 16px; }
                            li { margin: 2px 0; }
                            strong { color: #3b5998; font-weight: bold; }
                            em { font-style: italic; color: #666; }
                        `}</style>
                    </div>
                ) : (
                    <div style={{
                        color: '#999',
                        fontSize: '11px',
                        textAlign: 'center',
                        padding: '20px 0'
                    }}>
                        Your answer will appear here
                    </div>
                )}
            </div>
        </div>
    );
}
