'use client';
import { createContext, Dispatch, SetStateAction, useContext, useState } from 'react';

interface ImageContextProps {
    img: HTMLImageElement | null;
    setImg: Dispatch<SetStateAction<HTMLImageElement | null>>;
}

const ImageContext = createContext<ImageContextProps | null>(null);

export function ImageProvider({ children }: { children: React.ReactNode }) {
    const [img, setImg] = useState<HTMLImageElement | null>(null);
    return (
        <ImageContext.Provider value={{ img, setImg }}>{children}</ImageContext.Provider>
    );
}

export function useImageContext() {
    const ctx = useContext(ImageContext);
    if (!ctx) throw new Error('useImageContext must be used within ImageProvider');
    return ctx;
}
