'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, Download, RotateCcw, Loader2, Lock } from 'lucide-react';

interface ResultData {
    status: string;
    image_data_url?: string;
    is_paid?: boolean; // Hydrated from DB in a full implementation
}

export default function ResultPage() {
    const params = useParams();
    const requestId = params.id as string;
    const [result, setResult] = useState<ResultData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const res = await fetch('/api/face/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ request_id: requestId }),
                });

                if (!res.ok) throw new Error('Failed to fetch result');

                const data = await res.json();
                setResult(data.message);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load result');
            } finally {
                setLoading(false);
            }
        };

        if (requestId) {
            fetchResult();
        }
    }, [requestId]);

    const handleDownload = () => {
        if (!result?.image_data_url) return;

        const link = document.createElement('a');
        link.href = result.image_data_url;
        link.download = `noblified-portrait-${requestId}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
                    <p className="text-muted-foreground">Loading your portrait...</p>
                </div>
            </div>
        );
    }

    if (error || !result) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4">
                <div className="text-center space-y-4 max-w-md">
                    <h1 className="font-serif text-3xl font-bold text-foreground">
                        Something went wrong
                    </h1>
                    <p className="text-muted-foreground">{error || 'Result not found'}</p>
                    <a
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Try Again
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-12 px-4 md:px-8">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Success Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4"
                >
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <Check className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="font-serif text-4xl font-bold text-foreground">
                        Your Portrait is Ready!
                    </h1>
                    <p className="text-muted-foreground font-mono text-sm">
                        Request: {requestId}
                    </p>
                </motion.div>

                {/* Portrait */}
                {result.image_data_url && (
                    <div className="relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="rounded-lg overflow-hidden border-4 border-white shadow-xl bg-card"
                        >
                            <img
                                src={result.image_data_url}
                                alt="Your portrait"
                                className="w-full h-auto"
                            />
                        </motion.div>

                        {!result.is_paid && (
                            <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm border border-border">
                                <Lock className="w-4 h-4 text-primary" />
                                <span className="text-xs font-bold uppercase tracking-wider text-foreground">Watermarked Preview</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Actions */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4"
                >
                    {result.is_paid ? (
                        <button
                            onClick={handleDownload}
                            className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                        >
                            <Download className="w-5 h-5" />
                            Download HD Portrait
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                // In a full implementation, this routes to checkout
                                alert("Redirecting to Shopify checkout...");
                                window.location.href = '/';
                            }}
                            className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                        >
                            <Lock className="w-5 h-5" />
                            Unlock HD Version
                        </button>
                    )}

                    <button
                        onClick={() => {
                            localStorage.removeItem('noblified_request_id');
                            window.location.href = '/';
                        }}
                        className="w-full py-4 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                    >
                        <RotateCcw className="w-5 h-5" />
                        Create Another Portrait
                    </button>
                </motion.div>

                {/* Info */}
                <div className="pt-6 border-t border-border text-center text-sm text-muted-foreground space-y-2">
                    <p>✨ Thank you for choosing Nobilified!</p>
                    <p>
                        Questions?{' '}
                        <a href="mailto:support@noblified.com" className="text-primary hover:underline">
                            support@noblified.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
