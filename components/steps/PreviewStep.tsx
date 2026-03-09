'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useUploadContext } from '@/lib/uploadContext';
import { addWatermark, blobToDataUrl } from '@/lib/watermark';
import { ChevronLeft, Loader2, Download, Printer, Frame, Check, Sparkles, Paintbrush, Landmark, Crown } from 'lucide-react';

const POLL_INTERVAL_MS = 5000;
const MAX_POLL_ATTEMPTS = 60; // 5 minutes max

const FUNNY_MESSAGES = [
  "Mixing the perfect shade of 'Royal Burgundy'...",
  "Telling the AI to add more grandeur...",
  "Consulting with 18th-century art critics...",
  "Ensuring your wig is perfectly powdered...",
  "Polishing the gold leaf on your virtual frame...",
  "Bribing a court painter with digital treats...",
  "Calculating the optimal level of smugness...",
  "Sprinkling a dash of historical inaccuracy...",
  "Adjusting the lighting to hide your peasant origins...",
  "Summoning the spirit of Rembrandt...",
];

export default function PreviewStep() {
  const {
    setStep,
    uploadedImages,
    promptTemplate,
    setGeneratedImage,
    generatedImage,
    setWatermarkedImage,
    setGeneratedImageUrl,
    generatedImageUrl,
    setRequestId,
    requestId,
    setError,
    setProcessing,
    processing,
  } = useUploadContext();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('Submitting your photo...');
  const [messageIndex, setMessageIndex] = useState(0);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollCountRef = useRef(0);
  const isSubmittedRef = useRef(false);

  const products = [
    {
      id: 'digital',
      name: 'Instant Digital High-Res',
      price: 29,
      originalPrice: 49,
      icon: Download,
      description: 'The digital masterpiece. Perfect for social media and DIY printing.',
      benefits: [
        'No Watermark',
        'Commercial License',
        '8K Ultra-High Resolution',
      ],
      buttonLabel: 'Get Digital Copy',
      highlighted: false,
    },
    {
      id: 'print',
      name: 'Fine Art Print',
      price: 89,
      originalPrice: 129,
      icon: Printer,
      description: 'Museum-quality archival paper with fade-resistant inks.',
      benefits: [
        'Includes Digital Copy', // Upsell benefit
        'Premium Matte Finish',
        'Ships in 3-5 days',
      ],
      buttonLabel: 'Order Fine Art Print',
      highlighted: false,
    },
    {
      id: 'canvas',
      name: 'Gallery Canvas',
      price: 299,
      originalPrice: 399,
      icon: Frame,
      description: 'Hand-stretched on a 1.25" wood frame. Arrives ready to hang.',
      benefits: [
        'Includes Digital Copy', // Upsell benefit
        'Life-time Warranty',
        'Free Express Shipping',
      ],
      buttonLabel: 'Order Gallery Canvas',
      highlighted: true,
    },
  ];

  // Helper: convert File to base64 and strip the data URL prefix
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Strip data:image/png;base64, prefix if present
        resolve(result.includes(',') ? result.split(',')[1] : result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const pollStatus = useCallback(async (reqId: string) => {
    if (pollCountRef.current >= MAX_POLL_ATTEMPTS) {
      setError('Generation timed out. Please try again.');
      setProcessing(false);
      return;
    }
    pollCountRef.current += 1;
    try {
      const res = await fetch('/api/face/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: reqId }),
      });
      if (!res.ok) throw new Error(`Status check failed: ${res.statusText}`);
      const data = await res.json();
      const status = data.message?.status;

      if (status === 'Completed') {
        const imageDataUrl = data.message.image_data_url;
        setGeneratedImageUrl(imageDataUrl);
        setStatusMessage('Applying watermark...');
        const imgResponse = await fetch(imageDataUrl);
        const imgBlob = await imgResponse.blob();
        setGeneratedImage(imgBlob);
        const watermarked = await addWatermark(imgBlob);
        setWatermarkedImage(watermarked);
        const wmUrl = await blobToDataUrl(watermarked);
        setPreviewUrl(wmUrl);

        // Save to cart local storage
        try {
          const newGen = {
            id: reqId,
            imageUrl: imageDataUrl,
            date: new Date().toISOString(),
          };
          const history = JSON.parse(localStorage.getItem('nobilified_cart') || '[]');
          if (!history.some((h: any) => h.id === reqId)) {
            // Keep up to 20 items to prevent quota issues even with URLs
            localStorage.setItem('nobilified_cart', JSON.stringify([newGen, ...history].slice(0, 20)));
          }
        } catch (e) {
          console.error("Failed to save to cart", e);
        }

        setProcessing(false);
        setStep('preview');
        return;
      } else if (status === 'Failed') {
        // Look for the corrected error_message field from the API
        setError(data.message?.error_message || data.message?.error || 'Portrait generation failed. Please try again.');
        setProcessing(false);
        return;
      }
      if (status === 'Processing') setStatusMessage(FUNNY_MESSAGES[messageIndex % FUNNY_MESSAGES.length]);
      else if (status === 'Queued') setStatusMessage('Waiting in queue...');
      pollTimerRef.current = setTimeout(() => pollStatus(reqId), POLL_INTERVAL_MS);
    } catch (err) {
      console.error('[PreviewStep] Poll error:', err);
      setError(err instanceof Error ? err.message : 'Failed to check status');
      setProcessing(false);
    }
  }, [setError, setProcessing, setGeneratedImage, setGeneratedImageUrl, setWatermarkedImage, setStep]);

  useEffect(() => {
    const submitImage = async () => {
      // Handle restore flow
      if (requestId && (!uploadedImages || uploadedImages.length === 0) && !isSubmittedRef.current) {
        isSubmittedRef.current = true;
        setProcessing(true);
        setStatusMessage('Restoring masterpiece...');
        pollCountRef.current = 0;
        pollTimerRef.current = setTimeout(() => pollStatus(requestId), 0);
        return;
      }

      if (!uploadedImages || uploadedImages.length === 0 || isSubmittedRef.current) return;
      isSubmittedRef.current = true;
      try {
        setProcessing(true);
        setError(null);

        // Convert all images to base64
        const base64Images = await Promise.all(uploadedImages.map(fileToBase64));
        const userId = `session-${Date.now()}-${Math.random().toString(36).substring(7)}`;

        const payload: any = {
          user_id: userId,
        };

        // Pass either singular 'image' or plural 'images' based on count
        if (base64Images.length === 1) {
          payload.image = base64Images[0];
        } else {
          payload.images = base64Images;
        }

        if (promptTemplate) {
          payload.prompt_template = promptTemplate;
        }

        const res = await fetch('/api/face/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to submit image');
        }
        const data = await res.json();
        const reqId = data.message?.request_id;
        if (!reqId) throw new Error('No request_id returned from API');
        setRequestId(reqId);
        setStatusMessage('Waiting in queue...');
        pollCountRef.current = 0;
        pollTimerRef.current = setTimeout(() => pollStatus(reqId), POLL_INTERVAL_MS);
      } catch (err) {
        console.error('[PreviewStep] Submit error:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate portrait');
        setProcessing(false);
      }
    };
    submitImage();
    return () => { if (pollTimerRef.current) clearTimeout(pollTimerRef.current); };
  }, [uploadedImages, promptTemplate, setProcessing, setError, setRequestId, pollStatus]);

  // Cycle through funny messages every few seconds while processing
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (processing && !previewUrl) {
      interval = setInterval(() => {
        setMessageIndex((prev) => prev + 1);
        setStatusMessage(FUNNY_MESSAGES[(messageIndex + 1) % FUNNY_MESSAGES.length]);
      }, 3500); // Change message every 3.5 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [processing, previewUrl, messageIndex]);

  useEffect(() => {
    const showExistingPreview = async () => {
      if (generatedImage && !previewUrl && !processing) {
        const watermarked = await addWatermark(generatedImage);
        setWatermarkedImage(watermarked);
        const url = await blobToDataUrl(watermarked);
        setPreviewUrl(url);
      }
    };
    showExistingPreview();
  }, [generatedImage, previewUrl, processing, setWatermarkedImage]);

  const handleBack = () => {
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    localStorage.removeItem('noblified_request_id');
    setPreviewUrl(null);
    setRequestId(null);
    setProcessing(true);
    isSubmittedRef.current = false;
    setStep('upload');
  };

  if (processing && !previewUrl) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="flex justify-center">
            <Loader2 className="w-16 h-16 text-primary" />
          </motion.div>
          <div className="space-y-2">
            <h2 className="font-serif text-3xl font-bold text-foreground">Creating Your Masterpiece</h2>
            <p className="text-muted-foreground">{statusMessage}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background py-12 px-4 md:px-8"
    >
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header Area */}
        <div className="flex items-center justify-between">
          <button onClick={handleBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
            <ChevronLeft className="w-4 h-4" />
            Start Over
          </button>
          <div className="flex items-center gap-2 text-primary text-sm font-semibold italic">
            <Sparkles className="w-4 h-4" />
            AI Masterpiece Generated
          </div>
        </div>

        {/* Main Grid: Preview on left (or top), Store on right (or bottom) */}
        <div className="grid lg:grid-cols-12 gap-12 items-start">

          {/* Left Side: Preview */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative rounded-2xl overflow-hidden bg-card border-4 border-white shadow-2xl"
            >
              {previewUrl && (
                <img src={previewUrl} alt="Your portrait" className="w-full h-auto" />
              )}
              <div className="absolute inset-0 pointer-events-none border border-black/5 rounded-2xl" />
            </motion.div>

            <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-muted-foreground bg-card rounded-full py-2 border border-border">
              <span>Preview Mode: <span className="text-foreground font-bold">Watermarked</span></span>
            </div>
          </div>

          {/* Right Side: Storefront */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <h3 className="font-serif text-4xl font-bold text-foreground leading-tight">
                Don't Just Save It.<br />Immortalize It.
              </h3>
              <p className="text-xl text-primary font-medium italic">Pixels are temporary. Oil paint lasts centuries.</p>

              <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  You’ve seen the preview, now claim the masterpiece. Commission one of our master artists to bring your digital concept to life. <strong className="text-foreground">100% hand-painted using authentic oil paints on premium canvas</strong>—just like the royals did it.
                </p>

                <ul className="space-y-3 pt-2">
                  <li className="flex items-start gap-3 text-sm">
                    <Paintbrush className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground block">Real Art, Real Artists</strong>
                      <span className="text-muted-foreground">No digital printing. Every brushstroke is painted by hand.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <Landmark className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground block">Museum Quality</strong>
                      <span className="text-muted-foreground">Rich, textured oil paints that look incredible on any wall.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <Crown className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground block">The Ultimate Heirloom</strong>
                      <span className="text-muted-foreground">A timeless conversation piece guaranteed to outlast your hard drive.</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-6 pt-4">
              {/* Digital File Option (First Position) */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="group relative border-2 border-primary bg-primary/5 ring-4 ring-primary/10 rounded-xl p-6 transition-all"
              >
                <div className="absolute -top-3 right-6 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest shadow-md">
                  Most Popular
                </div>

                <div className="flex gap-5">
                  <div className="p-4 rounded-xl bg-primary text-primary-foreground h-fit shadow-inner">
                    <Download size={32} />
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="flex items-baseline justify-between border-b border-border/50 pb-4">
                      <div>
                        <h4 className="font-serif font-bold text-2xl text-foreground">High-Res Digital Masterpiece</h4>
                        <p className="text-sm font-medium text-muted-foreground mt-1">Ready to download instantly</p>
                      </div>
                      <span className="text-3xl font-bold text-foreground">$20</span>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p className="flex items-start gap-2">
                        <Check size={16} className="text-primary mt-0.5 shrink-0" />
                        <span>High-resolution, completely <strong className="text-foreground">watermark-free</strong>.</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <Check size={16} className="text-primary mt-0.5 shrink-0" />
                        <span>Perfect for <strong className="text-foreground">social media</strong> or your own printing.</span>
                      </p>
                    </div>

                    <button
                      onClick={() => setStep('checkout')}
                      className="w-full mt-2 py-4 rounded-lg font-bold text-base transition-all bg-primary text-primary-foreground hover:shadow-xl hover:bg-primary/90"
                    >
                      Get Digital File
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Commission Canvas Option */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="group relative border-2 border-border bg-card rounded-xl p-6 transition-all hover:border-primary/50"
              >
                <div className="absolute -top-3 right-6 bg-muted text-muted-foreground text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest border border-border">
                  Hand-Painted
                </div>

                <div className="flex gap-5">
                  <div className="p-4 rounded-xl bg-secondary text-secondary-foreground h-fit">
                    <Frame size={32} />
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="flex items-baseline justify-between border-b border-border/50 pb-4">
                      <div>
                        <h4 className="font-serif font-bold text-2xl text-foreground">Hand-Painted Oil Canvas</h4>
                        <p className="text-sm font-medium text-muted-foreground mt-1">16x20in / 40x50cm</p>
                      </div>
                      <span className="text-3xl font-bold text-foreground">$299</span>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p className="flex items-start gap-2">
                        <Check size={16} className="text-primary mt-0.5 shrink-0" />
                        <span>Stretched on an <strong className="text-foreground">ornate gold frame</strong>.</span>
                      </p>
                      <p className="flex items-start gap-2 bg-secondary/30 p-3 rounded-lg mt-2">
                        <span className="text-xl">⌛</span>
                        <span><strong className="text-foreground">Please note:</strong> It takes approximately <strong className="text-foreground">1 month</strong> to meticulously paint, dry, frame, and ship your masterpiece.</span>
                      </p>
                    </div>

                    <button
                      onClick={() => setStep('checkout')}
                      className="w-full mt-2 py-4 rounded-lg font-bold text-base transition-all bg-secondary text-secondary-foreground hover:shadow-md hover:bg-secondary/80"
                    >
                      Commission Canvas
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Generate Another (De-emphasized) */}
            <div className="pt-4 border-t border-border">
              <button
                onClick={handleBack}
                className="w-full py-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border border-dashed border-border rounded-xl"
              >
                Not happy? Try another photo
              </button>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 border-t border-border">
          {[
            { label: 'Created', val: '1M+' },
            { label: 'Rating', val: '4.8★' },
            { label: 'Secure', val: 'SSL' },
            { label: 'Privacy', val: '100%' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-xl font-bold text-primary">{stat.val}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}