'use client';

import React, { useState, useEffect } from 'react';
import { useUploadContext, type UploadStep } from '@/lib/uploadContext';
import { Menu, User, PawPrint, AlertTriangle } from 'lucide-react';
import Sidebar from './Sidebar';
import { useTranslation } from 'react-i18next';

export default function Header() {
  const { step, style, setStyle, reset } = useUploadContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [rateLimitedMsg, setRateLimitedMsg] = useState<string | null>(null);
  const { t } = useTranslation();

  // Poll rate limit once on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/face/rate-limit', { method: 'POST' });
        const data = await res.json();
        const status = data.message;
        if (status && !status.can_generate) {
          const msg =
            status.errors && status.errors.length > 0
              ? status.errors.map((e: { message: string }) => e.message).join('  ·  ')
              : 'Generation is temporarily unavailable. Please try again later.';
          setRateLimitedMsg(msg);
        }
      } catch {
        // silently fail — don't block the UI
      }
    })();
  }, []);

  // Breadcrumb labels
  const stepLabels = [t('step_upload'), t('step_preview'), t('step_download')];
  const currentStepIndex = step === 'generating' ? 1 : step === 'preview' ? 1 : step === 'checkout' ? 2 : step === 'success' ? 2 : 0;

  return (
    <header className={`z-50 w-full bg-white ${step === 'preview' || step === 'checkout' ? 'relative' : 'sticky top-0'}`}>

      {/* Rate-limit marquee banner */}
      {/* Rate-limit marquee banner */}
      {rateLimitedMsg && (
        <div className="bg-secondary/40 border-b border-border py-2 overflow-hidden">
          <div className="marquee-track flex whitespace-nowrap gap-16 animate-marquee">
            {[...Array(4)].map((_, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 text-xs text-muted-foreground font-medium shrink-0"
              >
                <AlertTriangle size={12} className="opacity-60 shrink-0" />
                {rateLimitedMsg}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main header */}
      <div className="bg-background border-b border-border px-4 md:px-8 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Top bar with logo centered and buttons */}
          <div className="flex items-center justify-between mb-6">
            {/* Logo - Left */}
            <div
              onClick={() => {
                if (window.location.pathname !== '/') {
                  window.location.href = '/';
                } else {
                  localStorage.removeItem('noblified_request_id');
                  reset();
                }
              }}
              className="flex flex-col hover:opacity-80 transition-opacity cursor-pointer"
            >
              {/* Logo image */}
              <img src="/nobilified.png" alt="Nobilified" className="h-8 md:h-10 w-auto object-contain" />
            </div>

            {/* Style Toggle - Center */}
            <div className="flex items-center gap-1 bg-card rounded-full px-1.5 py-1.5 border border-border">
              <button
                onClick={() => setStyle('Self-Portraits')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${style !== 'Pet Portraits'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-secondary'
                  }`}
              >
                <User size={14} />
                {t('style_human')}
              </button>
              <button
                onClick={() => setStyle('Pet Portraits')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${style === 'Pet Portraits'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-secondary'
                  }`}
              >
                <PawPrint size={14} />
                {t('style_pets')}
              </button>
            </div>

            {/* Actions - Right */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <Menu size={20} className="text-foreground" />
              </button>
            </div>
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

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </header>
  );
}
