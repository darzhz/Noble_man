'use client';

import React from 'react';
import { useUploadContext, type UploadStep } from '@/lib/uploadContext';
import { Menu, User, PawPrint } from 'lucide-react';

export default function Header() {
  const { step, style, setStyle } = useUploadContext();

  // Breadcrumb labels
  const stepLabels = ['Upload', 'Preview Your Painting', 'Claim Your Canvas'];
  const currentStepIndex = step === 'generating' ? 1 : step === 'preview' ? 1 : step === 'checkout' ? 2 : step === 'success' ? 2 : 0;

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top banner */}
      {/* <div className="bg-white text-black py-2 px-4 text-center text-xs md:text-sm font-medium">
        Free Shipping on Oil Paintings | #1 on TrustCaptain
      </div> */}

      {/* Main header */}
      <div className="bg-background border-b border-border px-4 md:px-8 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Top bar with logo centered and buttons */}
          <div className="flex items-center justify-between mb-6">
            {/* Logo - Left */}
            <div className="flex flex-col">
              <h1 className="font-serif text-xl md:text-2xl font-bold text-foreground leading-none">
                Nobilified
              </h1>
              <p className="font-serif text-[10px] md:text-xs italic text-primary mt-1">
                Hand-painted Royalty
              </p>
            </div>

            {/* Style Toggle - Center */}
            <div className="flex items-center gap-1 bg-card rounded-full px-1.5 py-1.5 border border-border">
              <button
                onClick={() => setStyle('humans')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${style === 'humans'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-secondary'
                  }`}
              >
                <User size={14} />
                Humans
              </button>
              <button
                onClick={() => setStyle('pets')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${style === 'pets'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-secondary'
                  }`}
              >
                <PawPrint size={14} />
                Pets
              </button>
            </div>

            {/* Hamburger - Right */}
            <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
              <Menu size={20} className="text-foreground" />
            </button>
          </div>

          {/* Breadcrumb - Centered */}
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            {stepLabels.map((label, index) => (
              <React.Fragment key={label}>
                <span
                  className={index <= currentStepIndex ? 'text-foreground font-medium' : 'text-muted-foreground'}
                >
                  {label}
                </span>
                {index < stepLabels.length - 1 && <span className="text-muted-foreground">›</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
