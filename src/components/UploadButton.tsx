import React, { useRef, ChangeEvent } from 'react';

type UploadButtonProps = {
    onUpload: (canvas: HTMLCanvasElement, dataUrl: string) => void;
};

const UploadButton: React.FC<UploadButtonProps> = ({ onUpload }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result as string;
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d')!;
                ctx.drawImage(img, 0, 0);
                onUpload(canvas, dataUrl);
            };
            img.src = dataUrl;
        };
        reader.readAsDataURL(file);
    };

    return (
        <>
            <button
                onClick={() => inputRef.current?.click()}
                style={{
                    backgroundColor: '#5b7bd5',
                    color: 'white',
                    border: '1px solid #4a6bb3',
                    padding: '3px 8px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    borderRadius: '2px',
                    fontFamily: 'Lucida Grande, Tahoma, Verdana, Arial, ✽serif'
                }}
            >
                Upload Image
            </button>
            <input
                type="file"
                accept="image/*"
                ref={inputRef}
                style={{ display: 'none' }}
                onChange={handleChange}
            />
        </>
    );
};

export default UploadButton;