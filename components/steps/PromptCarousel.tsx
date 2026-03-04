'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { useUploadContext } from '@/lib/uploadContext';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

// ---------------------------------------------------------------------------
// Hardcoded fallback prompts (used when API returns empty or as fallback images)
// ---------------------------------------------------------------------------
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

// Placeholder URL fragment used by the backend when no real image is set
const PLACEHOLDER_FRAGMENT = 'placehold.co';

/** Pick a random fallback image from the PROMPTS array */
function randomFallbackImage(): string {
    return PROMPTS[Math.floor(Math.random() * PROMPTS.length)].image;
}

// ---------------------------------------------------------------------------
// Normalised carousel item shape
// ---------------------------------------------------------------------------
interface CarouselItem {
    /** Unique key for React */
    id: string;
    /** Display name */
    name: string;
    /** Short description shown under the active card */
    description: string;
    /** Resolved image URL — never a placeholder */
    image: string;
    /**
     * The exact template_name string from the API.
     * Empty string = this item came from PROMPTS (no backend template name).
     */
    templateName: string;
}

const ITEM_WIDTH = 200;
const ITEM_MARGIN = 16;
const FULL_ITEM_WIDTH = ITEM_WIDTH + ITEM_MARGIN * 2;

// Use internal API route instead of direct external call
const API_URL = '/api/face/templates';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function PromptCarousel() {
    const { prompt, setPrompt, setPromptTemplate } = useUploadContext();
    const [items, setItems] = useState<CarouselItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);

    // ------------------------------------------------------------------
    // Fetch templates from API on mount
    // ------------------------------------------------------------------
    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const res = await fetch(API_URL, { cache: 'no-store' });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const data = await res.json();
                const raw: Array<{ template_name: string; template_image: string }> =
                    data?.message?.templates ?? [];

                if (!cancelled && raw.length > 0) {
                    const mapped: CarouselItem[] = raw.map((t, i) => ({
                        id: `api-${i}`,
                        name: t.template_name,
                        description: '',
                        // If the image is the exact placeholder URL → swap in a random fallback
                        image: t.template_image.includes(PLACEHOLDER_FRAGMENT)
                            ? randomFallbackImage()
                            : t.template_image,
                        templateName: t.template_name,
                    }));
                    setItems(mapped);
                    // Auto-select the template that matches the current context prompt/template
                    const ctx = mapped.findIndex((m) => m.templateName === prompt || m.id === prompt);
                    setActiveIndex(ctx !== -1 ? ctx : 0);
                } else if (!cancelled) {
                    // API returned empty → fall back to hardcoded PROMPTS
                    useFallback();
                }
            } catch {
                if (!cancelled) useFallback();
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        function useFallback() {
            const fallback: CarouselItem[] = PROMPTS.map((p) => ({
                id: p.id,
                name: p.name,
                description: p.description,
                image: p.image,
                templateName: '', // no backend template name for hardcoded items
            }));
            setItems(fallback);
            const idx = fallback.findIndex((f) => f.id === prompt);
            setActiveIndex(idx !== -1 ? idx : 0);
        }

        load();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ------------------------------------------------------------------
    // Sync context whenever the active item changes
    // ------------------------------------------------------------------
    useEffect(() => {
        const active = items[activeIndex];
        if (!active) return;
        setPrompt(active.id);
        setPromptTemplate(active.templateName);
    }, [activeIndex, items, setPrompt, setPromptTemplate]);

    const handleNext = useCallback(() => {
        setActiveIndex((i) => Math.min(i + 1, items.length - 1));
    }, [items.length]);

    const handlePrev = useCallback(() => {
        setActiveIndex((i) => Math.max(i - 1, 0));
    }, []);

    const handleDragEnd = useCallback((_e: unknown, { offset, velocity }: PanInfo) => {
        if (offset.x < -50 || velocity.x < -200) handleNext();
        else if (offset.x > 50 || velocity.x > 200) handlePrev();
    }, [handleNext, handlePrev]);

    const handleItemClick = useCallback((index: number) => {
        setActiveIndex(index);
    }, []);

    // ------------------------------------------------------------------
    // Render
    // ------------------------------------------------------------------
    return (
        <div className="w-full overflow-hidden py-2 px-4 relative">
            <div className="max-w-4xl mx-auto flex flex-col items-center space-y-4">
                <div className="text-center space-y-1 mb-4">
                    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
                        Choose Your Era
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Swipe or use arrows to explore different masterworks
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-[300px]">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                ) : (
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
                            {/* Drag overlay */}
                            <motion.div
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.1}
                                onDragEnd={handleDragEnd}
                                className="absolute inset-0 z-20 cursor-grab active:cursor-grabbing"
                                style={{ touchAction: 'none' }}
                            />

                            {items.map((item, index) => {
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
                                        <div
                                            className={`relative w-full aspect-[4/5] rounded-xl overflow-hidden shadow-xl border-4 transition-colors duration-300 ${isActive ? 'border-primary' : 'border-transparent'
                                                }`}
                                        >
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
                                                    {item.description && (
                                                        <p className="text-white/80 text-xs mt-1 drop-shadow-md">
                                                            {item.description}
                                                        </p>
                                                    )}
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
                            disabled={activeIndex === items.length - 1}
                            className="absolute right-0 md:right-4 z-30 p-2 rounded-full bg-background/80 border border-border shadow-md text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                            aria-label="Next style"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                )}

                {/* Dot indicator */}
                {!loading && items.length > 0 && (
                    <div className="flex gap-1.5 pt-2">
                        {items.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => handleItemClick(i)}
                                aria-label={`Go to slide ${i + 1}`}
                                className={`rounded-full transition-all duration-300 ${i === activeIndex
                                    ? 'w-4 h-2 bg-primary'
                                    : 'w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                                    }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
