'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useUploadContext } from '@/lib/uploadContext';
import { Upload, AlertCircle } from 'lucide-react';
import GalleryPreview from '@/components/gallery/GalleryPreview';

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
      className="min-h-screen bg-background py-12 px-4 md:px-8"
    >
      <div className="max-w-2xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 pt-8">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="font-serif text-5xl md:text-6xl font-bold text-foreground italic"
          >
            Become A Timeless
            <br />
            Masterpiece
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-lg text-muted-foreground"
          >
            Free preview · No credit card or registration required
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
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-colors cursor-pointer ${
            isDragActive
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
            <div className="space-y-4">
              <div className="relative inline-block">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-48 rounded-lg"
                />
              </div>
              <p className="text-sm text-muted-foreground">Click to change image</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="bg-card rounded-full p-6 border border-border">
                  <Upload className="w-12 h-12 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-foreground">
                  Upload one or more photos – {style === 'humans' ? 'people and pets' : 'pets'} welcome.
                </p>
                <p className="text-sm text-muted-foreground">
                  Each face clearly visible
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Substyle Helper */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-card rounded-lg p-4 border border-border text-center text-sm text-muted-foreground"
        >
          📝 Selected style: <span className="text-foreground font-semibold capitalize">{style}</span>
          {' '}(toggle in header)
        </motion.div>

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
          className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Generate My Portrait
        </motion.button>

        {/* Trust Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center space-y-2 pt-8 border-t border-border"
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">✨</span>
            <p className="text-lg font-semibold text-foreground">Excellent</p>
            <span className="text-primary">⭐⭐⭐⭐⭐</span>
          </div>
          <p className="text-sm text-muted-foreground">Over 1 million portraits made</p>
        </motion.div>
      </div>

      {/* Gallery Preview */}
      <GalleryPreview />
    </motion.div>
  );
}
