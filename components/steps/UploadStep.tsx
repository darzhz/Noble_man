'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUploadContext } from '@/lib/uploadContext';
import { Upload, AlertCircle, X, ImagePlus, Settings2, Loader2, Mail } from 'lucide-react';
import CredibilitySection from '@/components/credibility/CredibilitySection';
import StyleDrawer from './StyleDrawer';
import { useTranslation } from 'react-i18next';

const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 10;

const GALLERY_CONTENT: Record<string, { step: string; title: string; sub: string; img: string }[]> = {
  'Pet Portraits': [
    { step: "I", title: "The Selection", sub: "Upload Photo", img: "/pet_cat.jpeg" },
    { step: "II", title: "The Creation", sub: "Hand Painted", img: "/pet_dog.jpeg" }
  ],
  'Family Portraits': [
    { step: "I", title: "The Selection", sub: "Upload Photo", img: "/family1.jpeg" },
    { step: "II", title: "The Creation", sub: "Hand Painted", img: "/family3.jpeg" }
  ],
  "Children's Portraits": [
    { step: "I", title: "The Selection", sub: "Upload Photo", img: "/chilldren.jpeg" },
    { step: "II", title: "The Creation", sub: "Hand Painted", img: "/children3.jpeg" }
  ],
  'Couple Portraits': [
    { step: "I", title: "The Selection", sub: "Upload Photo", img: "/couple1.jpeg" },
    { step: "II", title: "The Creation", sub: "Hand Painted", img: "/couple3.jpeg" }
  ],
  'Self-Portraits': [
    { step: "I", title: "The Selection", sub: "Upload Photo", img: "/human_asian_girl.jpeg" },
    { step: "II", title: "The Creation", sub: "Hand Painted", img: "/human_child_and_cat.jpeg" }
  ]
};

export default function UploadStep() {
  const { setUploadedImages, setStep, setError, error, style, customerEmail, setCustomerEmail } = useUploadContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const [isDragActive, setIsDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEmailPromptOpen, setIsEmailPromptOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  const processFiles = (newFiles: File[]) => {
    setError(null);

    // Combine with existing files
    const combinedFiles = [...files, ...newFiles];

    // Enforce max count
    if (combinedFiles.length > MAX_FILES) {
      setError(t('upload_max_error', { max: MAX_FILES }) as string);
      combinedFiles.splice(MAX_FILES);
    }

    const validFiles: File[] = [];

    // Validate each file
    for (const file of combinedFiles) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError(t('upload_type_error') as string);
        return;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setError(t('upload_size_error', { max: MAX_FILE_SIZE_MB }) as string);
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

  const [isCheckingLimit, setIsCheckingLimit] = useState(false);

  const handleSubmit = async () => {
    if (files.length === 0) {
      setError(t('upload_select_error') as string);
      return;
    }

    try {
      setIsCheckingLimit(true);
      setError(null);
      const res = await fetch('/api/face/rate-limit', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || (t('upload_rate_limit_check_error') as string));
      }

      const limitStatus = data.message;
      if (limitStatus && !limitStatus.can_generate) {
        if (limitStatus.errors && limitStatus.errors.length > 0) {
          // Display the first blocking error message
          setError(limitStatus.errors[0].message);
        } else {
          setError(t('upload_rate_limit_reached') as string);
        }
        return;
      }

      if (limitStatus && limitStatus.daily_used >= 1 && !customerEmail) {
        setIsEmailPromptOpen(true);
        return;
      }

      setStep('generating');
    } catch (err) {
      console.error('Rate limit check failed:', err);
      // Fallback: continue to generating if rate limit check itself fails, 
      // the backend process route will also enforce it.
      setStep('generating');
    } finally {
      setIsCheckingLimit(false);
    }
  };

  const handleEmailSubmit = () => {
    if (!emailInput || !emailInput.includes('@')) {
      return;
    }
    setCustomerEmail(emailInput);
    setIsEmailPromptOpen(false);
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
            {t('hero_title_1')}
            <br />
            {t('hero_title_2')}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-sm md:text-lg text-muted-foreground"
          >
            {t('hero_subtitle')}
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
                      <span className="text-xs font-medium">{t('upload_add_photo')}</span>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">
                {t('upload_selected_text', { current: previews.length, max: MAX_FILES })}
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
                  {t('upload_prompt_title', { max: MAX_FILES })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('upload_prompt_subtitle')}
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

        {/* Email Prompt Overlay */}
        <AnimatePresence>
          {isEmailPromptOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-card w-full max-w-md p-6 rounded-2xl shadow-xl border border-border space-y-4"
              >
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-primary/10 rounded-full">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold font-serif text-foreground">{t('email_prompt_title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('email_prompt_desc')}
                  </p>
                </div>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()}
                  placeholder={t('email_prompt_placeholder') as string}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsEmailPromptOpen(false)}
                    className="flex-1 py-3 px-4 rounded-lg font-medium border border-border text-foreground hover:bg-muted transition-colors"
                  >
                    {t('email_prompt_cancel')}
                  </button>
                  <button
                    onClick={handleEmailSubmit}
                    disabled={!emailInput || !emailInput.includes('@')}
                    className="flex-1 py-3 px-4 rounded-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {t('email_prompt_continue')}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          onClick={handleSubmit}
          disabled={files.length === 0 || isCheckingLimit}
          className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-bold text-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          {isCheckingLimit ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('upload_btn_checking')}
            </>
          ) : files.length > 0 ? (
            t('upload_btn_reveal_count', { count: files.length }) as string
          ) : (
            t('upload_btn_reveal') as string
          )}
        </motion.button>
        {/* <button
          onClick={() => setIsDrawerOpen(true)}
          className="opacity-10 hover:opacity-100 transition-opacity"
          aria-label="Style Settings"
        >
          <Settings2 size={12} className="text-muted-foreground" />
        </button> */}
        {/* Subject Type Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="space-y-6"
          onClick={() => setIsDrawerOpen(true)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={style || 'default'}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.2, delayChildren: 0.1 }
                }
              }}
              className="flex flex-row justify-center gap-4 sm:gap-8 md:gap-12 pt-10 pb-12"
            >
              {(GALLERY_CONTENT[style] || GALLERY_CONTENT['Self-Portraits']).map((item, index) => (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
                  }}
                  className="flex flex-col items-center text-center group flex-1 max-w-[140px] sm:max-w-[200px] md:max-w-[340px]"
                >
                  {/* The Frame: Architectural & Sharp */}
                  <div className="relative transition-transform duration-700 group-hover:-translate-y-2 rounded-md">
                    {/* Layered Accent Border (The "Matting") */}
                    <div className="absolute -inset-2 border border-accent/30 scale-95 group-hover:scale-100 transition-transform duration-700 opacity-0 group-hover:opacity-100" />

                    <div className="rounded-md relative w-36 h-48 sm:w-52 sm:h-72 md:w-80 md:h-[26rem] bg-muted overflow-hidden border border-border shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                      <img
                        src={item.img}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                      />

                      {/* Elegant Vignette Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-20 transition-opacity duration-700" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </motion.div>


        {/* Trust Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center space-y-2 p-6 md:p-8 border-t border-border relative"
        >
          <div className="flex items-center justify-center gap-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4 fill-primary" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>
            <p className="text-sm font-semibold text-foreground">{t('trust_rating')}</p>
          </div>
        </motion.div>
      </div>

      <StyleDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      <CredibilitySection />
    </motion.div>
  );
}
