/**
 * Authoritative pricing catalog.
 *
 * The checkout API uses this as the SOURCE OF TRUTH for price/credits/duration.
 * Any price, credits, or plan info sent by the client is IGNORED — only the
 * product_id is honored, and everything else is looked up here.
 *
 * To change pricing, edit this file and redeploy. Admin UI cannot alter prices.
 */

import { PaymentInterval, PaymentType } from '@/core/payment/types';

export type PricingPlanInfo = {
  name: string;
  interval: PaymentInterval;
  intervalCount: number;
};

export type PricingProduct = {
  productId: string;
  productName: string;
  planName: string;
  description: string;
  type: PaymentType;
  priceInCents: number;
  currency: string;
  /**
   * Price in fen for CNY-only providers (Alipay, WeChat Pay) when `currency`
   * isn't CNY. Without it those providers refuse the product — the amount is
   * never reused across currencies.
   */
  cnyPriceInCents?: number;
  credits: number;
  creditsValidDays?: number;
  plan?: PricingPlanInfo;
};

/**
 * Default demo catalog. Replace with your real products when launching.
 * Keys MUST match what the pricing UI sends as product_id.
 */
export const pricingCatalog: Record<string, PricingProduct> = {
  first_video: {
    productId: 'first_video',
    productName: 'First Video',
    planName: 'First Video',
    description: 'New customer offer: 1 video generation',
    type: PaymentType.ONE_TIME,
    priceInCents: 890,
    currency: 'usd',
    cnyPriceInCents: 6400,
    credits: 40,
    creditsValidDays: 90,
  },
  one_video: {
    productId: 'one_video',
    productName: '1 Video',
    planName: '1 Video',
    description: '1 video generation',
    type: PaymentType.ONE_TIME,
    priceInCents: 990,
    currency: 'usd',
    cnyPriceInCents: 7100,
    credits: 40,
    creditsValidDays: 90,
  },
  two_videos: {
    productId: 'two_videos',
    productName: '2 Videos',
    planName: '2 Videos',
    description: '2 video generations',
    type: PaymentType.ONE_TIME,
    priceInCents: 1890,
    currency: 'usd',
    cnyPriceInCents: 13600,
    credits: 80,
    creditsValidDays: 90,
  },
  three_videos: {
    productId: 'three_videos',
    productName: '3 Videos',
    planName: '3 Videos',
    description: '3 video generations',
    type: PaymentType.ONE_TIME,
    priceInCents: 2690,
    currency: 'usd',
    cnyPriceInCents: 19400,
    credits: 120,
    creditsValidDays: 90,
  },
};

export function getPricingProduct(productId: string): PricingProduct | null {
  if (!productId) return null;
  return pricingCatalog[productId] ?? null;
}

export function listPricingProducts(): PricingProduct[] {
  return Object.values(pricingCatalog);
}
