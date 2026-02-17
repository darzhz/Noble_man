'use client';

import { Product } from '@/lib/products';
import { useCartStore } from '@/lib/store';
import { Star, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    setIsAdding(true);
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
    });
    setTimeout(() => setIsAdding(false), 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5 }}
      className="group bg-card rounded-lg overflow-hidden border border-border hover:border-primary transition-colors duration-300"
    >
      {/* Image Container */}
      <div className="relative h-72 overflow-hidden bg-secondary">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

        {/* Category Badge */}
        <div className="absolute top-3 right-3 px-3 py-1 bg-primary/90 text-primary-foreground text-xs font-semibold rounded-full">
          {product.category}
        </div>

        {/* Add to Cart Button - appears on hover */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-3 left-3 right-3 bg-primary text-primary-foreground py-2 rounded-lg font-semibold flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0"
          disabled={isAdding}
        >
          <ShoppingCart size={18} />
          {isAdding ? 'Added!' : 'Add to Cart'}
        </button>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Title */}
        <h3 className="font-bold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {product.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>

        {/* Artist */}
        <p className="text-xs text-muted-foreground font-medium">by {product.artist}</p>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i < Math.floor(product.rating) ? 'fill-primary text-primary' : 'text-muted-foreground'}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {product.rating} ({product.reviews})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline justify-between pt-2 border-t border-border">
          <span className="text-2xl font-bold text-foreground">${product.price.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground">Limited Edition</span>
        </div>
      </div>
    </motion.div>
  );
}
