'use client';
import { useImageContext } from '@/context/imageContext';
import { cn } from '@/utils';
import { useEffect, useRef } from 'react';
import { MdPhoto, MdUpload, MdZoomIn, MdZoomOut } from 'react-icons/md';

interface CanvasEditorProps {
    twibbonSrc: string;
    linkName: string;
    width: number;
    height: number;
    className?: string;
}

export default function CanvasEditor({
    twibbonSrc,
    linkName,
    width,
    height,
    className,
}: CanvasEditorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { img, setImg } = useImageContext();
    const imgRef = useRef({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        scale: 1,
    });
    const dragging = useRef(false);
    const offset = useRef({ x: 0, y: 0 });
    const twibbonRef = useRef<HTMLImageElement | null>(null);
    const rectRef = useRef<DOMRect | null>(null);

    const drawToCanvas = (canvas: HTMLCanvasElement, scale = 1) => {
        const ctx = canvas.getContext('2d')!;
        ctx.setTransform(scale, 0, 0, scale, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (img) {
            const { x, y, width, height, scale: imgScale } = imgRef.current;
            ctx.drawImage(img, x, y, width * imgScale, height * imgScale);
        }

        if (twibbonRef.current) {
            ctx.drawImage(
                twibbonRef.current!,
                0,
                0,
                canvas.width / scale,
                canvas.height / scale,
            );
        }
    };

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        drawToCanvas(canvas, 1);
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const image = new Image();
        image.src = URL.createObjectURL(file);

        image.onload = () => {
            const canvas = canvasRef.current!;
            const scale = canvas.width / image.naturalWidth;

            imgRef.current = {
                x: 0,
                y: (canvas.height - image.naturalHeight * scale) / 2,
                scale,
                width: image.naturalWidth,
                height: image.naturalHeight,
            };

            setImg(image);
            draw();
            URL.revokeObjectURL(image.src);
        };
    };

    useEffect(() => {
        const t = new Image();
        t.src = twibbonSrc;
        t.onload = () => {
            twibbonRef.current = t;
            draw();
        };
    }, [twibbonSrc]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!img || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const scale = canvas.width / img.naturalWidth;

        imgRef.current = {
            x: 0,
            y: (canvas.height - img.naturalHeight * scale) / 2,
            scale,
            width: img.naturalWidth,
            height: img.naturalHeight,
        };

        draw();
    }, [img, twibbonSrc]); // eslint-disable-line react-hooks/exhaustive-deps

    const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const canvas = canvasRef.current;
        if (!canvas || !img) return;

        rectRef.current = canvas.getBoundingClientRect();

        const mx = e.clientX - rectRef.current.left;
        const my = e.clientY - rectRef.current.top;

        const { x, y, width, scale, height } = imgRef.current;

        const w = width * scale;
        const h = height * scale;

        if (mx >= x && mx <= x + w && my >= y && my <= y + h) {
            dragging.current = true;
            offset.current.x = mx - x;
            offset.current.y = my - y;
            e.currentTarget.setPointerCapture(e.pointerId);
        }
    };

    const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!dragging.current || !rectRef.current) return;

        imgRef.current.x = e.clientX - rectRef.current.left - offset.current.x;
        imgRef.current.y = e.clientY - rectRef.current.top - offset.current.y;
        clampPosition();
        requestDraw();
    };
    const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
        }
        dragging.current = false;
    };
    const rafRef = useRef<number | null>(null);
    const requestDraw = () => {
        if (rafRef.current) return;
        rafRef.current = requestAnimationFrame(() => {
            draw();
            rafRef.current = null;
        });
    };

    const clampPosition = () => {
        const canvas = canvasRef.current!;
        const d = imgRef.current;
        const w = d.width * d.scale;
        const h = d.height * d.scale;

        d.x = Math.min(0, Math.max(canvas.width - w, d.x));
        d.y = Math.min(0, Math.max(canvas.height - h, d.y));
    };

    const zoomAtCenter = (factor: number) => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;

        const d = imgRef.current;

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        const prevScale = d.scale;
        d.scale = Math.min(Math.max(d.scale * factor, 0.3), 5);

        d.x = cx - ((cx - d.x) * d.scale) / prevScale;
        d.y = cy - ((cy - d.y) * d.scale) / prevScale;

        clampPosition();
        requestDraw();
    };

    const zoomIn = () => zoomAtCenter(1.2);

    const zoomOut = () => zoomAtCenter(0.8);

    const exportPNG = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const scale = 1;

        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = canvas.width * scale;
        exportCanvas.height = canvas.height * scale;

        drawToCanvas(exportCanvas, scale);

        const link = document.createElement('a');
        link.download = `${linkName}.png`;
        link.href = exportCanvas.toDataURL('image/png');
        link.click();
    };

    return (
        <div className='m-4 flex flex-col justify-center items-center gap-4'>
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className={cn(
                    'w-[300px] rounded-xl h-auto border-neutral-600 touch-none hover:cursor-move',
                    className,
                )}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerUp}
                onPointerCancel={onPointerUp}
            />
            {img && (
                <div className='font-medium space-x-4'>
                    <button
                        className='hover:bg-neutral-600 transition-colors p-3 rounded-3xl bg-neutral-700 text-orange-200'
                        onClick={zoomIn}>
                        <MdZoomIn size={24} />
                    </button>
                    <button
                        className='hover:bg-neutral-600 transition-colors p-3 rounded-3xl bg-neutral-700 text-orange-200'
                        onClick={zoomOut}>
                        <MdZoomOut size={24} />
                    </button>
                </div>
            )}

            <div className='font-medium flex flex-col items-center gap-2'>
                <input
                    type='file'
                    onChange={onInputChange}
                    accept='image/*'
                    id='file'
                    hidden
                />
                <label
                    htmlFor='file'
                    className=' hover:bg-neutral-600 transition-colors p-3 px-5 rounded-3xl bg-neutral-700 text-orange-200 flex items-center gap-2 cursor-pointer'>
                    Upload Image <MdUpload size={24} />
                </label>
                {img && (
                    <button
                        onClick={exportPNG}
                        className='hover:bg-orange-200 transition-colors p-3 px-5 rounded-3xl bg-orange-300 text-orange-700 flex items-center gap-2'>
                        Export Twibbon <MdPhoto size={24} />
                    </button>
                )}
            </div>
        </div>
    );
}
