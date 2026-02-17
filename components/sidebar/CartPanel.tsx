'use client';

import { useCartStore } from '@/lib/store';
import { Trash2, Plus, Minus } from 'lucide-react';

interface CartPanelProps {
  onClose: () => void;
}

export default function CartPanel({ onClose }: CartPanelProps) {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-sidebar-foreground/60">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {items.map((item) => (
          <div key={item.productId} className="flex gap-2 items-start bg-sidebar-accent/5 p-2 rounded">
            <img src={item.image} alt={item.title} className="w-12 h-12 rounded object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{item.title}</p>
              <p className="text-xs text-sidebar-foreground/60">${item.price.toFixed(2)}</p>
              <div className="flex items-center gap-1 mt-1">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="p-1 hover:bg-sidebar-accent/10 rounded"
                >
                  <Minus size={14} />
                </button>
                <span className="text-xs w-6 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="p-1 hover:bg-sidebar-accent/10 rounded"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
            <button
              onClick={() => removeItem(item.productId)}
              className="p-1 hover:bg-red-500/10 text-red-600 rounded"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="border-t border-sidebar-border pt-3 space-y-2">
        <div className="flex justify-between text-sm font-medium">
          <span>Total:</span>
          <span className="text-sidebar-primary">${getTotalPrice().toFixed(2)}</span>
        </div>
        <button className="w-full bg-sidebar-primary text-sidebar-primary-foreground py-2 rounded font-medium text-sm hover:bg-sidebar-primary/90 transition-colors">
          Checkout
        </button>
      </div>
    </div>
  );
}
