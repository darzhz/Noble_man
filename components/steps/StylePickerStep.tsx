'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2, AlertCircle, Sparkles, Crown } from 'lucide-react';
import { useUploadContext } from '@/lib/uploadContext';
import { slugify } from '@/lib/slug';
import CredibilitySection from '@/components/credibility/CredibilitySection';

const API_URL = '/api/face/templates';
const PLACEHOLDER_FRAGMENT = 'placehold.co';

type Category = 'Human' | 'Pets' | null;

interface Template {
  templateName: string;
  templateImage: string;
  category: Category;
  isTopSelling: boolean;
  isStaffPick: boolean;
}

type Filter = 'all' | 'Human' | 'Pets';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'Human', label: 'Human' },
  { id: 'Pets', label: 'Pets' },
];

export default function StylePickerStep() {
  const router = useRouter();
  const { setPromptTemplate } = useUploadContext();
  const [items, setItems] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(API_URL, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const raw: Array<{
          template_name: string;
          template_image: string;
          category?: string | null;
          is_top_selling?: boolean;
          is_staff_pick?: boolean;
        }> = data?.message?.templates ?? [];
        if (cancelled) return;
        if (raw.length === 0) {
          setError('No styles are available right now. Please try again later.');
          setItems([]);
          return;
        }
        setItems(
          raw
            .filter((t) => t.template_name)
            .map((t) => ({
              templateName: t.template_name,
              templateImage:
                t.template_image && !t.template_image.includes(PLACEHOLDER_FRAGMENT)
                  ? t.template_image
                  : '',
              category: (t.category === 'Human' || t.category === 'Pets' ? t.category : null) as Category,
              isTopSelling: !!t.is_top_selling,
              isStaffPick: !!t.is_staff_pick,
            }))
        );
      } catch {
        if (!cancelled) {
          setError('Could not load styles. Please check your connection and retry.');
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter((t) => t.category === filter);
  }, [items, filter]);

  const topSelling = useMemo(() => filtered.filter((t) => t.isTopSelling), [filtered]);
  const staffPicks = useMemo(() => filtered.filter((t) => t.isStaffPick), [filtered]);

  const handleSelect = (t: Template) => {
    setPromptTemplate(t.templateName);
    router.push(`/upload/${slugify(t.templateName)}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-[calc(100vh-64px)] w-full"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10">
        {/* Hero */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
            The Style Library · {items.length} {items.length === 1 ? 'style' : 'styles'}
          </p>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground leading-tight">
            Choose your <em className="italic font-medium">aesthetic</em>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Curated portrait styles, hand-painted in the Nobilified atelier.
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center gap-1 bg-card rounded-full px-1.5 py-1.5 border border-border">
            {FILTERS.map((f) => {
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-secondary'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <AlertCircle className="w-10 h-10 text-destructive" />
            <p className="text-sm text-muted-foreground max-w-md">{error}</p>
            <button
              onClick={() => setReloadKey((k) => k + 1)}
              className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            No styles in this category yet.
          </div>
        ) : (
          <div className="space-y-12">
            {topSelling.length > 0 && (
              <CarouselRow
                title="Top Selling"
                subtitle="The most loved styles, picked by you."
                items={topSelling}
                onSelect={handleSelect}
                badgeFor={(t) => (t.isStaffPick ? 'STAFF PICK' : null)}
              />
            )}
            {staffPicks.length > 0 && (
              <CarouselRow
                title="Staff Picks"
                subtitle="Hand-picked favorites from the Nobilified team."
                items={staffPicks}
                onSelect={handleSelect}
                badgeFor={(t) => (t.isTopSelling ? 'TOP SELLING' : null)}
              />
            )}
            <CarouselRow
              title="All Styles"
              subtitle="Browse the full library."
              items={filtered}
              onSelect={handleSelect}
              badgeFor={(t) => (t.isTopSelling ? 'TOP SELLING' : t.isStaffPick ? 'STAFF PICK' : null)}
            />
          </div>
        )}
      </div>

      {/* Testimonials + press strip */}
      <CredibilitySection />
    </motion.div>
  );
}

interface CarouselRowProps {
  title: string;
  subtitle?: string;
  items: Template[];
  onSelect: (t: Template) => void;
  badgeFor?: (t: Template) => string | null;
}

function CarouselRow({ title, subtitle, items, onSelect, badgeFor }: CarouselRowProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 'left' | 'right') => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-card]');
    const delta = (card?.offsetWidth ?? 220) + 16;
    el.scrollBy({ left: dir === 'left' ? -delta * 2 : delta * 2, behavior: 'smooth' });
  };

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">{title}</h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scrollBy('left')}
            className="w-9 h-9 rounded-full border border-border bg-card hover:bg-secondary transition-colors flex items-center justify-center text-foreground"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scrollBy('right')}
            className="w-9 h-9 rounded-full border border-border bg-card hover:bg-secondary transition-colors flex items-center justify-center text-foreground"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide"
      >
        <AnimatePresence>
          {items.map((t) => {
            const badge = badgeFor?.(t) ?? null;
            return (
              <motion.button
                key={t.templateName}
                data-card
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                onClick={() => onSelect(t)}
                className="snap-start shrink-0 w-[180px] sm:w-[220px] md:w-[240px] aspect-[3/4] rounded-2xl overflow-hidden border border-border bg-muted relative text-left group focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {t.templateImage ? (
                  <img
                    src={t.templateImage}
                    alt={t.templateName}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs">
                    No preview
                  </div>
                )}
                {badge && (
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-primary/90 text-primary-foreground text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm flex items-center gap-1">
                    {badge === 'STAFF PICK' ? <Sparkles className="w-3 h-3" /> : <Crown className="w-3 h-3" />}
                    {badge}
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pt-8 pb-3">
                  <p className="text-white font-semibold text-sm leading-tight truncate">
                    {t.templateName}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}
