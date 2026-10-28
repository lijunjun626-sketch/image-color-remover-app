import { ArrowRight } from 'lucide-react';

import { tDynamic } from '@/core/i18n/dynamic';
import { Link } from '@/core/i18n/navigation';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { buttonVariants } from '@/components/ui/button';

export function CTA() {
  return (
    <section
      id="how-it-works"
      className="border-t border-zinc-800 bg-zinc-950 px-4 py-24 text-white sm:px-6 sm:py-32"
    >
      <div className="mx-auto max-w-[1480px]">
        <div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr]">
          <h2 className="max-w-xl text-4xl leading-[.98] font-normal tracking-[-.045em] sm:text-6xl">
            {m['landing.cta.headline']()}
          </h2>
          <div>
            <div className="grid gap-0 border-t border-zinc-800">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className="grid grid-cols-[42px_1fr] gap-4 border-b border-zinc-800 py-5"
                >
                  <span className="text-xs text-zinc-500">0{step}</span>
                  <span>{tDynamic(`landing.steps.${step}`)}</span>
                </div>
              ))}
            </div>
            <p className="mt-8 max-w-xl text-zinc-400">
              {m['landing.cta.subheadline']()}
            </p>
            <div className="mt-8">
              <Link
                href="/#templates"
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'h-12 gap-2 rounded-md bg-white px-7 text-black hover:bg-zinc-200'
                )}
              >
                {m['landing.cta.button']()}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
