import { createFileRoute } from '@tanstack/react-router';
import { and, count, desc, eq, isNull } from 'drizzle-orm';

import { getAuth } from '@/core/auth';
import { db } from '@/core/db';
import { aiTask } from '@/config/db/schema';
import { respErr, respPage } from '@/lib/resp';

async function GET({ request }: { request: Request }) {
  try {
    const session = await getAuth().api.getSession({
      headers: request.headers,
    });
    if (!session?.user) return respErr('Unauthorized');

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const pageSize = Math.min(
      50,
      Math.max(1, Number(searchParams.get('pageSize') || 20))
    );
    const status = searchParams.get('status');
    const conditions = [
      eq(aiTask.userId, session.user.id),
      eq(aiTask.mediaType, 'video'),
      isNull(aiTask.deletedAt),
    ];
    if (status && status !== 'all') conditions.push(eq(aiTask.status, status));
    const where = and(...conditions);

    const [totalRow] = await db()
      .select({ count: count() })
      .from(aiTask)
      .where(where);
    const rows = await db()
      .select({
        id: aiTask.id,
        status: aiTask.status,
        provider: aiTask.provider,
        model: aiTask.model,
        prompt: aiTask.prompt,
        taskResult: aiTask.taskResult,
        costCredits: aiTask.costCredits,
        createdAt: aiTask.createdAt,
        updatedAt: aiTask.updatedAt,
      })
      .from(aiTask)
      .where(where)
      .orderBy(desc(aiTask.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const items = rows.map(({ taskResult, ...row }) => {
      let result: Record<string, unknown> | null = null;
      try {
        result = taskResult ? JSON.parse(taskResult) : null;
      } catch {
        result = null;
      }
      return { ...row, result };
    });
    return respPage(items, totalRow.count);
  } catch (error: any) {
    return respErr(error.message || 'Internal error');
  }
}

export const Route = createFileRoute('/api/user/videos')({
  server: { handlers: { GET } },
});
