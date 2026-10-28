import { createFileRoute } from '@tanstack/react-router';

import { useSession } from '@/core/auth/client';
import { Link } from '@/core/i18n/navigation';
import { m } from '@/paraglide/messages.js';
import { PersonMaskEditor } from '@/components/person-mask-editor';
import { Button } from '@/components/ui/button';

function CleanPage() {
  const { data: session, isPending } = useSession();
  if (isPending)
    return (
      <main className="grid min-h-screen place-items-center bg-stone-950 text-sm text-stone-300">
        {m['person.workspace.loading']()}
      </main>
    );
  if (!session?.user)
    return (
      <main className="grid min-h-screen place-items-center bg-stone-950 p-5 text-white">
        <div className="max-w-md rounded-3xl border border-stone-700 bg-stone-900 p-8">
          <p className="text-sm text-lime-300">
            {m['person.workspace.member_area']()}
          </p>
          <h1 className="mt-3 text-3xl tracking-[-.05em]">
            {m['person.workspace.sign_in_title']()}
          </h1>
          <p className="mt-4 text-stone-400">
            {m['person.workspace.sign_in_description']()}
          </p>
          <Button
            asChild
            className="mt-7 bg-lime-300 text-stone-950 hover:bg-lime-200"
          >
            <Link href="/sign-in?callbackUrl=%2Fclean">
              {m['person.workspace.sign_in_cta']()}
            </Link>
          </Button>
        </div>
      </main>
    );
  return (
    <main className="min-h-screen bg-stone-950 px-5 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm text-stone-400 hover:text-white">
          ← {m['person.workspace.back']()}
        </Link>
        <p className="mt-10 text-sm text-lime-300">
          {m['person.workspace.member_area']()}
        </p>
        <h1 className="mt-3 text-5xl tracking-[-.06em]">
          {m['person.workspace.title']()}
        </h1>
        <p className="mt-4 max-w-2xl text-stone-400">
          {m['person.workspace.description']()}
        </p>
        <PersonMaskEditor />
      </div>
    </main>
  );
}

export const Route = createFileRoute('/clean')({ component: CleanPage });
