/**
 * Shopify Headless Storefront Utilities
 * This file contains helper functions for integrating with Shopify Storefront API
 * Currently structured for mock data, easily swappable with real API calls
 */

// Environment variables (add these to your .env.local when ready to integrate with real Shopify)
// NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
// NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=your-storefront-access-token

const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const SHOPIFY_STOREFRONT_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;

/**
 * Shopify GraphQL Query Interface
 */
export const shopifyFetch = async (query: string, variables?: Record<string, any>) => {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_TOKEN) {
    console.warn('Shopify credentials not configured. Using mock data.');
    return null;
  }

  const url = `https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

/**
 * Sample GraphQL query for products
 * Replace mock data with this when ready to integrate with real Shopify
 */
export const GET_PRODUCTS_QUERY = `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          description
          handle
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 1) {
            edges {
              node {
                url
                altText
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Sample GraphQL query for cart creation
 */
export const CREATE_CART_MUTATION = `
  mutation CreateCart($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
      }
    }
  }
`;

/**
 * Future function to fetch products from Shopify
 * @param limit - Number of products to fetch
 * @returns Array of products from Shopify or mock data
 */
export const fetchShopifyProducts = async (limit: number = 12) => {
  try {
    const response = await shopifyFetch(GET_PRODUCTS_QUERY, { first: limit });
    if (response?.data?.products) {
      return response.data.products.edges.map((edge: any) => ({
        id: edge.node.id,
        title: edge.node.title,
        description: edge.node.description,
        price: parseFloat(edge.node.priceRange.minVariantPrice.amount),
        image: edge.node.images.edges[0]?.node.url || '',
        handle: edge.node.handle,
      }));
    }
  } catch (error) {
    console.error('Error fetching Shopify products:', error);
  }
  return null;
};

/**
 * Future function to create checkout
 * @param lineItems - Items to add to cart
 * @returns Checkout URL for redirecting to Shopify checkout
 */
export const createShopifyCheckout = async (
  lineItems: Array<{ variantId: string; quantity: number }>
) => {
  try {
    const response = await shopifyFetch(CREATE_CART_MUTATION, {
      input: {
        lines: lineItems,
      },
    });
    return response?.data?.cartCreate?.cart?.checkoutUrl;
  } catch (error) {
    console.error('Error creating Shopify checkout:', error);
  }
  return null;
};

/**
 * Type definitions for Shopify API responses
 * Extend these as needed
 */
export interface ShopifyProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  handle: string;
  rating?: number;
  reviews?: number;
}

export interface ShopifyLineItem {
  variantId: string;
  quantity: number;
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  lines: ShopifyLineItem[];
}
