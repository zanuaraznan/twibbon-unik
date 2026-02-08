'use client';
import CanvasEditor from '@/components/CanvasEditor';
import Image from 'next/image';
import { useState } from 'react';

export default function Page() {
    const [ratio, setRatio] = useState<'4:5' | '9:16'>('4:5');

    return (
        <div className='flex flex-col items-center justify-center mt-4'>
            <a
                href='https://unik-kediri.ac.id'
                target='_blank'
                className='fixed top-0 flex items-center justify-between w-full p-4'
                rel='noopener noreferrer'
                referrerPolicy='no-referrer'>
                <Image
                    src='/logotype-unik.png'
                    width={1080}
                    height={290}
                    alt='Universitas Kadiri'
                    className='w-[120px]'
                />
            </a>

            <div className='flex items-center justify-center flex-col gap-2 min-h-dvh'>
                <h1 className='text-center font-bold text-lg text-orange-200'>
                    Twibbon DN
                </h1>
                <div className='p-1 font-medium rounded-full w-fit bg-neutral-700 flex items-center gap-2 mb-2'>
                    <button
                        onClick={() => setRatio('4:5')}
                        data-state={ratio === '4:5' && 'active'}
                        className='p-1 px-3 rounded-full data-[state=active]:bg-neutral-800'>
                        4:5
                    </button>
                    <button
                        onClick={() => setRatio('9:16')}
                        data-state={ratio === '9:16' && 'active'}
                        className='p-1 px-3 rounded-full data-[state=active]:bg-neutral-800'>
                        9:16
                    </button>
                </div>
                <CanvasEditor
                    key={ratio}
                    width={1080}
                    height={ratio === '4:5' ? 1350 : 1920}
                    twibbonSrc={ratio === '4:5' ? '/twibbon.png' : '/twibbon-916.png'}
                    linkName={
                        ratio === '4:5' ? "DNUnik46-twibbon4'5" : "DNUnik46-twibbon9'16"
                    }
                    className={ratio === '4:5' ? 'aspect-4/5' : 'aspect-9/16'}
                />
            </div>
        </div>
    );
}
