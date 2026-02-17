'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useUploadContext } from '@/lib/uploadContext';
import { downloadBlob } from '@/lib/watermark';
import { AlertCircle, Check, Loader2, ChevronLeft } from 'lucide-react';

export default function CheckoutModal() {
  const { generatedImage, setStep, setPurchaseData, setError, error } = useUploadContext();
  const [formData, setFormData] = useState({ email: '', fullName: '' });
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.email) {
      setError('Email is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email');
      return false;
    }
    if (!formData.fullName) {
      setError('Full name is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setProcessing(true);
      setError(null);

      // Simulate payment processing (2 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create mock order
      const orderId = `NOBL-${Date.now()}`;

      // Download unwatermarked image
      if (generatedImage) {
        downloadBlob(generatedImage, `noblified-portrait-${orderId}.png`);
      }

      // Store purchase data
      setPurchaseData({
        email: formData.email,
        fullName: formData.fullName,
        productType: 'digital',
        orderId,
      });

      setCompleted(true);

      // Transition to success after a moment
      setTimeout(() => {
        setStep('success');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment processing failed');
      setProcessing(false);
    }
  };

  const handleBack = () => {
    setStep('preview');
  };

  if (completed) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-background flex items-center justify-center px-4"
      >
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <Check className="w-16 h-16 text-primary mx-auto" />
          </motion.div>
          <h2 className="font-serif text-3xl font-bold text-foreground">Payment Successful!</h2>
          <p className="text-muted-foreground">Your unwatermarked portrait is downloading...</p>
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
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          onClick={handleBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </motion.button>

        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-card rounded-lg border border-border p-8 space-y-6"
        >
          <h2 className="font-serif text-3xl font-bold text-foreground">Complete Your Purchase</h2>

          {/* Product Summary */}
          <div className="bg-background rounded-lg p-4 border border-border space-y-2">
            <p className="text-sm text-muted-foreground">Product</p>
            <p className="font-semibold text-foreground">Digital Download (Unwatermarked)</p>
            <p className="text-2xl font-bold text-primary pt-2">$29.99</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

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

            {/* Payment Method Info */}
            <div className="bg-background rounded-lg p-4 border border-border text-sm text-muted-foreground space-y-2">
              <p className="font-semibold text-foreground text-sm">Mock Payment</p>
              <p>This is a demo checkout. In production, this would integrate with Stripe/Shopify.</p>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={processing}
              className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                'Complete Purchase'
              )}
            </motion.button>
          </form>

          {/* Trust & Info */}
          <div className="pt-6 border-t border-border space-y-2 text-center text-sm text-muted-foreground">
            <p>🔒 Your data is secure and encrypted</p>
            <p>💌 Confirmation email will be sent to your inbox</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
