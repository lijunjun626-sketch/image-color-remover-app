import { createFileRoute, redirect } from '@tanstack/react-router';

// The source template used /create for video generation. Keep old bookmarks
// useful while ensuring they never open the inherited video studio.
export const Route = createFileRoute('/create')({
  beforeLoad: () => {
    throw redirect({ to: '/clean' });
  },
  component: () => null,
});
