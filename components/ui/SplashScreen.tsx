'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 1000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
            exit={{ opacity: 0, filter: 'blur(10px)', scale: 1.05 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="flex flex-col items-center"
            >
                {/* Logo image */}
                <img src="/nobilified.png" alt="Nobilified" className="h-20 md:h-28 w-auto object-contain" />
                {/* <span className="font-serif text-5xl md:text-7xl font-bold text-foreground leading-none italic">
                    Nobilified
                </span> */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.5, duration: 1, ease: 'easeInOut' }}
                    className="h-[2px] bg-primary mt-4"
                />
                {/* <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                    className="font-serif text-sm md:text-base italic text-primary mt-2"
                >
                    Hand-painted Royalty
                </motion.p> */}
            </motion.div>
        </motion.div>
    );
}
