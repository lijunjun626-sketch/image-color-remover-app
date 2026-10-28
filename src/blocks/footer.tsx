import { getRouteApi } from '@tanstack/react-router';

import { openCookieSettings } from '@/lib/cookie-consent';
import { m } from '@/paraglide/messages.js';
import { SiteFooter, type FooterColumn } from '@/components/site-footer';

const rootRoute = getRouteApi('__root__');

export function Footer() {
  const cookieConsentEnabled =
    !!rootRoute.useLoaderData()?.cookieConsentEnabled;
  const columns: FooterColumn[] = [
    {
      title: m['landing.footer.product'](),
      links: [
        { label: 'Clean a photo', href: '/clean' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Account', href: '/settings' },
      ],
    },
    {
      title: m['landing.footer.resources'](),
      links: [
        { label: m['landing.footer.safety'](), href: '/terms-of-service' },
        { label: 'Email support', href: 'mailto:lijunjun626@gmail.com' },
        { label: m['landing.footer.support'](), href: '/settings/tickets' },
        { label: m['landing.footer.account'](), href: '/settings' },
      ],
    },
    {
      title: m['landing.footer.legal'](),
      links: [
        { label: m['landing.footer.privacy'](), href: '/privacy-policy' },
        { label: m['landing.footer.terms'](), href: '/terms-of-service' },
        ...(cookieConsentEnabled
          ? [
              {
                label: m['landing.footer.cookie_settings'](),
                onClick: openCookieSettings,
              },
            ]
          : []),
      ],
    },
  ];

  return (
    <SiteFooter tagline={m['landing.footer.tagline']()} columns={columns} />
  );
}
