'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UploadProvider, useUploadContext } from '@/lib/uploadContext';
import Header from '@/components/header/Header';
import UploadStep from '@/components/steps/UploadStep';
import PreviewStep from '@/components/steps/PreviewStep';
import CheckoutModal from '@/components/checkout/CheckoutModal';
import SuccessStep from '@/components/steps/SuccessStep';

function AppContent() {
  const { step } = useUploadContext();
  const router = useRouter();

  // On landing, check if there's a pending requestId from a previous checkout
  useEffect(() => {
    const pendingRequestId = localStorage.getItem('noblified_request_id');
    if (pendingRequestId) {
      router.replace(`/result/${pendingRequestId}`);
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-background">
      <Header />
      {step === 'upload' && <UploadStep />}
      {(step === 'generating' || step === 'preview') && <PreviewStep />}
      {step === 'checkout' && <CheckoutModal />}
      {step === 'success' && <SuccessStep />}
    </main>
  );
}

export default function Home() {
  return (
    <UploadProvider>
      <AppContent />
    </UploadProvider>
  );
}

