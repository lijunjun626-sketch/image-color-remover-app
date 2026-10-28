export type VideoTemplate = {
  key: string;
  src: string;
  durationSeconds: number;
  resolution: '480p';
  generationEnabled?: boolean;
};

export const videoTemplates: VideoTemplate[] = [
  {
    key: 'entrance',
    // Keep the provider input on the moderation-safe original soundtrack.
    // The branded hero soundtrack is applied only after generation.
    src: '/media/template-party-entrance.mp4',
    durationSeconds: 6,
    resolution: '480p',
  },
  {
    key: 'neon_night',
    src: '/media/template-neon-night.mp4',
    durationSeconds: 12,
    resolution: '480p',
    generationEnabled: false,
  },
  {
    key: 'red_suit',
    src: '/media/template-red-suit.mp4',
    durationSeconds: 12,
    resolution: '480p',
  },
  {
    key: 'toast',
    src: '/media/template-crowd-toast.mp4',
    durationSeconds: 6,
    resolution: '480p',
  },
];

export function getVideoTemplate(key: string) {
  return videoTemplates.find((template) => template.key === key) || null;
}
