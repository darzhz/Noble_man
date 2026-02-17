'use client';

import { products, Product } from '@/lib/products';
import ProductCard from './ProductCard';
import { useState } from 'react';
import { Filter } from 'lucide-react';

export default function ProductGrid() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price-low' | 'price-high' | 'rating' | 'newest'>('newest');

  const categories = ['Literature', 'Peace', 'Science', 'Economics'] as const;

  // Filter products
  let filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

  // Sort products
  if (sortBy === 'price-low') {
    filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    filteredProducts = [...filteredProducts].sort((a, b) => b.rating - a.rating);
  }

  return (
    <section id="gallery" className="py-12 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Section Header */}
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Nobel Collection</h2>
          <p className="text-muted-foreground">Curated AI masterpieces celebrating excellence</p>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg border border-border p-6 space-y-6">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Filter size={20} />
            <span>Refine Your Selection</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Filter */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground block">Category</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === null
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === cat
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="space-y-3">
              <label htmlFor="sort" className="text-sm font-medium text-foreground block">
                Sort By
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <p className="text-sm text-muted-foreground">
            Showing {filteredProducts.length} of {products.length} paintings
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
