import { createFileRoute } from '@tanstack/react-router';
import { Check, ShieldCheck, Sparkles } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { m } from '@/paraglide/messages.js';
import { Button } from '@/components/ui/button';

function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-2xl border border-stone-700 bg-stone-950 p-6">
      <Check className="mb-6 size-5 text-lime-300" />
      <h2 className="text-lg font-medium">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-stone-400">
        {description}
      </p>
    </article>
  );
}

function HomePage() {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          {envConfigs.app_name}
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/sign-in" className="text-stone-300 hover:text-white">
            {m['person.nav.sign_in']()}
          </Link>
          <Button
            asChild
            size="sm"
            className="bg-lime-300 text-stone-950 hover:bg-lime-200"
          >
            <Link href="/clean">{m['person.nav.start']()}</Link>
          </Button>
        </nav>
      </header>
      <main>
        <section className="mx-auto grid max-w-6xl gap-10 px-5 pt-18 pb-24 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:items-end lg:pt-28">
          <div>
            <p className="mb-5 flex items-center gap-2 text-xs font-semibold tracking-[.18em] text-lime-300 uppercase">
              <Sparkles className="size-3.5" /> {m['person.hero.eyebrow']()}
            </p>
            <h1 className="max-w-3xl text-5xl leading-[.91] font-medium tracking-[-.065em] sm:text-7xl">
              {m['person.hero.title']()}
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-stone-300">
              {m['person.hero.description']()}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="bg-lime-300 text-stone-950 hover:bg-lime-200"
              >
                <Link href="/clean">{m['person.hero.cta']()}</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-stone-700 bg-transparent text-white hover:bg-stone-900 hover:text-white"
              >
                <Link href="/sign-in">{m['person.hero.account_cta']()}</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-stone-500">
              {m['person.hero.note']()}
            </p>
          </div>
          <div className="rounded-3xl border border-stone-700 bg-stone-900 p-5 shadow-2xl shadow-black/30">
            <div className="aspect-[4/3] rounded-2xl bg-[radial-gradient(circle_at_30%_25%,#d9ffb8,transparent_25%),radial-gradient(circle_at_78%_68%,#f9ba9e,transparent_32%),linear-gradient(135deg,#5e7462,#1d2820_60%,#161817)] p-5">
              <div className="flex h-full items-end rounded-xl border border-white/25 bg-black/20 p-4 text-xs text-white/90 backdrop-blur-sm">
                <span>{m['person.hero.preview']()}</span>
              </div>
            </div>
          </div>
        </section>
        <section className="border-y border-stone-800 bg-stone-900/50">
          <div className="mx-auto grid max-w-6xl gap-5 px-5 py-14 sm:grid-cols-3 sm:px-8">
            <Feature
              title={m['person.feature.selection']()}
              description={m['person.feature.selection_description']()}
            />
            <Feature
              title={m['person.feature.credits']()}
              description={m['person.feature.credits_description']()}
            />
            <Feature
              title={m['person.feature.original']()}
              description={m['person.feature.original_description']()}
            />
          </div>
        </section>
        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-lime-300">
              {m['person.safe.eyebrow']()}
            </p>
            <h2 className="mt-3 text-4xl tracking-[-.05em]">
              {m['person.safe.title']()}
            </h2>
            <p className="mt-5 text-stone-400">
              {m['person.safe.description']()}
            </p>
            <div className="mt-7 flex items-start gap-3 rounded-2xl border border-stone-700 p-5 text-sm text-stone-300">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-lime-300" />
              {m['person.safe.details']()}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export const Route = createFileRoute('/')({ component: HomePage });
