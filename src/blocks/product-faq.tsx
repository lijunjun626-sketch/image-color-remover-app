import { m } from '@/paraglide/messages.js';

const questions = [1, 2, 3, 4, 5, 6] as const;

export function ProductFAQ() {
  return (
    <section className="border-t border-zinc-800 bg-zinc-950 px-4 py-24 text-white sm:px-6 sm:py-32">
      <div className="mx-auto max-w-[1480px]">
        <div className="grid gap-12 lg:grid-cols-[.72fr_1.28fr]">
          <div>
            <p className="mb-4 text-xs tracking-[.18em] text-zinc-500 uppercase">
              FAQ
            </p>
            <h2 className="max-w-xl text-4xl leading-[.98] font-normal tracking-[-.045em] sm:text-6xl">
              {m['landing.faq.product_title']()}
            </h2>
            <p className="mt-6 max-w-lg leading-relaxed text-zinc-400">
              {m['landing.faq.product_description']()}
            </p>
          </div>
          <div className="border-t border-zinc-800">
            {questions.map((number) => (
              <details
                key={number}
                className="group border-b border-zinc-800 py-6"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-lg">
                  <span>{m[`landing.faq.product_${number}_question`]()}</span>
                  <span className="text-zinc-400 transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="max-w-3xl pt-4 text-sm leading-7 text-zinc-400">
                  {m[`landing.faq.product_${number}_answer`]()}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
