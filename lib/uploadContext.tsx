'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FaceSwapImageResult } from './faceswap';

export type UploadStep = 'upload' | 'generating' | 'preview' | 'checkout' | 'success';
export type StyleType = 'Pet Portraits' | 'Family Portraits' | 'Children\'s Portraits' | 'Couple Portraits' | 'Self-Portraits';

export interface PurchaseData {
  email: string;
  fullName: string;
  productType: 'digital' | 'print';
  orderId: string;
}

export type SelectedProductType = 'digital' | 'canvas_classic' | 'canvas_royal' | 'canvas_grand';

export interface UploadContextType {
  step: UploadStep;
  /** Single file kept for backward-compat (first item of uploadedImages) */
  uploadedImage: File | null;
  /** All selected images (1–5) */
  uploadedImages: File[];
  generatedImage: Blob | null;
  watermarkedImage: Blob | null;
  generatedImageUrl: string | null;
  /** Array of all generated images metadata/results */
  generatedImagesData: FaceSwapImageResult[];
  requestId: string | null;
  style: StyleType;
  processing: boolean;
  error: string | null;
  purchaseData: PurchaseData | null;
  prompt: string;
  /** Name of a Prompt Template on the backend (empty string = use backend default) */
  promptTemplate: string;
  /** The product the user selected in PreviewStep */
  selectedProduct: SelectedProductType;
  customerEmail: string;

  // Actions
  setStep: (step: UploadStep) => void;
  setUploadedImage: (file: File | null) => void;
  setUploadedImages: (files: File[]) => void;
  setGeneratedImage: (blob: Blob | null) => void;
  setWatermarkedImage: (blob: Blob | null) => void;
  setGeneratedImageUrl: (url: string | null) => void;
  setGeneratedImagesData: (images: FaceSwapImageResult[]) => void;
  setRequestId: (id: string | null) => void;
  setStyle: (style: StyleType) => void;
  setProcessing: (processing: boolean) => void;
  setError: (error: string | null) => void;
  setPurchaseData: (data: PurchaseData | null) => void;
  setPrompt: (prompt: string) => void;
  setPromptTemplate: (template: string) => void;
  setSelectedProduct: (product: SelectedProductType) => void;
  setCustomerEmail: (email: string) => void;
  reset: () => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export function UploadProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<UploadStep>('upload');
  const [uploadedImages, setUploadedImagesState] = useState<File[]>([]);
  const [generatedImage, setGeneratedImage] = useState<Blob | null>(null);
  const [watermarkedImage, setWatermarkedImage] = useState<Blob | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedImagesData, setGeneratedImagesData] = useState<FaceSwapImageResult[]>([]);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [style, setStyle] = useState<StyleType>('Self-Portraits');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [purchaseData, setPurchaseData] = useState<PurchaseData | null>(null);
  const [prompt, setPrompt] = useState<string>('baroque');
  const [promptTemplate, setPromptTemplate] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<SelectedProductType>('digital');
  const [customerEmail, setCustomerEmailState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('nobilified_customer_email') || '';
    }
    return '';
  });

  const setCustomerEmail = (email: string) => {
    setCustomerEmailState(email);
    if (typeof window !== 'undefined') {
      if (email) {
        localStorage.setItem('nobilified_customer_email', email);
      }
    }
  };

  /** Set an array of uploaded images; also keeps uploadedImage in sync */
  const setUploadedImages = (files: File[]) => {
    setUploadedImagesState(files);
  };

  /** Legacy single-image setter — wraps into the array */
  const setUploadedImage = (file: File | null) => {
    setUploadedImagesState(file ? [file] : []);
  };

  const reset = () => {
    setStep('upload');
    setUploadedImagesState([]);
    setGeneratedImage(null);
    setWatermarkedImage(null);
    setGeneratedImageUrl(null);
    setGeneratedImagesData([]);
    setRequestId(null);
    setStyle('Self-Portraits');
    setProcessing(false);
    setError(null);
    setPurchaseData(null);
    setPrompt('baroque');
    setPromptTemplate('');
    setSelectedProduct('digital');
    // customerEmail intentionally NOT cleared — persisted across sessions via localStorage
  };

  const value: UploadContextType = {
    step,
    uploadedImage: uploadedImages[0] ?? null,
    uploadedImages,
    generatedImage,
    watermarkedImage,
    generatedImageUrl,
    generatedImagesData,
    requestId,
    style,
    processing,
    error,
    purchaseData,
    prompt,
    promptTemplate,
    selectedProduct,
    customerEmail,
    setStep,
    setUploadedImage,
    setUploadedImages,
    setGeneratedImage,
    setWatermarkedImage,
    setGeneratedImageUrl,
    setGeneratedImagesData,
    setRequestId,
    setStyle,
    setProcessing,
    setError,
    setPurchaseData,
    setPrompt,
    setPromptTemplate,
    setSelectedProduct,
    setCustomerEmail,
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
