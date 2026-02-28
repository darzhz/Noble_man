'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UploadStep = 'upload' | 'generating' | 'preview' | 'checkout' | 'success';
export type StyleType = 'humans' | 'pets';

export interface PurchaseData {
  email: string;
  fullName: string;
  productType: 'digital' | 'print';
  orderId: string;
}

export interface UploadContextType {
  step: UploadStep;
  uploadedImage: File | null;
  generatedImage: Blob | null;
  watermarkedImage: Blob | null;
  generatedImageUrl: string | null;
  requestId: string | null;
  style: StyleType;
  processing: boolean;
  error: string | null;
  purchaseData: PurchaseData | null;
  prompt: string;

  // Actions
  setStep: (step: UploadStep) => void;
  setUploadedImage: (file: File | null) => void;
  setGeneratedImage: (blob: Blob | null) => void;
  setWatermarkedImage: (blob: Blob | null) => void;
  setGeneratedImageUrl: (url: string | null) => void;
  setRequestId: (id: string | null) => void;
  setStyle: (style: StyleType) => void;
  setProcessing: (processing: boolean) => void;
  setError: (error: string | null) => void;
  setPurchaseData: (data: PurchaseData | null) => void;
  setPrompt: (prompt: string) => void;
  reset: () => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export function UploadProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<UploadStep>('upload');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [generatedImage, setGeneratedImage] = useState<Blob | null>(null);
  const [watermarkedImage, setWatermarkedImage] = useState<Blob | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [style, setStyle] = useState<StyleType>('humans');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [purchaseData, setPurchaseData] = useState<PurchaseData | null>(null);
  const [prompt, setPrompt] = useState<string>('baroque');

  const reset = () => {
    setStep('upload');
    setUploadedImage(null);
    setGeneratedImage(null);
    setWatermarkedImage(null);
    setGeneratedImageUrl(null);
    setRequestId(null);
    setStyle('humans');
    setProcessing(false);
    setError(null);
    setPurchaseData(null);
    setPrompt('baroque');
  };

  const value: UploadContextType = {
    step,
    uploadedImage,
    generatedImage,
    watermarkedImage,
    generatedImageUrl,
    requestId,
    style,
    processing,
    error,
    purchaseData,
    prompt,
    setStep,
    setUploadedImage,
    setGeneratedImage,
    setWatermarkedImage,
    setGeneratedImageUrl,
    setRequestId,
    setStyle,
    setProcessing,
    setError,
    setPurchaseData,
    setPrompt,
    reset,
  };

  return (
    <UploadContext.Provider value={value}>
      {children}
    </UploadContext.Provider>
  );
}

export function useUploadContext() {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error('useUploadContext must be used within UploadProvider');
  }
  return context;
}
