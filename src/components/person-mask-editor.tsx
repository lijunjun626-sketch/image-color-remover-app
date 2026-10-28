import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Download,
  Eraser,
  ImagePlus,
  RotateCcw,
  WandSparkles,
} from 'lucide-react';
import { toast } from 'sonner';

import { apiPostForm } from '@/lib/api-client';
import { m } from '@/paraglide/messages.js';
import { Button } from '@/components/ui/button';

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

type Point = { x: number; y: number };

type EditResponse = { taskId: string; imageDataUrl: string };

function canvasToPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Could not prepare this image for editing.'));
    }, 'image/png');
  });
}

export function PersonMaskEditor() {
  const inputRef = useRef<HTMLInputElement>(null);
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const [imageReady, setImageReady] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);
  const [isPainting, setIsPainting] = useState(false);
  const [brushSize, setBrushSize] = useState(44);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [status, setStatus] = useState(m['person.editor.empty_status']());

  useEffect(() => {
    return () => {
      // Canvas pixels are local browser state. There is no object URL kept
      // after a file has loaded, so nothing to revoke here.
    };
  }, []);

  function getPoint(
    event: React.PointerEvent<HTMLCanvasElement>
  ): Point | null {
    const canvas = maskCanvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    return {
      x: ((event.clientX - rect.left) * canvas.width) / rect.width,
      y: ((event.clientY - rect.top) * canvas.height) / rect.height,
    };
  }

  function paint(event: React.PointerEvent<HTMLCanvasElement>, start = false) {
    const canvas = maskCanvasRef.current;
    const imageCanvas = imageCanvasRef.current;
    const point = getPoint(event);
    if (!canvas || !imageCanvas || !point || !imageReady) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.62)';
    ctx.lineWidth =
      (brushSize * imageCanvas.width) /
      Math.max(1, imageCanvas.getBoundingClientRect().width);
    if (start) {
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();
    setHasSelection(true);
    setStatus(m['person.editor.selection_ready']());
  }

  function resetSelection() {
    const canvas = maskCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSelection(false);
    setStatus(m['person.editor.selection_cleared']());
  }

  function loadFile(file?: File) {
    if (!file) return;
    if (!allowedTypes.has(file.type) || file.size > MAX_FILE_BYTES) {
      setStatus(m['person.editor.invalid_file']());
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const imageCanvas = imageCanvasRef.current;
      const maskCanvas = maskCanvasRef.current;
      if (!imageCanvas || !maskCanvas) return;
      const scale = Math.min(
        1,
        1800 / Math.max(image.naturalWidth, image.naturalHeight)
      );
      imageCanvas.width = maskCanvas.width = Math.round(
        image.naturalWidth * scale
      );
      imageCanvas.height = maskCanvas.height = Math.round(
        image.naturalHeight * scale
      );
      imageCanvas
        .getContext('2d')
        ?.drawImage(image, 0, 0, imageCanvas.width, imageCanvas.height);
      maskCanvas
        .getContext('2d')
        ?.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
      URL.revokeObjectURL(objectUrl);
      setImageReady(true);
      setHasSelection(false);
      setResultUrl(null);
      setStatus(m['person.editor.file_ready']({ name: file.name }));
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setStatus(m['person.editor.invalid_file']());
    };
    image.src = objectUrl;
  }

  const editMutation = useMutation({
    mutationFn: async () => {
      const imageCanvas = imageCanvasRef.current;
      const maskCanvas = maskCanvasRef.current;
      if (!imageReady || !hasSelection || !imageCanvas || !maskCanvas) {
        throw new Error(m['person.editor.select_first']());
      }
      const [imageBlob, maskBlob] = await Promise.all([
        canvasToPng(imageCanvas),
        canvasToPng(maskCanvas),
      ]);
      const form = new FormData();
      // Both canvases are created at identical dimensions. The mask is a PNG
      // with a transparent background, as required by the image-edit API.
      form.set(
        'image',
        new File([imageBlob], 'source.png', { type: 'image/png' })
      );
      form.set(
        'mask',
        new File([maskBlob], 'selection.png', { type: 'image/png' })
      );
      return apiPostForm<EditResponse>('/api/person-remover', form);
    },
    onSuccess: ({ imageDataUrl }) => {
      setResultUrl(imageDataUrl);
      setStatus(m['person.editor.result_ready']());
      toast.success(m['person.editor.result_ready']());
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : m['person.editor.unknown_error']();
      setStatus(m['person.editor.error']({ message }));
      toast.error(m['person.editor.error']({ message }));
    },
  });

  return (
    <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div
        className="relative min-h-[24rem] overflow-hidden rounded-3xl border border-stone-700 bg-stone-900"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          loadFile(event.dataTransfer.files[0]);
        }}
      >
        {!imageReady ? (
          <div className="absolute inset-0 grid place-items-center p-8 text-center">
            <div className="max-w-sm">
              <ImagePlus className="mx-auto size-8 text-lime-300" />
              <h2 className="mt-5 text-xl font-medium">
                {m['person.editor.drop_title']()}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-400">
                {m['person.editor.drop_description']()}
              </p>
              <Button
                className="mt-6 bg-lime-300 text-stone-950 hover:bg-lime-200"
                onClick={() => inputRef.current?.click()}
              >
                {m['person.editor.choose_file']()}
              </Button>
            </div>
          </div>
        ) : null}
        <canvas
          ref={imageCanvasRef}
          className={
            imageReady
              ? 'block h-auto max-h-[42rem] w-full object-contain'
              : 'hidden'
          }
        />
        <canvas
          ref={maskCanvasRef}
          className={
            imageReady
              ? 'absolute inset-0 h-full w-full cursor-crosshair touch-none'
              : 'hidden'
          }
          onPointerDown={(event) => {
            setIsPainting(true);
            event.currentTarget.setPointerCapture(event.pointerId);
            paint(event, true);
          }}
          onPointerMove={(event) => isPainting && paint(event)}
          onPointerUp={(event) => {
            setIsPainting(false);
            if (event.currentTarget.hasPointerCapture(event.pointerId))
              event.currentTarget.releasePointerCapture(event.pointerId);
          }}
          onPointerCancel={() => setIsPainting(false)}
        />
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => loadFile(event.target.files?.[0])}
        />
      </div>

      <aside className="rounded-3xl border border-stone-700 bg-stone-900 p-5">
        <p className="text-xs font-semibold tracking-[.16em] text-lime-300 uppercase">
          {m['person.editor.step_label']()}
        </p>
        <h2 className="mt-3 text-xl font-medium">
          {m['person.editor.title']()}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-stone-400">
          {m['person.editor.description']()}
        </p>
        <label
          className="mt-6 block text-sm text-stone-300"
          htmlFor="brush-size"
        >
          {m['person.editor.brush']()}
        </label>
        <input
          id="brush-size"
          type="range"
          min="12"
          max="120"
          value={brushSize}
          onChange={(event) => setBrushSize(Number(event.target.value))}
          className="mt-3 w-full accent-lime-300"
        />
        <p className="mt-2 text-xs text-stone-500">
          {m['person.editor.brush_value']({ size: brushSize })}
        </p>
        <Button
          variant="outline"
          className="mt-6 w-full border-stone-600 bg-transparent text-white hover:bg-stone-800 hover:text-white"
          disabled={!imageReady || editMutation.isPending}
          onClick={resetSelection}
        >
          <Eraser className="size-4" /> {m['person.editor.clear']()}
        </Button>
        <Button
          className="mt-3 w-full bg-lime-300 text-stone-950 hover:bg-lime-200"
          disabled={!imageReady || !hasSelection || editMutation.isPending}
          onClick={() => editMutation.mutate()}
        >
          <WandSparkles className="size-4" />{' '}
          {editMutation.isPending
            ? m['person.editor.processing']()
            : m['person.editor.submit']()}
        </Button>
        <p className="mt-3 text-xs leading-relaxed text-stone-500">
          {m['person.editor.cost_notice']()}
        </p>
        <p className="mt-3 text-xs leading-relaxed text-stone-500">
          {m['person.editor.ephemeral_note']()}
        </p>
        <Button
          variant="ghost"
          className="mt-3 w-full text-stone-400 hover:bg-stone-800 hover:text-white"
          disabled={editMutation.isPending}
          onClick={() => inputRef.current?.click()}
        >
          <RotateCcw className="size-4" /> {m['person.editor.change_image']()}
        </Button>
      </aside>
      {resultUrl ? (
        <section className="rounded-3xl border border-lime-300/40 bg-lime-300/5 p-5 lg:col-span-2">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[.16em] text-lime-300 uppercase">
                {m['person.editor.result_label']()}
              </p>
              <h2 className="mt-2 text-xl font-medium text-white">
                {m['person.editor.result_title']()}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-400">
                {m['person.editor.result_description']()}
              </p>
            </div>
            <Button
              asChild
              className="shrink-0 bg-lime-300 text-stone-950 hover:bg-lime-200"
            >
              <a href={resultUrl} download="person-removed.png">
                <Download className="size-4" /> {m['person.editor.download']()}
              </a>
            </Button>
          </div>
          <img
            src={resultUrl}
            alt={m['person.editor.result_title']()}
            className="mt-5 max-h-[42rem] w-full rounded-2xl border border-stone-700 object-contain"
          />
        </section>
      ) : null}
      <p
        className="-mt-2 text-sm text-stone-400 lg:col-span-2"
        aria-live="polite"
      >
        {status}
      </p>
    </section>
  );
}
