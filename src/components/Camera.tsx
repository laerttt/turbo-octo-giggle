import React, { useRef, useState, useEffect } from 'react';
import jsQR from 'jsqr';
import UploadButton from './UploadButton';
import { sendReceiptWebhook } from '../services/webhook';

const tryScan = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return jsQR(imageData.data, canvas.width, canvas.height);
};

const rotateCanvas = (src: HTMLCanvasElement, degrees: number) => {
    const rad = (degrees * Math.PI) / 180;
    const rotated = document.createElement('canvas');
    if (degrees % 180 === 0) {
        rotated.width = src.width;
        rotated.height = src.height;
    } else {
        rotated.width = src.height;
        rotated.height = src.width;
    }
    const ctx = rotated.getContext('2d')!;
    ctx.translate(rotated.width / 2, rotated.height / 2);
    ctx.rotate(rad);
    ctx.drawImage(src, -src.width / 2, -src.height / 2);
    return rotated;
};

const isValidUrl = (text: string) => {
    try {
        new URL(text);
        return true;
    } catch {
        return false;
    }
};

type CameraProps = {
    onQrResponse?: (data: any) => void;
};

const Camera: React.FC<CameraProps> = ({ onQrResponse }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [snapshot, setSnapshot] = useState<string | null>(null);
    const [qrResult, setQrResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!snapshot && stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [snapshot, stream]);

    const openCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(mediaStream);
            setSnapshot(null);
            setQrResult(null);
        } catch (err: any) {
            setError(err.message || 'Error accessing camera');
        }
    };

    const closeCamera = () => {
        if (stream) {
            stream.getTracks().forEach(t => t.stop());
            setStream(null);
        }
        setSnapshot(null);
        setQrResult(null);
        setError(null);
    };

    const scanAndSet = (canvas: HTMLCanvasElement, dataUrl?: string) => {
        let code = tryScan(canvas);
        const codeData = code ? code.data : null;

        if (!code) {
            for (const deg of [90, 180, 270]) {
                const rotated = rotateCanvas(canvas, deg);
                code = tryScan(rotated);
                if (code) break;
            }
        }

        setQrResult(code ? code.data : 'No QR code detected');
        setSnapshot(dataUrl || canvas.toDataURL('image/png'));

        if (codeData && isValidUrl(codeData)) {
            setLoading(true);
            sendReceiptWebhook(codeData)
                .then(response => {
                    onQrResponse?.(response);
                })
                .catch(err => {
                    console.error('Webhook error', err);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    };

    const takeSnapshot = () => {
        if (!videoRef.current) return;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(videoRef.current, 0, 0);
        scanAndSet(canvas);
    };

    const buttonStyle = {
        backgroundColor: '#5b7bd5',
        color: 'white',
        border: '1px solid #4a6bb3',
        padding: '3px 8px',
        fontSize: '11px',
        fontWeight: 'bold',
        cursor: 'pointer',
        borderRadius: '2px',
        fontFamily: 'Lucida Grande, Tahoma, Verdana, Arial, sans-serif',
        marginRight: '8px'
    };

    const spinner = (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '8px 0',
            fontSize: '11px',
            color: '#666'
        }}>
            <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #d8dfea',
                borderTop: '2px solid #5b7bd5',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginRight: '8px'
            }}></div>
            Processing...
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );

    return (
        <div>
            <div style={{ marginBottom: '8px' }}>
                {!stream ? (
                    <div>
                        <button style={buttonStyle} onClick={openCamera}>Open Camera</button>
                        <UploadButton onUpload={(c, url) => scanAndSet(c, url)} />
                    </div>
                ) : (
                    <div>
                        <button style={buttonStyle} onClick={closeCamera}>Close Camera</button>
                        {!snapshot ? (
                            <button style={buttonStyle} onClick={takeSnapshot}>Take Picture</button>
                        ) : (
                            <button style={buttonStyle} onClick={() => { setSnapshot(null); setQrResult(null); }}>Retake</button>
                        )}
                    </div>
                )}
            </div>

            {error && (
                <div style={{
                    color: '#8b0000',
                    fontSize: '11px',
                    backgroundColor: '#ffefef',
                    padding: '4px',
                    border: '1px solid #ff9999',
                    borderRadius: '2px',
                    marginBottom: '8px'
                }}>
                    {error}
                </div>
            )}

            <div style={{ textAlign: 'center' }}>
                {snapshot ? (
                    <div>
                        <img
                            src={snapshot}
                            alt="Snapshot"
                            style={{
                                maxWidth: '100%',
                                height: 'auto',
                                border: '1px solid #d8dfea',
                                borderRadius: '4px'
                            }}
                        />
                        {loading ? (
                            spinner
                        ) : (
                            qrResult && (
                                <div style={{
                                    marginTop: '8px',
                                    padding: '4px',
                                    backgroundColor: '#f7f7f7',
                                    border: '1px solid #d8dfea',
                                    borderRadius: '2px',
                                    fontSize: '11px'
                                }}>
                                    <strong>QR Code:</strong>{' '}
                                    {isValidUrl(qrResult) ? (
                                        <a
                                            href={qrResult}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                color: '#3b5998',
                                                textDecoration: 'none',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {qrResult}
                                        </a>
                                    ) : (
                                        qrResult
                                    )}
                                </div>
                            )
                        )}
                    </div>
                ) : stream ? (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        style={{
                            maxWidth: '100%',
                            height: 'auto',
                            border: '1px solid #d8dfea',
                            borderRadius: '4px'
                        }}
                    />
                ) : null}
            </div>
        </div>
    );
};

export default Camera;
