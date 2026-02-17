'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Home, Compass, Info, Mail, DollarSign, LogIn, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/lib/store';
import CartPanel from './CartPanel';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const cartTotal = useCartItems();

  function useCartItems() {
    const store = useCartStore();
    return store.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  const menuItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Compass, label: 'Browse', href: '/products' },
    { icon: Info, label: 'About', href: '#about' },
    { icon: Mail, label: 'Contact', href: '#contact' },
    { icon: DollarSign, label: 'Pricing', href: '#pricing' },
  ];

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 left-6 z-50 p-2 text-foreground hover:bg-secondary/20 rounded-lg transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.nav
        initial={{ x: -288 }}
        animate={{ x: isOpen ? 0 : -288 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed left-0 top-0 h-full w-72 bg-sidebar text-sidebar-foreground z-40 overflow-y-auto lg:translate-x-0 lg:w-64 lg:relative lg:transform-none`}
      >
        {/* Logo */}
        <div className="p-8 border-b border-sidebar-border">
          <h1 className="text-3xl font-bold text-sidebar-primary">Noblified</h1>
          <p className="text-xs text-sidebar-foreground/60 mt-1">AI Nobel Paintings</p>
        </div>

        {/* Navigation */}
        <div className="py-8 px-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/10 hover:text-sidebar-accent transition-colors group"
                >
                  <Icon size={20} className="group-hover:text-sidebar-primary transition-colors" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4 border-t border-sidebar-border" />

        {/* Cart & Account */}
        <div className="py-8 px-4 space-y-3">
          <button
            onClick={() => setShowCart(!showCart)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 transition-colors font-medium"
          >
            <span>🛒</span>
            <span className="text-sm">Cart ({cartTotal})</span>
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/10 hover:text-sidebar-accent transition-colors">
            <Heart size={20} />
            <span className="text-sm font-medium">Wishlist</span>
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/10 hover:text-sidebar-accent transition-colors">
            <LogIn size={20} />
            <span className="text-sm font-medium">Sign In</span>
          </button>
        </div>

        {/* Cart Panel */}
        {showCart && (
          <div className="px-4 pb-8 border-t border-sidebar-border pt-4">
            <CartPanel onClose={() => setShowCart(false)} />
          </div>
        )}
      </motion.nav>

      {/* Spacer for sidebar on desktop */}
      <div className="hidden lg:block lg:w-64" />
    </>
  );
}
