'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useUploadContext } from '@/lib/uploadContext';
import { Check, Download, RotateCcw } from 'lucide-react';

export default function SuccessStep() {
  const { purchaseData, reset } = useUploadContext();

  const handleNewPortrait = () => {
    reset();
  };

  if (!purchaseData) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background flex items-center justify-center px-4 py-12"
    >
      <div className="max-w-2xl w-full space-y-8 text-center">
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-12 h-12 text-primary" />
          </div>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
            Your Masterpiece is Ready!
          </h1>
          <p className="text-lg text-muted-foreground">
            Check your email for your unwatermarked portrait
          </p>
        </motion.div>

        {/* Order Details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-lg border border-border p-6 space-y-4"
        >
          <div className="space-y-2 text-left">
            <p className="text-sm text-muted-foreground">Order ID</p>
            <p className="font-mono text-lg font-semibold text-foreground break-all">
              {purchaseData.orderId}
            </p>
          </div>
          <div className="border-t border-border pt-4 space-y-2 text-left">
            <p className="text-sm text-muted-foreground">Sent to</p>
            <p className="font-medium text-foreground">{purchaseData.email}</p>
          </div>
        </motion.div>

        {/* Info Items */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid gap-4 md:grid-cols-2"
        >
          <div className="bg-background rounded-lg border border-border p-4 space-y-2">
            <Download className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="font-semibold text-foreground text-sm">Download Now</p>
            <p className="text-xs text-muted-foreground">
              Check your downloads folder for the unwatermarked image
            </p>
          </div>
          <div className="bg-background rounded-lg border border-border p-4 space-y-2">
            <RotateCcw className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="font-semibold text-foreground text-sm">Create More</p>
            <p className="text-xs text-muted-foreground">
              Generate more portraits or explore our framed print options
            </p>
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4 pt-4"
        >
          <button
            onClick={handleNewPortrait}
            className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Create Another Portrait
          </button>
          <p className="text-sm text-muted-foreground">
            ✨ Thank you for supporting Nobilified!
          </p>
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="pt-8 border-t border-border space-y-4 text-center text-sm text-muted-foreground"
        >
          <div>
            <p className="font-semibold text-foreground mb-2">Questions?</p>
            <p>
              Contact us at{' '}
              <a href="mailto:support@noblified.com" className="text-primary hover:underline">
                support@noblified.com
              </a>
            </p>
          </div>
          <div>
            <p>Follow us on social media for featured customer portraits and tips</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
