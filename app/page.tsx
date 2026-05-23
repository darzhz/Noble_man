'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useUploadContext } from '@/lib/uploadContext';
import Header from '@/components/header/Header';
import StylePickerStep from '@/components/steps/StylePickerStep';
import PreviewStep from '@/components/steps/PreviewStep';
import CheckoutModal from '@/components/checkout/CheckoutModal';
import SuccessStep from '@/components/steps/SuccessStep';
import SplashScreen from '@/components/ui/SplashScreen';
import { preloadLoadingImages } from '@/lib/loadingImages';

export default function Home() {
  const { step, setStep, setRequestId, setSelectedProduct } = useUploadContext();
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
      localStorage.removeItem('noblified_restore_req');
      localStorage.removeItem('noblified_restore_url');
      setRequestId(restoreRequestId);

      if (restoreUrl) {
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
      router.replace(`/result/${pendingRequestId}`);
    }
  }, [router, setRequestId, setStep, setSelectedProduct]);

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
          {(step === 'generating' || step === 'preview') ? (
            <PreviewStep />
          ) : step === 'checkout' ? (
            <CheckoutModal />
          ) : step === 'success' ? (
            <SuccessStep />
          ) : (
            <StylePickerStep />
          )}
        </motion.main>
      )}
    </AnimatePresence>
  );
}
