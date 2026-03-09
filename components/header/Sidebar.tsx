'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, User, ShoppingBag, Info, Mail } from 'lucide-react';
import Link from 'next/link';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  // Prevent scrolling when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const navItems = [
    { label: 'Home', icon: <Home size={20} />, href: '/' },
    { label: 'Cart', icon: <ShoppingBag size={20} />, href: '/cart' },
    { label: 'About Us', icon: <Info size={20} />, href: '/about' },
    { label: 'Contact', icon: <Mail size={20} />, href: 'mailto:admin@nobilified.com' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[90] backdrop-blur-sm"
          />

          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-[280px] sm:w-[320px] bg-background border-l border-border z-[100] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex flex-col">
                <h2 className="font-serif text-xl font-bold text-foreground leading-none">
                  Nobilified
                </h2>
                <p className="font-serif text-[10px] italic text-primary mt-1">
                  Menu
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center gap-4 px-4 py-3 text-foreground hover:bg-secondary/50 rounded-xl transition-colors group"
                >
                  <div className="text-muted-foreground group-hover:text-primary transition-colors">
                    {item.icon}
                  </div>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border bg-muted/20">
              <p className="text-xs text-center text-muted-foreground">
                © {new Date().getFullYear()} Nobilified. All rights reserved.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
