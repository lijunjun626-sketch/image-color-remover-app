import { TaxCategory, verifyWebhook, WaffoPancake } from '@waffo/pancake-ts';

import {
  PaymentEventType,
  PaymentStatus,
  WebhookIgnoredError,
  type CheckoutSession,
  type PaymentConfigs,
  type PaymentEvent,
  type PaymentOrder,
  type PaymentProvider,
  type PaymentSession,
} from './types';

/** Configuration for the Waffo Pancake Merchant of Record provider. */
export interface WaffoConfigs extends PaymentConfigs {
  merchantId: string;
  privateKey: string;
  environment: 'test' | 'prod';
  storeId?: string;
}

function minorUnits(currency: string): number {
  // The current catalog charges USD. Keep this explicit rather than silently
  // treating every currency as having two decimals.
  return ['JPY', 'KRW', 'VND'].includes(currency.toUpperCase()) ? 0 : 2;
}

function toDisplayAmount(amount: number, currency: string): string {
  const decimals = minorUnits(currency);
  return (amount / 10 ** decimals).toFixed(decimals);
}

function fromDisplayAmount(amount: string, currency: string): number {
  const decimals = minorUnits(currency);
  const parsed = Number(amount);
  if (!Number.isFinite(parsed)) return 0;
  return Math.round(parsed * 10 ** decimals);
}

/**
 * Waffo Pancake provider.
 *
 * Waffo webhooks, not the browser return URL, are authoritative for granting
 * credits. The return URL is intentionally treated as a pending status until a
 * signed `order.completed` webhook arrives.
 */
export class WaffoProvider implements PaymentProvider {
  readonly name = 'waffo';
  configs: WaffoConfigs;
  private client: WaffoPancake;

  constructor(configs: WaffoConfigs) {
    this.configs = configs;
    this.client = new WaffoPancake({
      merchantId: configs.merchantId,
      // The admin form stores PEM line breaks as literal `\\n` so a private
      // key can safely be entered in a single password field.
      privateKey: configs.privateKey.replace(/\\\\n/g, '\n'),
    });
  }

  async createPayment({
    order,
  }: {
    order: PaymentOrder;
  }): Promise<CheckoutSession> {
    if (!order.productId) throw new Error('Waffo productId is required');
    if (!order.price) throw new Error('price is required');
    if (!order.orderNo) throw new Error('orderNo is required');

    const currency = order.price.currency.toUpperCase();
    const checkout = await this.client.checkout.authenticated.create(
      {
        productId: order.productId,
        currency,
        buyerIdentity:
          order.customer?.id || order.customer?.email || order.orderNo,
        buyerEmail: order.customer?.email,
        successUrl: order.successUrl,
        expiresInSeconds: 3600,
        priceSnapshot: {
          amount: toDisplayAmount(order.price.amount, currency),
          taxCategory: TaxCategory.SaaS,
        },
        metadata: {
          internal_order_no: order.orderNo,
        },
        orderMerchantExternalId: order.orderNo,
      },
      { idempotencyKey: order.orderNo }
    );

    return {
      provider: this.name,
      checkoutParams: { productId: order.productId, orderNo: order.orderNo },
      checkoutInfo: {
        sessionId: checkout.sessionId,
        checkoutUrl: checkout.checkoutUrl,
      },
      checkoutResult: checkout,
      metadata: { orderNo: order.orderNo },
    };
  }

  async getPaymentSession({
    sessionId,
  }: {
    sessionId: string;
  }): Promise<PaymentSession> {
    // Waffo intentionally uses a signed webhook as the authoritative payment
    // signal. A browser return URL is not proof of payment.
    return {
      provider: this.name,
      paymentStatus: PaymentStatus.PROCESSING,
      paymentResult: { id: sessionId },
    };
  }

  async getPaymentEvent({ req }: { req: Request }): Promise<PaymentEvent> {
    const rawBody = await req.text();
    const signature = req.headers.get('x-waffo-signature');
    if (!rawBody || !signature)
      throw new Error('Invalid Waffo webhook request');

    const event = verifyWebhook(rawBody, signature, {
      environment: this.configs.environment,
    });
    if (this.configs.storeId && event.storeId !== this.configs.storeId) {
      throw new Error(
        'Waffo webhook store does not match the configured store'
      );
    }
    if (event.mode !== this.configs.environment) {
      throw new Error('Waffo webhook environment does not match configuration');
    }
    if (event.eventType !== 'order.completed') {
      throw new WebhookIgnoredError(
        `No handler for Waffo event: ${event.eventType}`
      );
    }

    const data = event.data;
    const orderNo = data.orderMerchantExternalId;
    if (!orderNo) {
      throw new Error('Waffo payment is missing the internal order reference');
    }

    return {
      eventType: PaymentEventType.CHECKOUT_SUCCESS,
      eventResult: event,
      paymentSession: {
        provider: this.name,
        paymentStatus: PaymentStatus.SUCCESS,
        paymentInfo: {
          transactionId: data.paymentId || event.eventId,
          paymentAmount: fromDisplayAmount(
            data.chargedAmount || data.amount,
            data.currency
          ),
          paymentCurrency: data.currency.toLowerCase(),
          paymentEmail: data.buyerEmail,
          paidAt: new Date(event.timestamp),
        },
        // Keep the signed external order reference alongside the Waffo order
        // ID. The service resolves this to its local order before granting.
        paymentResult: {
          id: data.orderId,
          orderMerchantExternalId: orderNo,
          eventId: event.id,
          eventType: event.eventType,
        },
        metadata: data.orderMetadata,
      },
    };
  }
}
