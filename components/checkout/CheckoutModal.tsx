'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useUploadContext, type SelectedProductType } from '@/lib/uploadContext';
import { AlertCircle, Check, Loader2, ChevronLeft, Download, Lock, Heart, Frame } from 'lucide-react';


export default function CheckoutModal() {
  const { setStep, setError, error, requestId, selectedProduct, setSelectedProduct } = useUploadContext();
  const [formData, setFormData] = useState({ email: '', fullName: '' });
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);

  const products: {
    id: SelectedProductType;
    label: string;
    sublabel: string;
    price: number;
    icon: React.ElementType;
    badge?: string;
  }[] = [
      {
        id: 'canvas_classic',
        label: 'Classic Canvas',
        sublabel: '16x20in - Standard premium size',
        price: 299,
        icon: Frame,
      },
      {
        id: 'canvas_royal',
        label: 'Royal Canvas',
        sublabel: '20x24in - A bold statement piece',
        price: 370,
        icon: Frame,
        badge: 'POPULAR',
      },
      {
        id: 'canvas_grand',
        label: 'Grand Canvas',
        sublabel: '30x40in - Large gallery-style centerpiece',
        price: 590,
        icon: Frame,
      },
      {
        id: 'digital',
        label: 'HD Digital Download',
        sublabel: 'Full resolution, no watermark — instant delivery',
        price: 20,
        icon: Download,
      },
    ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
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

      const res = await fetch('/api/shopify/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType: selectedProduct,
          requestId,
          email: formData.email,
          fullName: formData.fullName,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create checkout');
      }

      const data = await res.json();
      const { checkoutUrl } = data;

      if (!checkoutUrl) {
        throw new Error('No checkout URL returned');
      }

      setCompleted(true);

      // Persist requestId so we can redirect back after payment
      if (requestId) {
        localStorage.setItem('noblified_request_id', requestId);
      }

      // Brief success flash before redirect
      setTimeout(() => {
        window.location.href =
          checkoutUrl +
          `&return_url=${encodeURIComponent(
            `https://yourdomain.com/result/${requestId}?checkout=complete`
          )}`;
      }, 1000);
    } catch (err) {
      console.error('[Checkout] Error:', err);
      setError(err instanceof Error ? err.message : 'Checkout failed. Please try again.');
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
          <h2 className="font-serif text-3xl font-bold text-foreground">Redirecting to Checkout...</h2>
          <p className="text-muted-foreground">You'll be taken to our secure payment page.</p>
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
          Back to Preview
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="text-center space-y-2"
        >
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
            Your Masterpiece Awaits.
          </h2>
          <p className="text-muted-foreground">
            Choose your size and format. We'll handle the rest.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-6"
        >
          {/* Product Selection */}
          <div className="space-y-4">
            {products.map(product => {
              const Icon = product.icon;
              const isSelected = selectedProduct === product.id;
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => setSelectedProduct(product.id)}
                  className={`w-full text-left bg-card rounded-lg border-2 p-5 transition-all relative ${isSelected
                    ? 'border-primary'
                    : 'border-border hover:border-primary/40'
                    }`}
                >
                  {product.badge && (
                    <span className="absolute -top-3 left-5 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                      {product.badge}
                    </span>
                  )}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-3">
                      <Icon
                        size={22}
                        className={isSelected ? 'text-primary' : 'text-muted-foreground'}
                      />
                      <div>
                        <p className="font-semibold text-foreground">{product.label}</p>
                        <p className="text-sm text-muted-foreground">{product.sublabel}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                      <p className={`text-xl font-bold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                        ${product.price}
                      </p>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'border-primary bg-primary' : 'border-border'
                          }`}
                      >
                        {isSelected && <Check size={12} className="text-primary-foreground" />}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Contact Details */}
          <div className="bg-card rounded-lg border border-border p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Your Details</h3>

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
              <p className="text-xs text-muted-foreground">
                Your download link arrives instantly by email. Check your spam folder if you don't see it within a minute.
              </p>
            </div>
          </div>

          {/* Error */}
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

          {/* Submit */}
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
                Creating Checkout...
              </>
            ) : (
              `→ Claim My Portrait - $${products.find(p => p.id === selectedProduct)?.price}`
            )}
          </motion.button>
        </motion.form>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="pt-6 border-t border-border space-y-2 text-center text-sm text-muted-foreground"
        >
          <p><Lock className="w-4 h-4 flex-shrink-0 inline" /> Secure checkout powered by Shopify</p>
          <p><Heart className="w-4 h-4 flex-shrink-0 inline" /> Digital download emailed instantly after purchase</p>

        </motion.div>
      </div>
    </motion.div>
  );
}