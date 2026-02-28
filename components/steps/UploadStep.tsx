'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useUploadContext } from '@/lib/uploadContext';
import { Upload, AlertCircle, InfoIcon } from 'lucide-react';
import CredibilitySection from '@/components/credibility/CredibilitySection';
import PromptCarousel from '@/components/steps/PromptCarousel';

export default function UploadStep() {
  const { setUploadedImage, setStep, setError, error, style } = useUploadContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (file: File) => {
    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please upload a JPG, PNG, or WebP image');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be smaller than 10MB');
      return;
    }

    setError(null);
    setUploadedImage(file);

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!preview) {
      setError('Please select an image first');
      return;
    }
    setStep('generating');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background py-4 md:py-12 px-4 md:px-8"
    >
      <div className="max-w-2xl mx-auto space-y-4 md:space-y-12">
        <PromptCarousel />

        {/* Hero Section */}
        <div className="text-center space-y-2 pt-2 md:pt-8">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="font-serif text-4xl md:text-6xl font-bold text-foreground italic"
          >
            Claim Your Rightful
            <br />
            Place in History.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-sm md:text-lg text-muted-foreground"
          >
            See yourself as a timeless masterpiece. Free preview · No credit card required.
          </motion.p>
        </div>

        {/* Upload Zone */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl md:rounded-2xl p-4 md:p-12 text-center transition-colors cursor-pointer ${isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50'
            }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />

          {preview ? (
            <div className="space-y-2 md:space-y-4">
              <div className="relative inline-block">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-32 md:max-h-48 rounded-lg"
                />
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">Click to change image</p>
            </div>
          ) : (
            <div className="space-y-2 md:space-y-4">
              <div className="flex justify-center">
                <div className="bg-card rounded-full p-2 md:p-4 border border-border">
                  <Upload className="w-5 h-5 md:w-8 md:h-8 text-primary" />
                </div>
              </div>
              <div className="space-y-1 md:space-y-2 px-2 md:px-0">
                <p className="text-sm md:text-base font-semibold text-foreground">
                  Upload your photos below. (Peasants, nobility, and pets are all welcome.)
                </p>
                <p className="text-xs text-muted-foreground">
                  Ensure faces are clearly visible for the best results.
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Substyle Helper */}
        {/* <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-card rounded-lg p-4 border border-border text-center text-sm text-primary font-medium italic flex items-center justify-center"
        >
          <InfoIcon className='mr-2' /> Subject: <span className="capitalize font-bold">{style}</span>
          {' '}(Toggle in header to switch to {style === 'humans' ? 'Pets' : 'Humans'})
        </motion.div> */}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 bg-destructive/10 border border-destructive/30 rounded-lg p-4"
          >
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          onClick={handleSubmit}
          disabled={!preview}
          className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-bold text-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
        >
          Reveal My Masterpiece
        </motion.button>

        {/* Trust Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center space-y-2 pt-6 md:pt-8 border-t border-border"
        >
          <div className="flex items-center justify-center gap-2">
            <p className="text-lg font-semibold text-foreground">Excellent</p>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4 fill-primary" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>
            <span className="text-muted-foreground text-sm">TrustCaptain</span>
          </div>
          <p className="text-sm text-muted-foreground">Over 1 million portraits made</p>
        </motion.div>
      </div>

      {/* Gallery/Credibility Preview */}
      <CredibilitySection />
    </motion.div>
  );
}
