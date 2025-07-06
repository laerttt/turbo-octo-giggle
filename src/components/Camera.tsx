// src/components/Camera.tsx
import React, { useRef, useState, useEffect } from 'react';
import jsQR from 'jsqr';
import UploadButton from './UploadButton';
import { sendQrToWebhook } from '../services/webhook';

// helper to scan a single canvas
const tryScan = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return jsQR(imageData.data, canvas.width, canvas.height);
};

// helper to rotate a canvas by given degrees
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

// Validate a string as a URL
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

    // Reattach stream when snapshot is cleared
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

    // central scan logic with rotation attempts
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

        // send to webhook and notify parent
        if (codeData && isValidUrl(codeData)) {
            setLoading(true);
            sendQrToWebhook(codeData)
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

    // inline SVG spinner
    const spinner = (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
            <svg width="40" height="40" viewBox="0 0 50 50">
                <circle
                    cx="25"
                    cy="25"
                    r="20"
                    stroke="#0066cc"
                    strokeWidth="5"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="31.415,31.415"
                >
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 25 25"
                        to="360 25 25"
                        dur="1s"
                        repeatCount="indefinite"
                    />
                </circle>
            </svg>
        </div>
    );

    return (
        <div style={{ textAlign: 'center' }}>
            {!stream ? (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '1rem' }}>
                    <button onClick={openCamera}>Open Camera</button>
                    <UploadButton onUpload={(c, url) => scanAndSet(c, url)} />
                </div>
            ) : (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '1rem' }}>
                    <button onClick={closeCamera}>Close Camera</button>
                    {!snapshot ? (
                        <button onClick={takeSnapshot}>Snapshot</button>
                    ) : (
                        <button onClick={() => { setSnapshot(null); setQrResult(null); }}>Retake</button>
                    )}
                </div>
            )}

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div style={{ marginTop: '1rem' }}>
                {snapshot ? (
                    <>
                        <img
                            src={snapshot}
                            alt="Snapshot"
                            style={{ width: 400, height: 300, borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}
                        />

                        {loading
                            ? spinner
                            : qrResult && (
                                <p style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>
                                    QR Code:{' '}
                                    {isValidUrl(qrResult) ? (
                                        <a
                                            href={qrResult}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: '#0066cc', textDecoration: 'underline' }}
                                        >
                                            {qrResult}
                                        </a>
                                    ) : (
                                        qrResult
                                    )}
                                </p>
                            )}
                    </>
                ) : stream ? (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        style={{ width: 400, height: 300, borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}
                    />
                ) : null}
            </div>
        </div>
    );
};

export default Camera;
