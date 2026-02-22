'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useUploadContext } from '@/lib/uploadContext';
import { addWatermark, blobToDataUrl } from '@/lib/watermark';
import { ChevronLeft, Loader2, Download, Printer, Frame, Check } from 'lucide-react';

const POLL_INTERVAL_MS = 5000;
const MAX_POLL_ATTEMPTS = 60; // 5 minutes max

export default function PreviewStep() {
  const {
    setStep,
    uploadedImage,
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
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollCountRef = useRef(0);
  const isSubmittedRef = useRef(false);

  const products = [
    {
      id: 'digital',
      name: 'Instant Masterpiece',
      price: 29,
      originalPrice: 49,
      icon: Download,
      description: 'Instant high-resolution download – perfect for sharing or saving',
      benefits: [
        'No Watermark',
        'Instant Download',
        'High-Resolution Format',
      ],
      buttonLabel: 'Download Now',
    },
    {
      id: 'print',
      name: 'Fine Art Print',
      price: 89,
      originalPrice: 129,
      icon: Printer,
      description: 'Printed on museum-quality archival paper with fade-resistant inks.',
      benefits: [
        'Museum-quality archival paper',
        'Fade-resistant inks',
        'Made to last decades',
      ],
      buttonLabel: 'Order Print',
    },
    {
      id: 'canvas',
      name: 'Large Canvas',
      price: 299,
      originalPrice: 399,
      icon: Frame,
      description: 'Gallery-quality canvas on a 1.25″ thick frame – arrives ready to hang.',
      benefits: [
        'Ready to hang',
        'Cotton-blend canvas, 1.25" thick',
        'Mounting included',
      ],
      buttonLabel: 'Order Canvas',
      highlighted: true,
    },
  ];

  // Convert File to base64 data URL
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Poll for face swap status
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

      if (!res.ok) {
        throw new Error(`Status check failed: ${res.statusText}`);
      }

      const data = await res.json();
      const status = data.message?.status;

      if (status === 'Completed') {
        const imageDataUrl = data.message.image_data_url;
        setGeneratedImageUrl(imageDataUrl);
        setStatusMessage('Applying watermark...');

        // Fetch the image as a blob for watermarking
        const imgResponse = await fetch(imageDataUrl);
        const imgBlob = await imgResponse.blob();
        setGeneratedImage(imgBlob);

        // Apply watermark for preview
        const watermarked = await addWatermark(imgBlob);
        setWatermarkedImage(watermarked);

        const wmUrl = await blobToDataUrl(watermarked);
        setPreviewUrl(wmUrl);
        setProcessing(false);
        setStep('preview');
        return;
      } else if (status === 'Failed') {
        setError(data.message?.error || 'Portrait generation failed. Please try again.');
        setProcessing(false);
        return;
      }

      // Update status message
      if (status === 'Processing') {
        setStatusMessage('AI is painting your portrait...');
      } else if (status === 'Queued') {
        setStatusMessage('Waiting in queue...');
      }

      // Schedule next poll
      pollTimerRef.current = setTimeout(() => pollStatus(reqId), POLL_INTERVAL_MS);
    } catch (err) {
      console.error('[PreviewStep] Poll error:', err);
      setError(err instanceof Error ? err.message : 'Failed to check status');
      setProcessing(false);
    }
  }, [setError, setProcessing, setGeneratedImage, setGeneratedImageUrl, setWatermarkedImage, setStep]);

  // Submit image for face swap
  useEffect(() => {
    const submitImage = async () => {
      if (!uploadedImage || isSubmittedRef.current) return;
      isSubmittedRef.current = true;

      try {
        setProcessing(true);
        setError(null);

        // Convert to base64
        const base64 = await fileToBase64(uploadedImage);

        // Generate a session user ID
        const userId = `session-${Date.now()}-${Math.random().toString(36).substring(7)}`;

        // Submit to face swap API
        const res = await fetch('/api/face/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64,
            user_id: userId,
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to submit image');
        }

        const data = await res.json();
        const reqId = data.message?.request_id;

        if (!reqId) {
          throw new Error('No request_id returned from API');
        }

        setRequestId(reqId);
        setStatusMessage('Waiting in queue...');

        // Start polling
        pollCountRef.current = 0;
        pollTimerRef.current = setTimeout(() => pollStatus(reqId), POLL_INTERVAL_MS);
      } catch (err) {
        console.error('[PreviewStep] Submit error:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate portrait');
        setProcessing(false);
      }
    };

    submitImage();

    return () => {
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
      }
    };
  }, [uploadedImage, setProcessing, setError, setRequestId, pollStatus]);

  // If we already have a generated image (e.g., navigating back), show preview directly
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
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
    }
    localStorage.removeItem('noblified_request_id');
    setPreviewUrl(null);
    setRequestId(null);
    isSubmittedRef.current = false;
    setStep('upload');
  };

  const handlePurchase = () => {
    setStep('checkout');
  };

  if (processing && !previewUrl) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-background flex items-center justify-center"
      >
        <div className="text-center space-y-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="flex justify-center"
          >
            <Loader2 className="w-16 h-16 text-primary" />
          </motion.div>
          <div className="space-y-2">
            <h2 className="font-serif text-3xl font-bold text-foreground">
              Creating Your Masterpiece
            </h2>
            <p className="text-muted-foreground">
              {statusMessage}
            </p>
            {requestId && (
              <p className="text-xs text-muted-foreground/60 font-mono mt-4">
                Request: {requestId}
              </p>
            )}
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
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          onClick={handleBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Adjust
        </motion.button>

        {/* Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-4"
        >
          {previewUrl && (
            <>
              <div className="relative rounded-lg overflow-hidden bg-card border border-border">
                <img
                  src={previewUrl}
                  alt="Your portrait"
                  className="w-full h-auto"
                />
              </div>

              {/* Free Preview Badge */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-card rounded-lg py-3 border border-border">
                <span>
                  Free preview · <span className="text-foreground font-semibold">Watermarked</span>
                </span>
              </div>
            </>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="space-y-3"
        >
          <button
            onClick={handlePurchase}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Download Unwatermarked
          </button>
          <button
            onClick={handleBack}
            className="w-full py-3 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition-colors"
          >
            Generate Another
          </button>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="py-8 border-t border-border"
        />

        {/* Product Options Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="space-y-8"
        >
          {/* Section Title */}
          <div className="text-center">
            <h3 className="font-serif text-2xl font-bold text-foreground">
              Or Choose Your Format
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              Order a professionally printed or canvas version
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`border rounded-lg p-6 transition-all text-center ${product.highlighted
                  ? 'border-primary bg-primary/5 md:scale-105'
                  : 'border-border hover:border-primary/50'
                  }`}
              >
                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <product.icon size={32} className="text-primary" />
                </div>

                {/* Title */}
                <h4 className="font-serif text-lg font-bold text-foreground mb-2">
                  {product.name}
                </h4>

                {/* Pricing */}
                <div className="mb-3">
                  <span className="text-2xl font-bold text-foreground">
                    ${product.price}
                  </span>
                  <span className="text-xs line-through text-muted-foreground ml-2">
                    ${product.originalPrice}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-muted-foreground mb-4 min-h-[40px]">
                  {product.description}
                </p>

                {/* Benefits */}
                <div className="space-y-1.5 mb-4">
                  {product.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center justify-center gap-2 text-xs text-foreground">
                      <Check size={14} className="text-primary flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => setStep('checkout')}
                  className="w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {product.buttonLabel}
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust & Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="grid grid-cols-2 gap-4 pt-12 border-t border-border"
        >
          <div className="text-center space-y-2">
            <p className="text-2xl font-bold text-primary">1M+</p>
            <p className="text-sm text-muted-foreground">Portraits Created</p>
          </div>
          <div className="text-center space-y-2">
            <p className="text-2xl font-bold text-primary">4.8★</p>
            <p className="text-sm text-muted-foreground">TrustCaptain Rating</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}