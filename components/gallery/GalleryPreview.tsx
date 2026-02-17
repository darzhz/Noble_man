'use client';

import React from 'react';
import { motion } from 'framer-motion';

const samplePortraits = [
  {
    id: 1,
    title: 'Royal Portrait',
    color: 'from-amber-700 to-yellow-600',
  },
  {
    id: 2,
    title: 'Noble Elegance',
    color: 'from-slate-700 to-slate-800',
  },
  {
    id: 3,
    title: 'Distinguished Look',
    color: 'from-red-700 to-orange-600',
  },
  {
    id: 4,
    title: 'Regal Beauty',
    color: 'from-purple-700 to-pink-600',
  },
];

export default function GalleryPreview() {
  return (
    <section className="bg-background py-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section Title */}
        <div className="text-center space-y-3">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
            Gallery of Masterpieces
          </h2>
          <p className="text-lg text-muted-foreground">
            See the transformations from real customers
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {samplePortraits.map((portrait, index) => (
            <motion.div
              key={portrait.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group relative overflow-hidden rounded-lg aspect-[3/4] bg-card border border-border hover:border-primary transition-colors cursor-pointer"
            >
              {/* Placeholder with gradient */}
              <div
                className={`w-full h-full bg-gradient-to-b ${portrait.color} opacity-20 flex items-center justify-center`}
              >
                <div className="text-center space-y-2">
                  <div className="text-5xl">🎨</div>
                  <p className="text-sm text-muted-foreground font-medium">{portrait.title}</p>
                </div>
              </div>

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                  View
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-border"
        >
          <div className="text-center space-y-2">
            <p className="text-4xl font-bold text-primary">1M+</p>
            <p className="text-muted-foreground">Portraits Created</p>
          </div>
          <div className="text-center space-y-2">
            <p className="text-4xl font-bold text-primary">4.8★</p>
            <p className="text-muted-foreground">Average Rating</p>
          </div>
          <div className="text-center space-y-2">
            <p className="text-4xl font-bold text-primary">98%</p>
            <p className="text-muted-foreground">Customer Satisfaction</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
