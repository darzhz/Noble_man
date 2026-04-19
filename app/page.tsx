'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { UploadProvider, useUploadContext } from '@/lib/uploadContext';
import Header from '@/components/header/Header';
import UploadStep from '@/components/steps/UploadStep';
import PreviewStep from '@/components/steps/PreviewStep';
import CheckoutModal from '@/components/checkout/CheckoutModal';
import SuccessStep from '@/components/steps/SuccessStep';
import SplashScreen from '@/components/ui/SplashScreen';
import { preloadLoadingImages } from '@/lib/loadingImages';

function AppContent() {
  const { step, setStep, setRequestId, setProcessing, setSelectedProduct } = useUploadContext();
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    preloadLoadingImages();
  }, []);

  // On landing, check if there's a pending requestId from a previous checkout
  useEffect(() => {
    const pendingRequestId = localStorage.getItem('noblified_request_id');
    const restoreRequestId = localStorage.getItem('noblified_restore_req');
    const restoreUrl = localStorage.getItem('noblified_restore_url');
    const autoCheckout = localStorage.getItem('noblified_auto_checkout');

    if (restoreRequestId) {
      // Cart restore flow: trigger PreviewStep to poll and download the generation
      localStorage.removeItem('noblified_restore_req');
      localStorage.removeItem('noblified_restore_url');
      setRequestId(restoreRequestId);

      if (restoreUrl) {
        // Pass via localStorage or assume PreviewStep can pick it up?
        // Actually, let's let PreviewStep pick it up! We don't have setPreviewUrl here.
        // Let's store it back temporarily so PreviewStep can grab it
        localStorage.setItem('noblified_restore_url_tmp', restoreUrl);
      }

      if (autoCheckout) {
        localStorage.removeItem('noblified_auto_checkout');
        setSelectedProduct(autoCheckout as any);
        setStep('checkout');
      } else {
        setStep('generating');
      }
    } else if (pendingRequestId) {
      // Existing flow: hard redirect to result page
      router.replace(`/result/${pendingRequestId}`);
    }
  }, [router, setRequestId, setStep]);

  if (!mounted) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <AnimatePresence mode="wait">
      {showSplash ? (
        <SplashScreen key="splash" onComplete={() => setShowSplash(false)} />
      ) : (
        <motion.main
          key="main"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen bg-background"
        >
          <Header />
          {step === 'upload' && <UploadStep />}
          {(step === 'generating' || step === 'preview') && <PreviewStep />}
          {step === 'checkout' && <CheckoutModal />}
          {step === 'success' && <SuccessStep />}
        </motion.main>
      )}
    </AnimatePresence>
  );
}

export default function Home() {
  return (
    <UploadProvider>
      <AppContent />
    </UploadProvider>
  );
}

