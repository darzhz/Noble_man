'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ChevronRight, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TESTIMONIALS = [
    { nameKey: 'testimonial_1_name', quoteKey: 'testimonial_1_quote', photo: '/testimonials/review-1.jpg' },
    { nameKey: 'testimonial_2_name', quoteKey: 'testimonial_2_quote', photo: '/testimonials/review-2.jpg' },
    { nameKey: 'testimonial_3_name', quoteKey: 'testimonial_3_quote', photo: '/testimonials/review-3.jpg' },
    { nameKey: 'testimonial_4_name', quoteKey: 'testimonial_4_quote', photo: '/testimonials/review-4.jpg' },
    { nameKey: 'testimonial_5_name', quoteKey: 'testimonial_5_quote', photo: '/testimonials/review-5.jpg' },
    { nameKey: 'testimonial_6_name', quoteKey: 'testimonial_6_quote', photo: '/testimonials/review-6.jpg' },
] as const;

const PRESS_NAMES = [
    'COSMOPOLITAN',
    'USA TODAY',
    'Esquire',
    'VOGUE',
    'METRO',
    'NEW YORK POST',
] as const;

function TestimonialQuote({ text, expanded, onToggle }: { text: string; expanded: boolean; onToggle: () => void }) {
    return (
        <div>
            <p className={`text-xs text-muted-foreground leading-relaxed ${expanded ? '' : 'line-clamp-5'}`}>
                &ldquo;{text}&rdquo;
            </p>
            <button
                onClick={onToggle}
                className="text-[10px] font-medium text-primary mt-0.5 hover:underline"
            >
                {expanded ? 'Show less' : 'Read more'}
            </button>
        </div>
    );
}

export default function CredibilitySection() {
    const { t } = useTranslation();
    const [allExpanded, setAllExpanded] = useState(false);
    const testimonialsRef = useRef<HTMLDivElement>(null);

    const scrollTestimonialsRight = () => {
        testimonialsRef.current?.scrollBy({
            left: 210,
            behavior: 'smooth',
        });
    };

    return (
        <section className="bg-background pt-6 pb-16 px-4 md:px-8 border-t border-border">
            <div className="max-w-6xl mx-auto space-y-20">

                {/* Testimonials Section */}
                <div className="relative">
                    <div
                        ref={testimonialsRef}
                        className="flex gap-3 overflow-x-auto overflow-y-hidden snap-x snap-proximity md:snap-mandatory overscroll-x-contain pb-4 px-2 md:px-4 scroll-px-2 md:scroll-px-4 scrollbar-hide"
                    >
                        {TESTIMONIALS.map((item, i) => (
                            <motion.div
                                key={item.nameKey}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="snap-start shrink-0 w-[180px] md:w-[200px] bg-card border border-border rounded-xl overflow-hidden shadow-sm"
                            >
                                <div className="aspect-[4/5] overflow-hidden">
                                    <img
                                        src={item.photo}
                                        alt={t(item.nameKey)}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="p-3 space-y-1.5">
                                    <div className="flex gap-0.5 text-yellow-500">
                                        {[...Array(5)].map((_, j) => (
                                            <Star key={j} className="w-3 h-3 fill-current" />
                                        ))}
                                    </div>
                                    <TestimonialQuote text={t(item.quoteKey)} expanded={allExpanded} onToggle={() => setAllExpanded(!allExpanded)} />
                                    <div>
                                        <p className="text-xs font-semibold text-foreground">— {t(item.nameKey)}</p>
                                        <p className="text-[10px] text-green-600 flex items-center gap-1 mt-0.5">
                                            <CheckCircle className="w-2.5 h-2.5" />
                                            {t('testimonial_verified')}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center bg-gradient-to-l from-background/70 via-background/20 to-transparent pl-4 pr-2 md:from-background md:via-background/90 md:pl-8 md:pr-1">
                        <button
                            type="button"
                            aria-label="Scroll testimonials"
                            onClick={scrollTestimonialsRight}
                            className="pointer-events-auto rounded-full border border-border bg-background/95 p-1 shadow-sm transition-colors hover:bg-muted"
                        >
                            <ChevronRight className="w-4 h-4 text-primary" />
                        </button>
                    </div>
                </div>

                {/* As Seen On Section */}
                <div className="space-y-5 pt-10 border-t border-border/50">
                    <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        As Seen In
                    </p>

                    <div className="-mx-4 overflow-hidden px-4 md:hidden">
                        <div
                            className="animate-marquee flex w-max items-center gap-8 pr-8"
                            style={{ animationDuration: '28s' }}
                        >
                            {[...PRESS_NAMES, ...PRESS_NAMES].map((name, index) => (
                                <span
                                    key={`${name}-${index}`}
                                    aria-hidden={index >= PRESS_NAMES.length}
                                    className="whitespace-nowrap text-base font-semibold text-muted-foreground/70"
                                >
                                    {name}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="hidden md:block">
                        <div className="flex w-full items-center justify-center gap-12">
                            {PRESS_NAMES.map((name) => (
                                <span
                                    key={name}
                                    className="whitespace-nowrap text-lg font-semibold text-muted-foreground/70"
                                >
                                    {name}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
