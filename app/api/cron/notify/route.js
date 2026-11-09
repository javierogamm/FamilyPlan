import { NextResponse } from 'next/server';
import { db } from '@/lib/server';
import { buildNotifications } from '@/lib/notifications';
import { localNow, sendPush } from '@/lib/push';
import { addDays } from '@/lib/dates';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Lo llama un programador externo cada 5 minutos (Supabase pg_cron, o el cron de Vercel en plan Pro):
 *   Authorization: Bearer $CRON_SECRET
 */
async function run(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const sb = db();
  const now = localNow();
  const { data: subs, error } = await sb.from('push_subscriptions').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const byHome = new Map();
  for (const s of subs) byHome.set(s.household_id, [...(byHome.get(s.household_id) || []), s]);

  let sent = 0;
  for (const [hid, hSubs] of byHome) {
    const from = addDays(now.date, -2);
    const [meals, events, shopping, lists, items] = await Promise.all([
      sb.from('meals').select('*').eq('household_id', hid).gte('date', from),
      sb.from('events').select('*').eq('household_id', hid).or(`date.gte.${from},repeat.eq.weekly`),
      sb.from('shopping').select('*').eq('household_id', hid).or(`done.eq.false,date.gte.${from}`),
      sb.from('lists').select('*').eq('household_id', hid),
      sb.from('list_items').select('*').eq('household_id', hid),
    ]);
    const data = { meals: meals.data || [], events: events.data || [], shopping: shopping.data || [], lists: lists.data || [], list_items: items.data || [], absences: [] };
    const notes = buildNotifications(data, now);
    if (!notes.length) continue;

    const { data: logged } = await sb.from('push_log').select('key').eq('household_id', hid).in('key', notes.map((n) => n.key));
    const seen = new Set((logged || []).map((l) => l.key));
    const dead = [];
    for (const n of notes.filter((x) => !seen.has(x.key))) {
      const targets = hSubs.filter((s) => n.persons === 'all' || !s.person || n.persons.includes(s.person));
      for (const s of targets) {
        const ok = await sendPush(s, { title: n.title, body: n.body, tag: n.tag, url: n.url });
        if (ok) sent++;
        else dead.push(s.id);
      }
      await sb.from('push_log').upsert({ household_id: hid, key: n.key }, { onConflict: 'household_id,key', ignoreDuplicates: true });
    }
    if (dead.length) await sb.from('push_subscriptions').delete().in('id', dead);
  }
  // limpieza del registro de envíos antiguos
  await sb.from('push_log').delete().lt('sent_at', new Date(Date.now() - 3 * 864e5).toISOString());
  return NextResponse.json({ ok: true, at: `${now.date} ${now.time}`, sent });
}

export const GET = run;
export const POST = run;
