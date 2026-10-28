import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import {
  Activity,
  ArrowRight,
  CreditCard,
  Key,
  Play,
  TrendingUp,
} from 'lucide-react';

import { useSession } from '@/core/auth/client';
import { Link } from '@/core/i18n/navigation';
import { apiGet } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type Subscription = {
  status: string;
  planName?: string | null;
  productName?: string | null;
};

function DashboardPage() {
  const { data: session } = useSession();

  const { data: creditsData } = useQuery({
    queryKey: ['user-credits'],
    queryFn: () => apiGet<{ balance: number }>('/api/credits'),
  });
  const { data: apiKeysData } = useQuery({
    queryKey: ['user-apikeys'],
    queryFn: () => apiGet<unknown[]>('/api/apikeys'),
  });
  const { data: subscriptionData } = useQuery({
    queryKey: ['user-subscription-current'],
    queryFn: () =>
      apiGet<Subscription | null>('/api/user/subscriptions/current'),
  });

  const credits = creditsData?.balance ?? null;
  const apiKeys = apiKeysData?.length ?? null;
  const subscription = subscriptionData ?? null;

  const planLabel =
    subscription?.planName ||
    subscription?.productName ||
    m['settings.overview.plan_free']();

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {m['settings.title']()}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {m['settings.welcome']({
            name: session?.user?.name || session?.user?.email || '',
          })}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {m['settings.overview.plan']()}
            </CardTitle>
            <TrendingUp className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{planLabel}</div>
            <p className="text-muted-foreground mt-1 text-xs">
              {m['settings.overview.plan_description']()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {m['settings.credits.title']()}
            </CardTitle>
            <CreditCard className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{credits ?? '—'}</div>
            <p className="text-muted-foreground mt-1 text-xs">
              {m['settings.credits.description']()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {m['settings.apikeys.title']()}
            </CardTitle>
            <Key className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiKeys ?? '—'}</div>
            <p className="text-muted-foreground mt-1 text-xs">
              {m['settings.overview.apikeys_description']()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {m['settings.overview.usage']()}
            </CardTitle>
            <Activity className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-muted-foreground mt-1 text-xs">
              {m['settings.overview.usage_description']()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {m['settings.overview.getting_started']()}
          </CardTitle>
          <CardDescription>
            {m['settings.overview.getting_started_description']()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-5 rounded-lg border border-zinc-800 bg-zinc-950 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex max-w-2xl items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-black">
                <Play className="size-4 fill-current" />
              </span>
              <p className="text-sm leading-6 text-zinc-400">
                {m['settings.overview.start_hint']()}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Link
                href="/settings/videos"
                className={cn(buttonVariants({ variant: 'outline' }), 'gap-2')}
              >
                {m['settings.overview.view_videos']()}
              </Link>
              <Link href="/create" className={cn(buttonVariants(), 'gap-2')}>
                {m['settings.overview.create_video']()}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const Route = createFileRoute('/settings/')({
  component: DashboardPage,
});
