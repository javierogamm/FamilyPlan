import { enterHousehold, handle, HttpError } from '@/lib/server';

export const dynamic = 'force-dynamic';

export const POST = handle(async (request) => {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.code !== 'string') throw new HttpError(400, 'Falta el código');
  return enterHousehold(body.code, body.mode === 'create' ? 'create' : 'login');
});
