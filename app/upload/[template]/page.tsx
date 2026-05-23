'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useUploadContext } from '@/lib/uploadContext';
import { slugify } from '@/lib/slug';
import Header from '@/components/header/Header';
import UploadStep from '@/components/steps/UploadStep';
import PreviewStep from '@/components/steps/PreviewStep';
import CheckoutModal from '@/components/checkout/CheckoutModal';
import SuccessStep from '@/components/steps/SuccessStep';

interface TemplateInfo {
  templateName: string;
  templateImage: string;
}

export default function UploadRoute() {
  const params = useParams();
  const router = useRouter();
  const slug = params.template as string;
  const { step, setPromptTemplate } = useUploadContext();
  const [template, setTemplate] = useState<TemplateInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function resolve() {
      try {
        const res = await fetch('/api/face/templates', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const list: Array<{ template_name: string; template_image: string }> =
          data?.message?.templates ?? [];
        const match = list.find((t) => slugify(t.template_name) === slug);
        if (cancelled) return;
        if (!match) {
          router.replace('/');
          return;
        }
        setTemplate({
          templateName: match.template_name,
          templateImage: match.template_image,
        });
        setPromptTemplate(match.template_name);
      } catch {
        if (!cancelled) router.replace('/');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    resolve();
    return () => {
      cancelled = true;
    };
  }, [slug, router, setPromptTemplate]);

  if (loading || !template) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
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
        <UploadStep previewImage={template.templateImage} />
      )}
    </motion.main>
  );
}
