import { useRef, useState } from 'react';
import { ImagePlus, Play, Sparkles, Volume2, VolumeX } from 'lucide-react';

import { envConfigs } from '@/config';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { buttonVariants } from '@/components/ui/button';

export function Hero() {
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <section className="bg-black px-4 pt-24 pb-8 text-white sm:px-6 sm:pt-32 sm:pb-12">
      <div className="mx-auto max-w-[1480px]">
        <div className="mb-8 grid items-end gap-8 lg:grid-cols-[1.25fr_.75fr]">
          <div>
            <p className="mb-5 flex items-center gap-2 text-xs font-medium tracking-[0.18em] text-zinc-400 uppercase">
              <Sparkles className="size-3.5" /> {envConfigs.app_name}
            </p>
            <h1 className="max-w-5xl text-5xl leading-[.94] font-normal tracking-[-.055em] sm:text-7xl lg:text-[92px]">
              {m['landing.hero.headline']()}
            </h1>
          </div>
          <div className="pb-2 lg:pb-3">
            <p className="max-w-lg text-base leading-relaxed text-zinc-400 sm:text-lg">
              {m['landing.hero.subheadline']()}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <label
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'h-12 cursor-pointer rounded-md bg-white px-6 text-black hover:bg-zinc-200'
                )}
              >
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      if (typeof reader.result !== 'string') return;
                      sessionStorage.setItem('homepage-upload', reader.result);
                      sessionStorage.setItem('homepage-upload-name', file.name);
                      window.location.href = '/#templates';
                    };
                    reader.readAsDataURL(file);
                  }}
                />
                <ImagePlus className="mr-2 size-4" />
                {m['landing.hero.upload_cta']()}
              </label>
              <a
                href="#how-it-works"
                className={cn(
                  buttonVariants({ size: 'lg', variant: 'outline' }),
                  'h-12 rounded-md border-zinc-700 bg-transparent px-6 text-white hover:bg-zinc-900 hover:text-white'
                )}
              >
                <Play className="mr-2 size-4" /> {m['landing.hero.secondary']()}
              </a>
            </div>
            <p className="mt-3 text-xs text-zinc-500">
              {m['landing.hero.upload_hint']()}
            </p>
          </div>
        </div>
        <div className="relative aspect-[16/8.4] overflow-hidden rounded-lg bg-zinc-900 sm:aspect-[16/7.6]">
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            src="/media/template-neon-night.mp4"
            autoPlay
            muted={muted}
            loop
            playsInline
            preload="metadata"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />
          <button
            type="button"
            onClick={() => {
              const nextMuted = !muted;
              setMuted(nextMuted);
              if (!nextMuted) void videoRef.current?.play();
            }}
            className="absolute top-4 right-4 flex items-center gap-2 rounded-full border border-white/20 bg-black/55 px-3 py-2 text-xs text-white backdrop-blur transition hover:bg-black/75 sm:top-6 sm:right-6"
            aria-label={
              muted ? m['create.sound_on']() : m['create.sound_off']()
            }
          >
            {muted ? (
              <VolumeX className="size-4" />
            ) : (
              <Volume2 className="size-4" />
            )}
            {muted ? m['create.sound_on']() : m['create.sound_off']()}
          </button>
          <div className="absolute right-4 bottom-4 left-4 flex items-end justify-between text-xs tracking-[.14em] text-white/80 uppercase sm:right-6 sm:bottom-6 sm:left-6">
            <span>{m['landing.hero.preview_label']()}</span>
            <span>00:12 · ORIGINAL AUDIO</span>
          </div>
        </div>
      </div>
    </section>
  );
}
