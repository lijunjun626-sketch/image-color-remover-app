import { m } from '@/paraglide/messages.js';
import { SiteHeader } from '@/components/site-header';

export function Header() {
  const navLinks = [
    { href: '/#templates', label: m['landing.nav.create']() },
    { href: '/#templates', label: m['landing.nav.templates']() },
    { href: '/#how-it-works', label: m['landing.nav.how_it_works']() },
    { href: '/#features', label: m['landing.nav.features']() },
    { href: '/pricing', label: m['landing.nav.pricing']() },
  ];

  return <SiteHeader navLinks={navLinks} />;
}
