import { Camera, Film, ShieldCheck, type LucideIcon } from 'lucide-react';

import { tDynamic } from '@/core/i18n/dynamic';
import { m } from '@/paraglide/messages.js';

export function Features() {
  const features: { key: string; icon: LucideIcon }[] = [
    { key: 'auth', icon: Camera },
    { key: 'payment', icon: Film },
    { key: 'rbac', icon: ShieldCheck },
  ];

  return (
    <section
      id="features"
      className="bg-black px-4 py-24 text-white sm:px-6 sm:py-32"
    >
      <div className="mx-auto max-w-[1480px]">
        <div className="mb-16 max-w-3xl">
          <p className="mb-5 text-xs tracking-[.18em] text-zinc-500 uppercase">
            {m['landing.features.eyebrow']()}
          </p>
          <h2 className="text-4xl leading-none font-normal tracking-[-.04em] sm:text-6xl">
            {m['landing.features.title']()}
          </h2>
          <p className="mt-5 max-w-xl text-zinc-400">
            {m['landing.features.description']()}
          </p>
        </div>
        <div className="grid border-t border-zinc-800 md:grid-cols-3">
          {features.map(({ key, icon: Icon }) => (
            <div
              key={key}
              className="border-b border-zinc-800 py-8 md:border-r md:border-b-0 md:px-8 md:first:pl-0 md:last:border-r-0"
            >
              <Icon className="mb-12 size-6 text-zinc-400" strokeWidth={1.5} />
              <div className="space-y-2">
                <h3 className="text-xl font-normal">
                  {tDynamic(`landing.features.${key}.title`)}
                </h3>
                <p className="max-w-sm text-sm leading-relaxed text-zinc-500">
                  {tDynamic(`landing.features.${key}.description`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
