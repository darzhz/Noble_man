import React from 'react';
import Header from '@/components/header/Header';
import { UploadProvider } from '@/lib/uploadContext';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <UploadProvider>
        <Header />
      </UploadProvider>
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-16">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-8 text-center">
          About Us
        </h1>
        <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground space-y-6">
          <p>
            Welcome to Nobilified, where history meets the modern age. We specialize in transforming your everyday photos into stunning, hand-painted masterpieces that echo the grandeur of classical oil paintings.
          </p>
          <p>
            Our dedicated team of artists combining cutting-edge technology with traditional artistry to seamlessly place you, your loved ones, or even your pets into iconic historical portraits. Whether you want to see yourself as a Renaissance noble or a majestic monarch, we bring your vision to life.
          </p>
          <p>
            We believe everyone deserves a rightful place in history. No crowns required—just a photo and a touch of imagination.
          </p>
          <div className="pt-8 border-t border-border mt-12 text-center">
            <p className="font-semibold text-foreground">Have questions?</p>
            <p>
              Drop us a line at <a href="mailto:admin@nobilified.com" className="text-primary hover:underline">admin@nobilified.com</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
