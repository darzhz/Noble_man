'use client';

import React, { useEffect, useState } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { useUploadContext } from '@/lib/uploadContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const PROMPTS = [
    {
        id: 'renaissance',
        name: 'Renaissance',
        description: 'Classic 16th-century masterpiece',
        image: 'https://static01.nyt.com/images/2023/01/09/arts/06frick-item/06frick-item-superJumbo.jpg',
    },
    {
        id: 'royal',
        name: 'Royal Portrait',
        description: 'Majestic noble aesthetic',
        image: 'https://i.pinimg.com/736x/09/8b/b5/098bb53a07243cb11f3c14ee2b1aab7d.jpg',
    },
    {
        id: 'baroque',
        name: 'Baroque',
        description: 'Dramatic light and shadow',
        image: 'https://i.pinimg.com/originals/1f/0d/b3/1f0db3f5e821b9529089bac0a5a41a7a.jpg',
    },
    {
        id: 'impressionist',
        name: 'Impressionist',
        description: 'Soft, brushy, ethereal',
        image: 'https://i.pinimg.com/736x/c0/9e/7a/c09e7a09346ff761363e061035799e69.jpg',
    },
    {
        id: 'vintage',
        name: 'Vintage Photo',
        description: 'Sepia-toned historical look',
        image: 'https://images.pexels.com/photos/3571303/pexels-photo-3571303.jpeg?cs=srgb&dl=pexels-suzyhazelwood-3571303.jpg&fm=jpg',
    },
];

const ITEM_WIDTH = 200;
const ITEM_MARGIN = 16;
const FULL_ITEM_WIDTH = ITEM_WIDTH + ITEM_MARGIN * 2;

export default function PromptCarousel() {
    const { prompt, setPrompt } = useUploadContext();
    const [activeIndex, setActiveIndex] = useState(0);

    // Sync active index with context prompt
    useEffect(() => {
        const idx = PROMPTS.findIndex((p) => p.id === prompt);
        if (idx !== -1) setActiveIndex(idx);
    }, [prompt]);

    const handleNext = () => {
        const nextIndex = Math.min(activeIndex + 1, PROMPTS.length - 1);
        setPrompt(PROMPTS[nextIndex].id);
    };

    const handlePrev = () => {
        const prevIndex = Math.max(activeIndex - 1, 0);
        setPrompt(PROMPTS[prevIndex].id);
    };

    const handleDragEnd = (e: any, { offset, velocity }: PanInfo) => {
        const swipe = offset.x;

        // Swipe left (next item)
        if (swipe < -50 || velocity.x < -200) {
            handleNext();
        }
        // Swipe right (prev item)
        else if (swipe > 50 || velocity.x > 200) {
            handlePrev();
        }
    };

    const handleItemClick = (index: number) => {
        setPrompt(PROMPTS[index].id);
    };

    return (
        <div className="w-full overflow-hidden py-2 px-4 relative">
            <div className="max-w-4xl mx-auto flex flex-col items-center space-y-4">
                <div className="text-center space-y-1 mb-4">
                    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Choose Your Era</h3>
                    <p className="text-xs text-muted-foreground">Swipe or use arrows to explore different masterworks</p>
                </div>

                <div className="relative w-full flex items-center justify-center">
                    {/* Left Button */}
                    <button
                        onClick={handlePrev}
                        disabled={activeIndex === 0}
                        className="absolute left-0 md:left-4 z-30 p-2 rounded-full bg-background/80 border border-border shadow-md text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                        aria-label="Previous style"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <div className="relative w-full flex justify-center items-center h-[300px]">
                        {/* Invisible drag overlay to capture swipes smoothly without interfering with items visually moving */}
                        <motion.div
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.1}
                            onDragEnd={handleDragEnd}
                            className="absolute inset-0 z-20 cursor-grab active:cursor-grabbing"
                            style={{ touchAction: 'none' }}
                        />

                        {PROMPTS.map((item, index) => {
                            const isActive = index === activeIndex;
                            const offset = index - activeIndex;

                            return (
                                <motion.div
                                    key={item.id}
                                    onClick={() => handleItemClick(index)}
                                    className="absolute flex-shrink-0 cursor-pointer origin-center z-10"
                                    style={{ width: ITEM_WIDTH }}
                                    animate={{
                                        x: offset * FULL_ITEM_WIDTH,
                                        scale: isActive ? 1.1 : 0.85,
                                        opacity: Math.abs(offset) > 2 ? 0 : isActive ? 1 : 0.5,
                                        y: isActive ? -10 : 0,
                                        zIndex: isActive ? 10 : 5 - Math.abs(offset),
                                    }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                >
                                    <div className={`relative w-full aspect-[4/5] rounded-xl overflow-hidden shadow-xl border-4 transition-colors duration-300 ${isActive ? 'border-primary' : 'border-transparent'}`}>
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="object-cover w-full h-full pointer-events-none"
                                        />
                                        {isActive && (
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                                                <h4 className="text-white font-serif font-bold text-lg leading-tight shadow-sm">
                                                    {item.name}
                                                </h4>
                                                <p className="text-white/80 text-xs mt-1 drop-shadow-md">
                                                    {item.description}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Right Button */}
                    <button
                        onClick={handleNext}
                        disabled={activeIndex === PROMPTS.length - 1}
                        className="absolute right-0 md:right-4 z-30 p-2 rounded-full bg-background/80 border border-border shadow-md text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                        aria-label="Next style"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
}
