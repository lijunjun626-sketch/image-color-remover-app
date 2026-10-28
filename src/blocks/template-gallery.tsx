import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Check,
  ImagePlus,
  LoaderCircle,
  Sparkles,
  Upload,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { toast } from 'sonner';

import { useSession } from '@/core/auth/client';
import { tDynamic } from '@/core/i18n/dynamic';
import { useRouter } from '@/core/i18n/navigation';
import { apiPost, apiPostForm } from '@/lib/api-client';
import { m } from '@/paraglide/messages.js';
import { Button } from '@/components/ui/button';

const templates = [
  {
    key: 'entrance',
    src: '/media/template-party-entrance-main-bgm.mp4',
    meta: '6 sec · hero soundtrack',
  },
  {
    key: 'neon_night',
    src: '/media/template-neon-night.mp4',
    meta: '12 sec · original audio',
    disabled: true,
  },
  {
    key: 'red_suit',
    src: '/media/template-red-suit.mp4',
    meta: '12 sec · original audio',
  },
  {
    key: 'toast',
    src: '/media/template-crowd-toast.mp4',
    meta: '6 sec · 480p',
  },
];

function dataUrlToBlob(dataUrl: string) {
  const [header, encoded] = dataUrl.split(',', 2);
  if (!header || !encoded) throw new Error('The selected image is invalid');
  const contentType = header.match(/^data:([^;]+)/)?.[1] || 'image/jpeg';
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: contentType });
}

export function TemplateGallery() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = useSession();
  const [selectedTemplate, setSelectedTemplate] = useState('entrance');
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [previewMuted, setPreviewMuted] = useState(true);
  const previewVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const savedImage = sessionStorage.getItem('homepage-upload');
    if (!savedImage) return;
    setImage(savedImage);
    setFileName(
      sessionStorage.getItem('homepage-upload-name') ||
        m['create.preview_alt']()
    );
  }, []);

  const activeTemplate =
    templates.find((template) => template.key === selectedTemplate) ??
    templates[0];

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!image) throw new Error('Upload a portrait first');
      const imageBlob = dataUrlToBlob(image);
      const form = new FormData();
      form.append(
        'file',
        new File([imageBlob], fileName || 'portrait.jpg', {
          type: imageBlob.type || 'image/jpeg',
        })
      );
      const upload = await apiPostForm<{ url: string }>(
        '/api/higgsfield/upload',
        form
      );
      return apiPost<{ taskId: string }>('/api/higgsfield/generate', {
        imageUrl: upload.url,
        templateKey: selectedTemplate,
      });
    },
    onSuccess: ({ taskId }) => {
      sessionStorage.removeItem('homepage-upload');
      sessionStorage.removeItem('homepage-upload-name');
      toast.success('Your video is now generating.');
      router.push(`/settings/videos?task=${encodeURIComponent(taskId)}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Could not start the video');
      if (/insufficient credits/i.test(error.message)) router.push('/#pricing');
    },
  });

  function continueToGeneration() {
    if (!sessionPending && !session?.user) {
      router.push('/sign-in?callbackUrl=%2F%23templates');
      return;
    }
    generateMutation.mutate();
  }

  function saveImage(file: File) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Please use a JPG, PNG, or WEBP image.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be 10MB or smaller.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      setImage(reader.result);
      setFileName(file.name);
      sessionStorage.setItem('homepage-upload', reader.result);
      sessionStorage.setItem('homepage-upload-name', file.name);
    };
    reader.readAsDataURL(file);
  }

  return (
    <section
      id="templates"
      className="scroll-mt-16 bg-black px-4 py-20 text-white sm:px-6 sm:py-28"
    >
      <div className="mx-auto max-w-[1480px]">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="mb-4 text-xs tracking-[.18em] text-zinc-500 uppercase">
              {m['landing.templates.eyebrow']()}
            </p>
            <h2 className="text-4xl leading-none font-normal tracking-[-.04em] sm:text-6xl">
              {m['landing.templates.title']()}
            </h2>
          </div>
          <p className="hidden max-w-sm text-right text-sm text-zinc-500 sm:block">
            {m['landing.templates.select_hint']()}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {templates.map((template, index) => {
            const selected = template.key === selectedTemplate;
            return (
              <button
                key={template.key}
                type="button"
                disabled={template.disabled}
                onClick={() => {
                  setSelectedTemplate(template.key);
                  setPreviewMuted(true);
                }}
                className={`group block text-left ${template.disabled ? 'cursor-not-allowed opacity-55' : ''}`}
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-zinc-900">
                  <video
                    src={template.src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/10" />
                  <span className="absolute top-4 left-4 text-[11px] tracking-[.16em] text-white/70 uppercase">
                    0{index + 1}
                  </span>
                  {template.disabled && (
                    <span className="absolute top-4 right-4 rounded-full border border-white/20 bg-black/70 px-3 py-1 text-[10px] tracking-[.12em] text-white uppercase backdrop-blur">
                      Under review
                    </span>
                  )}
                  {selected && (
                    <span className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full bg-white text-black">
                      <Check className="size-4" />
                    </span>
                  )}
                  <div className="absolute right-4 bottom-4 left-4">
                    <h3 className="text-xl font-normal">
                      {tDynamic(`landing.templates.${template.key}`)}
                    </h3>
                    <p className="mt-1 text-xs tracking-[.12em] text-zinc-400 uppercase">
                      {template.meta}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 lg:grid-cols-[1.1fr_.9fr]">
          <div className="relative min-h-[360px] bg-zinc-900 sm:min-h-[520px]">
            <video
              ref={previewVideoRef}
              key={activeTemplate.src}
              src={activeTemplate.src}
              autoPlay
              muted={previewMuted}
              loop
              playsInline
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
            <button
              type="button"
              onClick={() => {
                const nextMuted = !previewMuted;
                setPreviewMuted(nextMuted);
                if (!nextMuted) void previewVideoRef.current?.play();
              }}
              className="absolute top-5 right-5 z-10 flex items-center gap-2 rounded-full border border-white/20 bg-black/65 px-3 py-2 text-xs text-white backdrop-blur transition hover:bg-black/85"
              aria-label={previewMuted ? 'Turn sound on' : 'Mute preview'}
            >
              {previewMuted ? (
                <VolumeX className="size-4" />
              ) : (
                <Volume2 className="size-4" />
              )}
              {previewMuted ? 'Sound on' : 'Mute'}
            </button>
            <div className="absolute right-5 bottom-5 left-5 flex justify-between text-xs tracking-[.14em] text-white/80 uppercase">
              <span>{tDynamic(`landing.templates.${activeTemplate.key}`)}</span>
              <span>{activeTemplate.meta}</span>
            </div>
          </div>

          <div className="flex flex-col p-5 sm:p-8">
            <div className="mb-6">
              <p className="text-xs tracking-[.18em] text-zinc-500 uppercase">
                {m['landing.templates.step_label']()}
              </p>
              <h3 className="mt-3 text-3xl tracking-[-.035em]">
                {m['landing.templates.upload_title']()}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                {m['landing.templates.upload_description']()}
              </p>
            </div>

            <label
              className={`group relative flex min-h-64 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-dashed bg-zinc-900 transition ${
                isDragging
                  ? 'border-white bg-zinc-800 ring-2 ring-white/20'
                  : 'border-zinc-700 hover:border-zinc-500'
              }`}
              onDragEnter={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'copy';
                setIsDragging(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                if (
                  !event.currentTarget.contains(event.relatedTarget as Node)
                ) {
                  setIsDragging(false);
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                const file = event.dataTransfer.files?.[0];
                if (file) saveImage(file);
              }}
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) saveImage(file);
                }}
              />
              {image && (
                <img
                  src={image}
                  alt={m['create.preview_alt']()}
                  className="absolute inset-0 h-full w-full object-contain p-3 opacity-85 transition group-hover:opacity-55"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
              <div className="relative z-10 text-center">
                <span className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full bg-white text-black">
                  <ImagePlus className="size-5" />
                </span>
                <span className="text-sm font-medium">
                  {fileName || m['landing.hero.upload_cta']()}
                </span>
                <span className="mt-1 block text-xs text-zinc-400">
                  {isDragging
                    ? 'Release to upload your portrait'
                    : `${m['create.upload_hint']()} · or drag and drop`}
                </span>
              </div>
            </label>

            <div className="mt-auto pt-6">
              {image ? (
                <Button
                  type="button"
                  onClick={continueToGeneration}
                  disabled={generateMutation.isPending || sessionPending}
                  className="h-12 w-full rounded-md bg-white text-black hover:bg-zinc-200"
                >
                  {generateMutation.isPending ? (
                    <LoaderCircle className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 size-4" />
                  )}
                  {generateMutation.isPending
                    ? 'Uploading and starting…'
                    : m['landing.templates.continue']()}
                </Button>
              ) : (
                <Button disabled className="h-12 w-full rounded-md">
                  <Upload className="mr-2 size-4" />
                  {m['create.upload_first']()}
                </Button>
              )}
              <p className="mt-3 text-center text-xs text-zinc-500">
                {m['create.no_free_charge']()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
