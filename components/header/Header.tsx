'use client';

import React from 'react';
import { useUploadContext, type UploadStep } from '@/lib/uploadContext';

export default function Header() {
  const { step, style, setStyle } = useUploadContext();

  // Breadcrumb labels
  const stepLabels = ['Upload', 'Preview', 'Download or Order Print'];
  const currentStepIndex = step === 'generating' ? 1 : step === 'preview' ? 1 : step === 'checkout' ? 2 : step === 'success' ? 2 : 0;

  return (
    <header className="bg-background border-b border-border py-4 px-4 md:px-8 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
              Noblified
            </h1>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              AI Portraits
            </span>
          </div>

          {/* Style Toggle */}
          <div className="flex items-center gap-2 bg-card rounded-full px-2 py-2 border border-border">
            <button
              onClick={() => setStyle('humans')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                style === 'humans'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-secondary'
              }`}
            >
              👤 Humans
            </button>
            <button
              onClick={() => setStyle('pets')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                style === 'pets'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-secondary'
              }`}
            >
              🐾 Pets
            </button>
          </div>

          {/* Trust Badge */}
          <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
            <span className="text-primary">⭐</span>
            <span>Rated 4.8 on Trustpilot</span>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {stepLabels.map((label, index) => (
            <React.Fragment key={label}>
              <span
                className={index <= currentStepIndex ? 'text-foreground font-medium' : 'text-muted-foreground'}
              >
                {label}
              </span>
              {index < stepLabels.length - 1 && <span className="text-muted-foreground">/</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </header>
  );
}
