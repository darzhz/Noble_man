'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/header/Header';
import { motion } from 'framer-motion';
import { UploadProvider } from '@/lib/uploadContext';
import { useRouter } from 'next/navigation';
import { ImagePlus, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    try {
      const items = JSON.parse(localStorage.getItem('nobilified_cart') || '[]');
      setCartItems(items);
    } catch (e) {
      console.error('Failed to load cart', e);
    }
  }, []);

  const [restoringId, setRestoringId] = useState<string | null>(null);

  const handleRestore = async (item: any) => {
    setRestoringId(item.id);

    let imageUrl = item.imageUrl;

    // If no cached image URL, try to fetch it from the backend first
    if (!imageUrl) {
      try {
        const res = await fetch('/api/face/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ request_id: item.id }),
        });
        if (res.ok) {
          const data = await res.json();
          const msg = data.message;
          if (msg?.status === 'Completed') {
            const img = msg.images?.find((i: any) => i.status === 'Completed');
            imageUrl = img?.image_data_url || msg.image_data_url || '';
          }
        }
      } catch {
        // Fall through — restore flow will poll
      }
    }

    localStorage.setItem('noblified_restore_req', item.id);
    if (imageUrl) {
      localStorage.setItem('noblified_restore_url', imageUrl);
    }
    router.push('/');
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background">
      <UploadProvider>
        <Header />
      </UploadProvider>
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Your Masterpieces</h1>
            <p className="text-muted-foreground mt-2">
              Review your past generations and easily order canvas or print versions.
            </p>
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-border rounded-xl bg-card">
              <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">You haven't generated any portraits yet.</p>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors"
              >
                <ImagePlus className="w-5 h-5" />
                Create a Portrait
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <div className="aspect-[4/5] bg-muted relative">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt="Portrait generation"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-secondary/30 text-muted-foreground text-center space-y-2">
                        <ImagePlus className="w-8 h-8 opacity-50" />
                        <span className="text-xs font-medium uppercase tracking-wider">Preview Unavailable Offline</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-background/20 backdrop-blur-[2px] opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-background/90 text-foreground px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">Preview</span>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col gap-4 flex-1">
                    <div>
                      <p className="font-semibold text-foreground truncate">Order #{item.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.date).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRestore(item)}
                      disabled={restoringId === item.id}
                      className="mt-auto w-full flex items-center justify-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
                    >
                      {restoringId === item.id ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Loading...</>
                      ) : (
                        <><span>View & Buy</span><ArrowRight className="w-4 h-4" /></>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
