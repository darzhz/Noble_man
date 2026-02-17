'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUploadContext } from '@/lib/uploadContext';
import { addWatermark, blobToDataUrl } from '@/lib/watermark';
import { ChevronLeft, Loader2 } from 'lucide-react';

export default function PreviewStep() {
  const { setStep, uploadedImage, setGeneratedImage, generatedImage, setWatermarkedImage, watermarkedImage, setError, setProcessing, processing } = useUploadContext();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isApplyingWatermark, setIsApplyingWatermark] = useState(false);

  // Generate portrait (call your AI API here)
  useEffect(() => {
    const generatePortrait = async () => {
      if (!uploadedImage || generatedImage) return;

      try {
        setProcessing(true);
        setError(null);

        // TODO: Replace this with your actual AI API call
        // For now, we'll simulate the generation process
        console.log('[v0] Starting portrait generation...');

        // Simulate generation delay (15-25 seconds would be real)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock: convert uploaded image to generated image
        // In real implementation, this would be the AI-generated result
        const generatedBlob = uploadedImage;
        setGeneratedImage(generatedBlob);

        // Apply watermark
        console.log('[v0] Applying watermark...');
        const watermarked = await addWatermark(generatedBlob);
        setWatermarkedImage(watermarked);

        // Get preview URL
        const url = await blobToDataUrl(watermarked);
        setPreviewUrl(url);

        setProcessing(false);
      } catch (err) {
        console.error('[v0] Generation error:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate portrait');
        setProcessing(false);
      }
    };

    generatePortrait();
  }, [uploadedImage, generatedImage, setGeneratedImage, setWatermarkedImage, setProcessing, setError]);

  const handleBack = () => {
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
              This may take 15-25 seconds...
            </p>
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
                <span className="text-lg">🎨</span>
                <span>
                  Free preview · <span className="text-foreground font-semibold">Watermarked</span>
                </span>
              </div>
            </>
          )}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="space-y-4"
        >
          <button
            onClick={handlePurchase}
            className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Download Unwatermarked
          </button>
          <button
            onClick={handleBack}
            className="w-full py-4 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition-colors"
          >
            Generate Another
          </button>
        </motion.div>

        {/* Trust & Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="grid grid-cols-2 gap-4 pt-8 border-t border-border"
        >
          <div className="text-center space-y-2">
            <p className="text-2xl font-bold text-primary">1M+</p>
            <p className="text-sm text-muted-foreground">Portraits Created</p>
          </div>
          <div className="text-center space-y-2">
            <p className="text-2xl font-bold text-primary">4.8★</p>
            <p className="text-sm text-muted-foreground">Trustpilot Rating</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
