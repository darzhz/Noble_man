'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative py-20 lg:py-32 px-6 lg:px-8 bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto text-center space-y-8">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-block"
        >
          <span className="text-xs uppercase tracking-widest text-primary font-semibold">
            AI-Generated Masterpieces
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight text-balance"
        >
          Discover Nobel{' '}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Masterpieces
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed"
        >
          Exquisite AI-generated paintings inspired by Nobel Prize winners. Each piece celebrates excellence, innovation, and human achievement.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
        >
          <Link
            href="#gallery"
            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Browse Collection
          </Link>
          <button className="px-8 py-3 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/10 transition-colors">
            Learn More
          </button>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="pt-8 flex flex-col sm:flex-row gap-8 justify-center items-center text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">⭐</span>
            <span>Rated 4.8 • 1000+ Happy Collectors</span>
          </div>
          <div className="hidden sm:block w-px h-6 bg-border" />
          <div className="flex items-center gap-2">
            <span className="text-xl">🎨</span>
            <span>100% AI-Generated • Unique Each</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
