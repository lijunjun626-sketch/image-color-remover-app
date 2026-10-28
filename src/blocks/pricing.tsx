'use client';

import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Download, Music2, RotateCcw, Video } from 'lucide-react';
import { toast } from 'sonner';

import { useSession } from '@/core/auth/client';
import { useRouter } from '@/core/i18n/navigation';
import { apiPost } from '@/lib/api-client';
import { currentPathWithQuery } from '@/lib/redirect';
import { m } from '@/paraglide/messages.js';
import { usePublicConfig } from '@/hooks/use-public-config';
import {
  PaymentProviderModal,
  type PaymentProvider,
} from '@/components/payment-provider-modal';
import {
  PricingTable,
  type PricingGroup,
  type PricingPlan,
} from '@/components/pricing-table';

const ALL_PROVIDERS: PaymentProvider[] = [
  'stripe',
  'creem',
  'waffo',
  'paypal',
  'alipay',
  'wechat',
];

export function Pricing({ title }: { title?: string } = {}) {
  const router = useRouter();
  const { data: session } = useSession();

  const { data: configsData } = usePublicConfig();
  const configs = configsData ?? {};
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<PricingPlan | null>(null);
  const [loadingProvider, setLoadingProvider] =
    useState<PaymentProvider | null>(null);

  const enabledProviders = useMemo<PaymentProvider[]>(
    () => ALL_PROVIDERS.filter((p) => configs[`${p}_enabled`] === 'true'),
    [configs]
  );

  const sharedFeatures = [
    { icon: Video, label: m['landing.pricing.video_length']() },
    { icon: Download, label: m['landing.pricing.preview_download']() },
    { icon: Music2, label: m['landing.pricing.motion_audio']() },
    { icon: RotateCcw, label: m['landing.pricing.failure_return']() },
  ];

  const groups: PricingGroup[] = [
    {
      key: 'video-packs',
      label: m['landing.pricing.video_packs'](),
      plans: [
        {
          id: 'first-video',
          name: m['landing.pricing.first_video'](),
          description: m['landing.pricing.first_video_desc'](),
          price: '$8.90',
          originalPrice: '$9.90',
          features: sharedFeatures,
          buttonText: m['landing.pricing.try_first_video'](),
          productId: 'first_video',
          priceInCents: 890,
          currency: 'usd',
          credits: 40,
          creditsValidDays: 90,
        },
        {
          id: 'one-video',
          name: m['landing.pricing.one_video'](),
          description: m['landing.pricing.one_video_desc'](),
          price: '$9.90',
          features: sharedFeatures,
          productId: 'one_video',
          priceInCents: 990,
          currency: 'usd',
          credits: 40,
          creditsValidDays: 90,
        },
        {
          id: 'two-videos',
          name: m['landing.pricing.two_videos'](),
          description: m['landing.pricing.two_videos_desc'](),
          price: '$18.90',
          features: sharedFeatures,
          productId: 'two_videos',
          priceInCents: 1890,
          currency: 'usd',
          credits: 80,
          creditsValidDays: 90,
        },
        {
          id: 'three-videos',
          name: m['landing.pricing.three_videos'](),
          description: m['landing.pricing.three_videos_desc'](),
          price: '$26.90',
          featured: true,
          badge: m['landing.pricing.best_value'](),
          features: sharedFeatures,
          productId: 'three_videos',
          priceInCents: 2690,
          currency: 'usd',
          credits: 120,
          creditsValidDays: 90,
        },
      ],
    },
  ];

  const checkoutMutation = useMutation({
    mutationFn: ({
      plan,
      provider,
    }: {
      plan: PricingPlan;
      provider: PaymentProvider;
    }) =>
      apiPost<{ checkout_url?: string }>('/api/payment/checkout', {
        product_id: plan.productId,
        product_name: plan.productName || plan.name,
        plan_name: plan.plan?.name || plan.name,
        price: plan.priceInCents,
        currency: plan.currency || 'usd',
        type: plan.plan ? 'subscription' : 'one-time',
        description: plan.name,
        plan: plan.plan,
        credits: plan.credits,
        credits_valid_days: plan.creditsValidDays,
        payment_provider: provider,
        // Land on the order list so the user sees the payment they just made.
        redirect: '/settings/payments',
      }),
    onSuccess: (data) => {
      if (!data?.checkout_url) {
        toast.error('Checkout failed');
        setLoadingProvider(null);
        return;
      }
      window.location.href = data.checkout_url;
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Checkout failed');
      setLoadingProvider(null);
    },
  });

  function startCheckout(plan: PricingPlan, provider: PaymentProvider) {
    setLoadingProvider(provider);
    checkoutMutation.mutate({ plan, provider });
  }

  async function handleCheckout(plan: PricingPlan) {
    if (!session?.user) {
      const callbackUrl = encodeURIComponent(currentPathWithQuery('/pricing'));
      router.push(`/sign-in?callbackUrl=${callbackUrl}`);
      return;
    }

    const selectEnabled = configs.select_payment_enabled === 'true';
    const defaultProvider = (configs.default_payment_provider ||
      enabledProviders[0] ||
      'stripe') as PaymentProvider;

    if (selectEnabled && enabledProviders.length > 1) {
      setPendingPlan(plan);
      setModalOpen(true);
      return;
    }

    await startCheckout(plan, defaultProvider);
  }

  function handleProviderSelect(provider: PaymentProvider) {
    if (!pendingPlan) return;
    startCheckout(pendingPlan, provider);
  }

  return (
    <section
      id="pricing"
      className="dark border-t border-zinc-800 bg-black px-4 py-24 text-white sm:px-6 sm:py-32"
    >
      <div className="mx-auto max-w-[1480px]">
        <div className="mb-16 max-w-3xl">
          <p className="mb-5 text-xs tracking-[.18em] text-zinc-500 uppercase">
            {m['landing.pricing.video_packs']()}
          </p>
          <h2 className="text-4xl leading-none font-normal tracking-[-.04em] sm:text-6xl">
            {title ?? m['landing.pricing.title']()}
          </h2>
          <p className="mt-5 max-w-xl text-zinc-400">
            {m['landing.pricing.description']()}
          </p>
        </div>
        <PricingTable groups={groups} onCheckout={handleCheckout} />
      </div>

      <PaymentProviderModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) {
            setPendingPlan(null);
            setLoadingProvider(null);
          }
        }}
        providers={enabledProviders.length ? enabledProviders : ['stripe']}
        loadingProvider={loadingProvider}
        onSelect={handleProviderSelect}
        planName={pendingPlan?.name}
        price={pendingPlan?.price}
      />
    </section>
  );
}
