import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';

export const Route = createFileRoute('/llms.txt')({
  server: {
    handlers: {
      GET: () => {
        const body = `# Image Color Remover

> A privacy-first AI photo cleanup app for removing an unwanted person from an image you own or are authorised to edit.

## Primary pages
- Home: ${envConfigs.app_url}/
- Clean a photo: ${envConfigs.app_url}/clean
- Sign in: ${envConfigs.app_url}/sign-in
- Pricing: ${envConfigs.app_url}/pricing
- Terms and acceptable use: ${envConfigs.app_url}/terms-of-service
- Privacy policy: ${envConfigs.app_url}/privacy-policy

## Product facts
- Input: one image (JPG, PNG, or WebP) that the user owns or is authorised to edit.
- Workflow: upload an image, brush over the unwanted person, submit an AI edit, then review and download the result.
- Output: a downloadable PNG. The first release does not keep a cloud history of uploaded images or results.
- AI cleanup consumes credits only when a task is submitted; failed requests are refunded.
- Users may not remove watermarks, copyright notices, safety labels, or edit images without permission.
`;
        return new Response(body, {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      },
    },
  },
});
