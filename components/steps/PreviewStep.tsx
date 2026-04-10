'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useUploadContext } from '@/lib/uploadContext';
import { blobToDataUrl } from '@/lib/watermark';
import { ChevronLeft, Loader2, Download, Printer, Frame, Check, Sparkles, Paintbrush, Landmark, Crown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import IllustrationBlock from './IllustrationBlock';

const POLL_INTERVAL_MS = 5000;
// 20 minutes max (240 × 5 s). Only hard-stops on 'Failed' from the API.
const MAX_POLL_ATTEMPTS = 240;
// Transient network/server errors are retried with backoff up to this many times
const MAX_CONSECUTIVE_ERRORS = 10;

const PROCESS_MESSAGES = [
  "Welcome to Nobilified!",
  "We've been doing hand painted portraits since 2013 way before AI was even a thing.",
  "Yes, painted by a human with paint brushes and oil paint on canvas.",
  "We're adapting with the times.",
  "But our roots are still in the real deal.",
  "We can turn this into a hand-painted oil masterpiece on canvas.",
  "Bridging these 2 worlds means we have something for everyone.",
  "Premium framed oil paintings for the Kings and Queens.",
  "Digital files to print at home for Peasants.",
  "Paintings take 3-5 days to complete, time to dry, frame and ship.",
  "Wait about a month.",
  "The digital preview. That should be done now.",
  "Enjoy the art and do not forget to share with friends and family."
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
    setGeneratedImagesData,
    generatedImagesData,
    setRequestId,
    requestId,
    setError,
    setProcessing,
    processing,
    setSelectedProduct,
    customerEmail,
  } = useUploadContext();
  const { t } = useTranslation();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState(PROCESS_MESSAGES[0]);
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollCountRef = useRef(0);
  const consecutiveErrorsRef = useRef(0);
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

  // Helper: compress File to base64 and strip the data URL prefix
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 1200;
        let { width, height } = img;
        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round(height * (MAX_DIM / width));
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round(width * (MAX_DIM / height));
            height = MAX_DIM;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const pollStatus = useCallback(async (reqId: string) => {
    if (pollCountRef.current >= MAX_POLL_ATTEMPTS) {
      setError('Generation is taking longer than expected. Please try again.');
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

      // On non-OK HTTP, treat as transient unless it's a hard 4xx (bad request etc.)
      if (!res.ok) {
        if (res.status >= 400 && res.status < 500) {
          // Hard client error — don't keep hammering
          throw new Error(`Status check failed: ${res.statusText}`);
        }
        // 5xx / network-level — count as transient
        throw Object.assign(new Error(`Transient error: ${res.statusText}`), { transient: true });
      }

      const data = await res.json();
      const status = data.message?.status;

      // Reset consecutive error counter on a successful response
      consecutiveErrorsRef.current = 0;

      if (status === 'Completed') {
        let imageDataUrl = data.message.image_data_url;
        const images = data.message.images;

        if (images && images.length > 0) {
          setGeneratedImagesData(images);

          // Use the first completed image if available
          const successfulImage = images.find((img: any) => img.status === 'Completed');
          if (successfulImage && successfulImage.image_data_url) {
            imageDataUrl = successfulImage.image_data_url;
          }
        }

        if (!imageDataUrl) {
          setError('No image was successfully generated. Please try again.');
          setProcessing(false);
          return;
        }

        setGeneratedImageUrl(imageDataUrl);
        setStatusMessage('Finishing up...');
        const imgResponse = await fetch(imageDataUrl);
        const imgBlob = await imgResponse.blob();
        setGeneratedImage(imgBlob);
        setWatermarkedImage(imgBlob);
        setPreviewUrl(imageDataUrl);

        // Save to cart local storage gracefully (prevent QUOTA_EXCEEDED errors from base64 strings)
        try {
          const newGen = { id: reqId, imageUrl: imageDataUrl, date: new Date().toISOString() };
          let history = JSON.parse(localStorage.getItem('nobilified_cart') || '[]');

          if (!history.some((h: any) => h.id === reqId)) {
            // Keep history small to begin with
            history = [newGen, ...history].slice(0, 5);
            try {
              localStorage.setItem('nobilified_cart', JSON.stringify(history));
            } catch (e: any) {
              // If it's a DOMException QuotaExceededError, try discarding the image strings and just save the reqIds
              if (e.name === 'QuotaExceededError') {
                const lightweightHistory = history.map((item: any) => ({ ...item, imageUrl: item.imageUrl?.startsWith('data:') ? '' : item.imageUrl }));
                localStorage.setItem('nobilified_cart', JSON.stringify(lightweightHistory));
              }
            }
          }
        } catch (e) {
          console.error('Failed to save to cart', e);
        }

        setProcessing(false);
        setStep('preview');
        return;
      } else if (status === 'Failed') {
        // Hard stop — the backend explicitly says it failed
        setError(data.message?.error_message || data.message?.error || 'Portrait generation failed. Please try again.');
        setProcessing(false);
        return;
      }

      if (status === 'Processing') {
        // Do nothing, let the 3.5s interval continuously handle the story texts
      } else if (status === 'Queued') {
        setStatusMessage('Waiting in queue...');
      }
      pollTimerRef.current = setTimeout(() => pollStatus(reqId), POLL_INTERVAL_MS);
    } catch (err: any) {
      const isTransient = err?.transient === true || err instanceof TypeError; // TypeError = network failure
      consecutiveErrorsRef.current += 1;
      console.warn(`[PreviewStep] Poll error (${consecutiveErrorsRef.current}/${MAX_CONSECUTIVE_ERRORS}):`, err);

      if (isTransient && consecutiveErrorsRef.current < MAX_CONSECUTIVE_ERRORS) {
        // Exponential backoff: 5 s, 10 s, 20 s … capped at 60 s
        const backoff = Math.min(POLL_INTERVAL_MS * 2 ** (consecutiveErrorsRef.current - 1), 60_000);
        setStatusMessage('Connection hiccup — retrying...');
        pollTimerRef.current = setTimeout(() => pollStatus(reqId), backoff);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to check generation status');
        setProcessing(false);
      }
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

      // Prevent duplicate processing if we already have generated results for this session (e.g. from checkout)
      if (requestId && (generatedImageUrl || (generatedImagesData && generatedImagesData.length > 0))) {
        setProcessing(false);
        return;
      }

      isSubmittedRef.current = true;
      try {
        setMessageIndex(0);
        setStatusMessage(PROCESS_MESSAGES[0]);
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

        if (customerEmail) {
          payload.customer_email = customerEmail;
        }

        if (promptTemplate) {
          payload.prompt_template = promptTemplate;
        } else {
          try {
            const tRes = await fetch('/api/face/templates', { cache: 'no-store' });
            if (tRes.ok) {
              const tData = await tRes.json();
              const templates = tData?.message?.templates ?? [];
              if (templates.length > 0) {
                const randomTpl = templates[Math.floor(Math.random() * templates.length)].template_name;
                payload.prompt_template = randomTpl;
                console.log('[PreviewStep] Selected random template:', randomTpl);
              }
            }
          } catch (e) {
            console.warn('[PreviewStep] Failed to fetch random template fallback', e);
          }
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

  // Cycle through messages every few seconds while processing
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (processing && !previewUrl) {
      interval = setInterval(() => {
        setMessageIndex((prev) => {
          const nextIndex = prev + 1;
          if (nextIndex >= PROCESS_MESSAGES.length) {
            clearInterval(interval);
            return prev;
          }
          setStatusMessage(PROCESS_MESSAGES[nextIndex]);
          return nextIndex;
        });
      }, 3500); // Change message every 3.5 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [processing, previewUrl]);

  // Handle fake progress loading bar 
  useEffect(() => {
    let progressInterval: ReturnType<typeof setInterval>;
    if (processing && !previewUrl) {
      progressInterval = setInterval(() => {
        setProgress(p => {
          if (p < 85) return p + 1;
          if (p < 99) return p + 0.2;
          return p;
        });
      }, 400);
    } else if (previewUrl) {
      setProgress(100);
    }
    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [processing, previewUrl]);

  useEffect(() => {
    const showExistingPreview = async () => {
      if (generatedImage && !previewUrl && !processing) {
        setWatermarkedImage(generatedImage);
        const url = await blobToDataUrl(generatedImage);
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

  const handleSingleDownload = (url: string, index: number = 0) => {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = `noblified-portrait-preview-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (processing && !previewUrl) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-8">
          <div className="text-center space-y-4">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">{t('preview_creating_title')}</h2>
            <div className="h-24 flex items-center justify-center">
              <p className="text-muted-foreground text-lg text-center leading-relaxed font-medium px-4">{statusMessage}</p>
            </div>
          </div>

          <div className="space-y-3 px-8">
            <div className="flex justify-between text-sm font-medium text-foreground">
              <span>Crafting your masterpiece...</span>
              <span>{Math.floor(progress)}%</span>
            </div>
            <div className="h-3 w-full bg-secondary/50 rounded-full overflow-hidden shadow-inner">
              <motion.div
                className="h-full bg-primary"
                style={{ width: `${progress}%` }}
                layout
              />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3, duration: 1 }}
            className="mt-12 pt-8 border-t border-border mx-auto max-w-sm text-center text-sm"
          >
            <p className="font-serif italic text-primary mb-2">Hand-Painted Masterpieces Since 2013</p>
            <p className="text-muted-foreground text-xs">For over ten years, we’ve been turning everyday humans and exceptionally good pets into historical royalty.</p>
          </motion.div>
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
            {t('preview_start_over')}
          </button>
          <div className="flex items-center gap-2 text-primary text-sm font-semibold italic">
            <Sparkles className="w-4 h-4" />
            ✶ Your Royal Portrait Is Ready
          </div>
        </div>

        {/* Main Grid: Preview on left (or top), Store on right (or bottom) */}
        <div className="grid lg:grid-cols-12 gap-12 items-start">

          {/* Left Side: Preview */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center pb-2"
            >
              <h3 className="font-serif text-2xl font-bold text-foreground">OMG. YOU LOOK INCREDIBLE. 👑</h3>
            </motion.div>

            <div className={`grid gap-4 ${generatedImagesData?.filter(i => i.status === 'Completed').length > 1 ? 'grid-cols-2' : 'grid-cols-1'} overflow-y-auto max-h-[60vh] lg:max-h-[calc(100vh-16rem)] pr-2`}>
              {generatedImagesData && generatedImagesData.length > 0 ? (
                generatedImagesData.filter(img => img.status === 'Completed' && img.image_data_url).map((img, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    className="relative rounded-2xl overflow-hidden bg-card border-4 border-white shadow-xl group"
                  >
                    <img
                      src={img.image_data_url}
                      alt={`Portrait option ${idx + 1}`}
                      className="w-full h-auto select-none"
                      onContextMenu={(e) => e.preventDefault()}
                      draggable={false}
                    />
                    {img.prompt_template && (
                      <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full text-[10px] font-medium text-foreground border border-border shadow-sm pointer-events-none">
                        {img.prompt_template}
                      </div>
                    )}
                    <div className="absolute inset-0 pointer-events-none border border-black/5 rounded-2xl" />
                  </motion.div>
                ))
              ) : (
                previewUrl && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative rounded-2xl overflow-hidden bg-card border-4 border-white shadow-2xl group pointer-events-auto"
                  >
                    <img
                      src={previewUrl}
                      alt="Your portrait"
                      className="w-full h-auto select-none"
                      onContextMenu={(e) => e.preventDefault()}
                      draggable={false}
                    />
                    <div className="absolute inset-0 pointer-events-none border border-black/5 rounded-2xl" />
                  </motion.div>
                )
              )}
            </div>

            <div className="w-full flex flex-col items-center justify-center gap-1 text-xs uppercase tracking-widest text-muted-foreground bg-secondary/30 rounded-2xl py-3 border border-border mt-4 text-center">
              <span>PREVIEW MODE: <span className="text-foreground font-bold">WATERMARKED</span></span>
              <span className="text-[10px]">(PURCHASE TO REMOVE)</span>
            </div>
          </div>

          {/* Right Side: Storefront */}
          <div className="lg:col-span-7 space-y-8">
            {/* Buy Options — at the top */}
            <div className="space-y-6">
              {/* Digital File Option */}
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
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-border/50 pb-4 gap-2 sm:gap-0">
                      <div>
                        <h4 className="font-serif font-bold text-xl sm:text-2xl text-foreground">High-Res Digital Masterpiece</h4>
                        <p className="text-sm font-medium text-muted-foreground mt-1">Ready to download instantly</p>
                      </div>
                      <span className="text-2xl sm:text-3xl font-bold text-foreground">$20</span>
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
                      onClick={() => { setSelectedProduct('digital'); setStep('checkout'); }}
                      className="w-full mt-2 py-4 rounded-lg font-bold text-base transition-all bg-primary text-primary-foreground hover:shadow-xl hover:bg-primary/90"
                    >
                      <span className="flex flex-col sm:flex-row items-center justify-center sm:gap-1">
                        <span>Download My Portrait Bundle</span>
                        <span className="hidden sm:inline">-</span>
                        <span>$20</span>
                      </span>
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
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-border/50 pb-4 gap-2 sm:gap-0">
                      <div>
                        <h4 className="font-serif font-bold text-xl sm:text-2xl text-foreground">Hand-Painted Oil Canvas</h4>
                        <p className="text-sm font-medium text-muted-foreground mt-1">3 Sizes Available</p>
                      </div>
                      <span className="text-2xl sm:text-3xl font-bold text-foreground whitespace-nowrap">From $299</span>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p className="flex items-start gap-2">
                        <Check size={16} className="text-primary mt-0.5 shrink-0" />
                        <span>Stretched on an <strong className="text-foreground">ornate gold frame</strong>.</span>
                      </p>
                      <p className="flex items-start gap-2 bg-secondary/30 p-3 rounded-lg mt-2">
                        <span className="text-xl">🎨</span>
                        <span><strong className="text-foreground">Please note:</strong> It takes approximately <strong className="text-foreground">4 weeks</strong> to meticulously paint, dry, frame, and ship your masterpiece.</span>
                      </p>
                    </div>

                    <button
                      onClick={() => { setSelectedProduct('canvas_royal'); setStep('checkout'); }}
                      className="w-full mt-2 py-4 rounded-lg font-bold text-base transition-all bg-secondary text-secondary-foreground hover:shadow-md hover:bg-secondary/80"
                    >
                      Commission Canvas
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Descriptive content below buy cards */}
            <div className="space-y-4">
              <h3 className="font-serif text-4xl font-bold text-foreground leading-tight">
                {t('preview_store_title_1')}<br />{t('preview_store_title_2')}
              </h3>
              <p className="text-xl text-primary font-medium italic">{t('preview_store_subtitle')}</p>

              <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  You've seen the portrait. Now make it permanent... Commission one of our master artists to bring your digital concept to life. <strong className="text-foreground">100% hand-painted using authentic oil paints on premium canvas</strong>—just like the royals did it.
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

              {/* Insert the visual comparison illustration block here */}
              <IllustrationBlock
                onBuyDigital={() => { setSelectedProduct('digital'); setStep('checkout'); }}
                onBuyCanvas={() => { setSelectedProduct('canvas_royal'); setStep('checkout'); }}
              />
            </div>

            {/* Generate Another (De-emphasized) */}
            <div className="pt-4 border-t border-border">
              <button
                onClick={handleBack}
                className="w-full py-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border border-dashed border-border rounded-xl"
              >
                Not quite right? → Generate a new portrait
              </button>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 border-t border-border">
          {[
            { label: 'Happy Customers', val: '10,000+' },
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