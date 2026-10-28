import { createFileRoute } from '@tanstack/react-router';

async function GET() {
  return Response.json({ status: 'ok', service: 'image-color-remover-app' });
}

export const Route = createFileRoute('/api/health')({
  server: { handlers: { GET } },
});
