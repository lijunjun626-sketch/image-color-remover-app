import { createFileRoute } from '@tanstack/react-router';

import { getAuth } from '@/core/auth';
import { hasPermission } from '@/modules/rbac/service';
import { respData, respErr } from '@/lib/resp';

async function GET({ request }: { request: Request }) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return respErr('Unauthorized');

    // `admin.*` is a permission grant pattern, not the panel-entry permission.
    // Standard admins deliberately hold explicit permissions instead of that
    // blanket wildcard, so gate the panel on the dedicated access capability.
    const isAdmin = await hasPermission(session.user.id, 'admin.access');
    return respData({ isAdmin });
  } catch (error: any) {
    return respErr(error.message || 'Internal error');
  }
}

export const Route = createFileRoute('/api/user/permissions')({
  server: {
    handlers: { GET },
  },
});
