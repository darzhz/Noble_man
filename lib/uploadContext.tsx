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
  style: StyleType;
  processing: boolean;
  error: string | null;
  purchaseData: PurchaseData | null;
  
  // Actions
  setStep: (step: UploadStep) => void;
  setUploadedImage: (file: File | null) => void;
  setGeneratedImage: (blob: Blob | null) => void;
  setWatermarkedImage: (blob: Blob | null) => void;
  setStyle: (style: StyleType) => void;
  setProcessing: (processing: boolean) => void;
  setError: (error: string | null) => void;
  setPurchaseData: (data: PurchaseData | null) => void;
  reset: () => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export function UploadProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<UploadStep>('upload');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [generatedImage, setGeneratedImage] = useState<Blob | null>(null);
  const [watermarkedImage, setWatermarkedImage] = useState<Blob | null>(null);
  const [style, setStyle] = useState<StyleType>('humans');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [purchaseData, setPurchaseData] = useState<PurchaseData | null>(null);

  const reset = () => {
    setStep('upload');
    setUploadedImage(null);
    setGeneratedImage(null);
    setWatermarkedImage(null);
    setStyle('humans');
    setProcessing(false);
    setError(null);
    setPurchaseData(null);
  };

  const value: UploadContextType = {
    step,
    uploadedImage,
    generatedImage,
    watermarkedImage,
    style,
    processing,
    error,
    purchaseData,
    setStep,
    setUploadedImage,
    setGeneratedImage,
    setWatermarkedImage,
    setStyle,
    setProcessing,
    setError,
    setPurchaseData,
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
