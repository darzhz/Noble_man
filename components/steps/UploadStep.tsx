'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUploadContext } from '@/lib/uploadContext';
import { Upload, AlertCircle, X, ImagePlus } from 'lucide-react';
import CredibilitySection from '@/components/credibility/CredibilitySection';

const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 10;

export default function UploadStep() {
  const { setUploadedImages, setStep, setError, error, style } = useUploadContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragActive, setIsDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const processFiles = (newFiles: File[]) => {
    setError(null);

    // Combine with existing files
    const combinedFiles = [...files, ...newFiles];

    // Enforce max count
    if (combinedFiles.length > MAX_FILES) {
      setError(`You can only upload up to ${MAX_FILES} images at once.`);
      combinedFiles.splice(MAX_FILES);
    }

    const validFiles: File[] = [];

    // Validate each file
    for (const file of combinedFiles) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError('Please upload only JPG, PNG, or WebP images.');
        return;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setError(`All images must be smaller than ${MAX_FILE_SIZE_MB}MB.`);
        return;
      }
      validFiles.push(file);
    }

    setFiles(validFiles);
    setUploadedImages(validFiles);

    // Generate object URLs for previews
    const newPreviews = validFiles.map(f => URL.createObjectURL(f));

    // Cleanup old object URLs
    previews.forEach(p => URL.revokeObjectURL(p));
    setPreviews(newPreviews);
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    const newPreviews = [...previews];

    URL.revokeObjectURL(newPreviews[index]);

    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);

    setFiles(newFiles);
    setPreviews(newPreviews);
    setUploadedImages(newFiles);

    if (newFiles.length === 0) {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = () => {
    if (files.length === 0) {
      setError('Please select at least one image first');
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
          className={`relative border-2 border-dashed rounded-xl md:rounded-2xl p-4 md:p-8 text-center transition-colors ${isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50'
            }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {previews.length > 0 ? (
            <div className="space-y-4 md:space-y-6">
              <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                <AnimatePresence>
                  {previews.map((preview, idx) => (
                    <motion.div
                      key={preview}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative group w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden border border-border shadow-sm"
                    >
                      <img
                        src={preview}
                        alt={`Preview ${idx + 1}`}
                        className="object-cover w-full h-full"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(idx);
                        }}
                        className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  ))}
                  /store/hooleefakstore/settings
                  {previews.length < MAX_FILES && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-24 h-24 md:w-32 md:h-32 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors bg-muted/30"
                    >
                      <ImagePlus size={24} className="mb-2" />
                      <span className="text-xs font-medium">Add Photo</span>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">
                {previews.length} of {MAX_FILES} photos selected
              </p>
            </div>
          ) : (
            <div
              className="space-y-2 md:space-y-4 py-4 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex justify-center">
                <div className="bg-card rounded-full p-2 md:p-4 border border-border">
                  <Upload className="w-5 h-5 md:w-8 md:h-8 text-primary" />
                </div>
              </div>
              <div className="space-y-1 md:space-y-2 px-2 md:px-0">
                <p className="text-sm md:text-base font-semibold text-foreground">
                  Upload 1 to {MAX_FILES} photos below. (Peasants, nobility, and pets welcome.)
                </p>
                <p className="text-xs text-muted-foreground">
                  Ensure faces are clearly visible. We'll pick the best one.
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/30 rounded-lg p-4 mt-4">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          onClick={handleSubmit}
          disabled={files.length === 0}
          className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-bold text-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          {files.length > 0 ? `Reveal My Masterpiece (${files.length})` : 'Reveal My Masterpiece'}
        </motion.button>
        {/* Subject Type Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="space-y-6"
        >
          <AnimatePresence mode="wait">
            {style === 'pets' && (
              <motion.div
                key="pet-gallery"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-3 gap-2 md:gap-4 max-w-lg mx-auto pb-4">
                  <div className="aspect-[4/5] rounded-xl overflow-hidden shadow-sm border border-border">
                    <img src="/pet1.png" alt="Dog" className="w-full h-full object-cover" />
                  </div>
                  <div className="aspect-[4/5] rounded-xl overflow-hidden shadow-sm border border-border">
                    <img src="/pet2.png" alt="Cat" className="w-full h-full object-cover" />
                  </div>
                  <div className="aspect-[4/5] rounded-xl overflow-hidden shadow-sm border border-border">
                    <img src="/pet3.png" alt="Dog 2" className="w-full h-full object-cover" />
                  </div>
                </div>
              </motion.div>
            )}
            {style === 'humans' && (
              // <motion.div
              //   key="human-gallery"
              //   initial={{ opacity: 0, height: 0 }}
              //   animate={{ opacity: 1, height: 'auto' }}
              //   exit={{ opacity: 0, height: 0 }}
              //   className="overflow-hidden"
              // >
              //   <div className="grid grid-cols-3 gap-2 md:gap-4 max-w-lg mx-auto pb-4">
              //     <div className="aspect-[4/5] rounded-xl overflow-hidden shadow-sm border border-border">
              //       <img src="/human1.png" alt="Human" className="w-full h-full object-cover" />
              //     </div>
              //     <div className="aspect-[4/5] rounded-xl overflow-hidden shadow-sm border border-border">
              //       <img src="/human2.png" alt="Human 2" className="w-full h-full object-cover" />
              //     </div>
              //     <div className="aspect-[4/5] rounded-xl overflow-hidden shadow-sm border border-border">
              //       <img src="/human3.png" alt="Human 3" className="w-full h-full object-cover" />
              //     </div>
              //   </div>
              // </motion.div>

              <motion.div
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.2, delayChildren: 0.1 }
                  }
                }}
                className="flex flex-row justify-center gap-4 sm:gap-8 md:gap-12 pt-10 pb-12"
              >
                {[
                  { step: "I", title: "The Selection", sub: "Upload Photo", img: "/upload.jpeg" },
                  { step: "II", title: "The Vision", sub: "Digital Preview", img: "/preview.jpeg" },
                  { step: "III", title: "The Creation", sub: "Hand Painted", img: "/painted.jpeg" }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    variants={{
                      hidden: { opacity: 0, y: 30 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
                    }}
                    className="flex flex-col items-center text-center group flex-1 max-w-[110px] sm:max-w-[160px] md:max-w-[280px]"
                  >
                    {/* The Frame: Architectural & Sharp */}
                    <div className="relative mb-8 transition-transform duration-700 group-hover:-translate-y-2 rounded-md">
                      {/* Layered Accent Border (The "Matting") */}
                      <div className="absolute -inset-2 border border-accent/30 scale-95 group-hover:scale-100 transition-transform duration-700 opacity-0 group-hover:opacity-100" />

                      <div className=" rounded-md relative w-24 h-32 sm:w-40 sm:h-52 md:w-64 md:h-80 bg-muted overflow-hidden border border-border shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                        <img
                          src={item.img}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                        />

                        {/* Elegant Vignette Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-20 transition-opacity duration-700" />

                        {/* Roman Numeral Label */}
                        <div className="absolute bottom-0 right-0 bg-primary px-3 py-1 md:px-5 md:py-2 text-primary-foreground font-serif text-[10px] md:text-sm tracking-[0.3em]">
                          {item.step}
                        </div>
                      </div>
                    </div>

                    {/* Typography: Noble Serif Hierarchy */}
                    <div className="space-y-2 px-2">
                      <h4 className="uppercase tracking-[0.25em] text-[7px] md:text-[10px] text-accent font-medium">
                        Phase {item.step}
                      </h4>
                      <h3 className="font-serif text-sm sm:text-xl md:text-3xl text-foreground font-light leading-none">
                        {item.title}
                      </h3>
                      <div className="h-px w-6 bg-border mx-auto my-3 group-hover:w-16 transition-all duration-700" />
                      <p className="text-[9px] md:text-[11px] text-muted-foreground uppercase tracking-[0.15em] font-sans">
                        {item.sub}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>


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

      <CredibilitySection />
    </motion.div>
  );
}
