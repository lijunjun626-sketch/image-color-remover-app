import { ArrowRight, Check } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { cn } from '@/lib/utils';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { buttonVariants } from '@/components/ui/button';

type GuideKind = 'how-to' | 'examples';

const copy = {
  en: {
    howTo: {
      eyebrow: 'BURNING BRIDGES AI VIDEO GUIDE',
      title: 'How to make a Burning Bridges AI video from one photo',
      intro:
        'Turn one portrait you have permission to use into a short cinematic party performance. Pick an original motion template, preview it, then create your video.',
      sections: [
        [
          'Choose a clear portrait',
          'Use a front-facing image with one adult subject, clear lighting and a visible face. JPG, PNG and WEBP files are supported.',
        ],
        [
          'Preview an original motion template',
          'Choose the performance, camera rhythm and available audio you want before you upload. The template preview shows the overall visual direction.',
        ],
        [
          'Create and download',
          'Upload your photo, submit the generation and find the finished MP4 in My Videos. If a technical generation fails, the credits are returned.',
        ],
      ],
      ctaTitle: 'Ready to create your video?',
      ctaBody:
        'Open the studio, choose a template and start with a photo you own or are authorised to use.',
      cta: 'Create my AI video',
      related: 'See Burning Bridges AI video examples',
    },
    examples: {
      eyebrow: 'BURNING BRIDGES AI VIDEO EXAMPLES',
      title: 'What a Burning Bridges AI video can look like',
      intro:
        'Every result starts with your portrait and follows an original motion template. Browse the template directions below, then choose one in the creation studio.',
      sections: [
        [
          'Cinematic party entrance',
          'A bold opening performance with a clear subject, staged lighting and a forward camera rhythm. Best with a centred portrait.',
        ],
        [
          'Neon-night performance',
          'A darker, club-inspired visual direction with saturated colour and movement. Use a portrait with clean separation from its background.',
        ],
        [
          'Crowd-toast moment',
          'A short celebratory scene built around a social, high-energy finish. Choose a photo where the face is well lit and unobstructed.',
        ],
      ],
      ctaTitle: 'Make your own version',
      ctaBody:
        'Preview the available original templates before you upload, then generate a short video from a photo you have the right to use.',
      cta: 'Open the creation studio',
      related: 'Read the step-by-step guide',
    },
  },
  zh: {
    howTo: {
      eyebrow: 'BURNING BRIDGES AI 视频指南',
      title: '如何用一张照片制作 Burning Bridges 风格 AI 视频',
      intro:
        '将一张您有权使用的人物照片制作成短片派对表演视频。选择原创动作模板，先预览，再生成并下载视频。',
      sections: [
        [
          '选择清晰人物照',
          '使用包含一位成年人的正面照片，保证人脸清晰、光线均匀。支持 JPG、PNG 与 WEBP。',
        ],
        [
          '预览原创动作模板',
          '上传前选择你喜欢的表演、运镜节奏与可用音频。模板预览会展示整体视觉方向。',
        ],
        [
          '生成并下载',
          '上传照片后提交生成，完成的视频会出现在“我的视频”。如因技术原因生成失败，积分会退回。',
        ],
      ],
      ctaTitle: '准备好制作视频了吗？',
      ctaBody:
        '打开创作工作台，选择模板，并使用你拥有或获得授权使用的照片开始制作。',
      cta: '制作我的 AI 视频',
      related: '查看 Burning Bridges AI 视频示例',
    },
    examples: {
      eyebrow: 'BURNING BRIDGES AI 视频示例',
      title: 'Burning Bridges 风格 AI 视频可以是什么样子',
      intro:
        '每个生成结果均从你的人物照开始，并跟随原创动作模板。浏览下面的模板方向，然后在创作工作台中选择一个。',
      sections: [
        [
          '电影感派对入场',
          '突出人物、舞台灯光和向前推进的镜头节奏。适合居中、清晰的人像。',
        ],
        [
          '霓虹夜场表演',
          '饱和色彩与夜店氛围的动态视觉方向。选择与背景区分清楚的人像，效果更稳定。',
        ],
        [
          '人群祝酒瞬间',
          '围绕庆祝氛围与高能结尾的短场景。选择光线充足、面部无遮挡的照片。',
        ],
      ],
      ctaTitle: '制作属于你的版本',
      ctaBody: '上传前先预览可用的原创模板，然后用你有权使用的照片生成短视频。',
      cta: '打开创作工作台',
      related: '阅读分步骤制作指南',
    },
  },
} as const;

export function BurningBridgesGuidePage({
  kind,
  locale,
}: {
  kind: GuideKind;
  locale: 'en' | 'zh';
}) {
  const content = copy[locale][kind];
  const relatedHref =
    kind === 'how-to'
      ? '/burning-bridges-ai-video-examples'
      : '/how-to-make-burning-bridges-ai-video';

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="mx-auto max-w-[1180px] px-4 pt-32 pb-24 sm:px-6 sm:pt-40">
        <p className="text-xs tracking-[.18em] text-zinc-500 uppercase">
          {content.eyebrow}
        </p>
        <h1 className="mt-5 max-w-5xl text-5xl leading-[.95] tracking-[-.05em] sm:text-7xl">
          {content.title}
        </h1>
        <p className="mt-8 max-w-3xl text-lg leading-8 text-zinc-400">
          {content.intro}
        </p>

        <div className="mt-20 border-t border-zinc-800">
          {content.sections.map(([title, description], index) => (
            <section
              key={title}
              className="grid gap-5 border-b border-zinc-800 py-9 sm:grid-cols-[80px_.65fr_1.35fr]"
            >
              <span className="text-xs text-zinc-600">0{index + 1}</span>
              <h2 className="text-2xl">{title}</h2>
              <p className="leading-7 text-zinc-400">{description}</p>
            </section>
          ))}
        </div>

        <div className="mt-12 flex items-start gap-3 text-sm leading-6 text-zinc-400">
          <Check className="mt-0.5 size-4 shrink-0 text-lime-300" />
          <p>
            {locale === 'zh'
              ? '所有结果均为 AI 生成内容。请只上传你本人拥有或已获得授权使用的人物照片。'
              : 'All results are AI-generated. Only upload portrait photos that you own or are authorised to use.'}
          </p>
        </div>

        <div className="mt-16 rounded-lg bg-white p-7 text-black sm:p-10">
          <h2 className="text-3xl tracking-[-.03em]">{content.ctaTitle}</h2>
          <p className="mt-3 max-w-2xl text-zinc-600">{content.ctaBody}</p>
          <div className="mt-7 flex flex-wrap gap-5">
            <Link
              href="/create"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'gap-2 bg-black text-white hover:bg-zinc-800'
              )}
            >
              {content.cta}
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href={relatedHref}
              className="self-center text-sm font-medium text-zinc-700 underline underline-offset-4 hover:text-black"
            >
              {content.related}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
