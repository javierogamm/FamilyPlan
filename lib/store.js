'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api';
import { addDays, todayISO } from './dates';

const EMPTY = { meals: [], absences: [], events: [], dishes: [], shopping: [], list_items: [], item_stock: [] };

const nk = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const sameFn = (table, row) =>
  table === 'meals' ? (x) => x.date === row.date && x.slot === row.slot : table === 'item_stock' ? (x) => nk(x.name) === nk(row.name) : (x) => x.id === row.id;

function upsertLocal(table, list, row) {
  const same = sameFn(table, row);
  const i = list.findIndex(same);
  if (i >= 0) return list.map((x, j) => (j === i ? { ...x, ...row, id: x.id } : x));
  return [...list, { ...row, id: row.id || `tmp-${row.date || row.name}-${row.slot || ''}` }];
}

/** Estado de la familia con actualizaciones optimistas, cola de escrituras y sincronización periódica. */
export function useFamily(code, { onAuthError, onError } = {}) {
  const [data, setData] = useState(EMPTY);
  const [ready, setReady] = useState(false);
  const queue = useRef(Promise.resolve());
  const pending = useRef(0);
  const cb = useRef({});
  cb.current = { onAuthError, onError };

  const refresh = useCallback(async () => {
    if (pending.current > 0) return;
    try {
      setData(await api(code, `/api/state?from=${addDays(todayISO(), -35)}`));
    } catch (e) {
      if (e.status === 401) cb.current.onAuthError?.(e);
      else cb.current.onError?.(e.message);
    } finally {
      setReady(true);
    }
  }, [code]);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 30000);
    const vis = () => document.visibilityState === 'visible' && refresh();
    document.addEventListener('visibilitychange', vis);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', vis);
    };
  }, [refresh]);

  const write = useCallback(
    (fn) => {
      pending.current++;
      queue.current = queue.current
        .then(fn)
        .catch((e) => {
          if (e.status === 401) cb.current.onAuthError?.(e);
          else cb.current.onError?.(e.message);
        })
        .finally(() => {
          pending.current--;
          if (pending.current === 0) refresh();
        });
    },
    [refresh],
  );

  const save = useCallback(
    (table, row) => {
      setData((d) => ({ ...d, [table]: upsertLocal(table, d[table], row) }));
      const body = table === 'meals' || table === 'item_stock' ? { ...row, id: undefined } : row;
      write(() => api(code, `/api/${table}`, { method: 'POST', body }));
    },
    [code, write],
  );

  const saveMany = useCallback(
    (table, rows) => {
      setData((d) => ({ ...d, [table]: rows.reduce((acc, r) => upsertLocal(table, acc, r), d[table]) }));
      write(() => api(code, `/api/${table}`, { method: 'POST', body: rows }));
    },
    [code, write],
  );

  const removeChecked = useCallback(() => {
    setData((d) => ({ ...d, list_items: d.list_items.filter((i) => !i.checked) }));
    write(() => api(code, '/api/list_items?checked=1', { method: 'DELETE' }));
  }, [code, write]);

  const removeSeries = useCallback(
    (seriesId, from) => {
      setData((d) => ({ ...d, events: d.events.filter((e) => !(e.series_id === seriesId && e.date >= from)) }));
      write(() => api(code, `/api/events?series=${seriesId}&from=${from}`, { method: 'DELETE' }));
    },
    [code, write],
  );

  const remove = useCallback(
    (table, row) => {
      const same = table === 'meals' ? (x) => x.date === row.date && x.slot === row.slot : (x) => x.id === row.id;
      setData((d) => ({ ...d, [table]: d[table].filter((x) => !same(x)) }));
      const q = table === 'meals' ? `date=${row.date}&slot=${row.slot}` : `id=${row.id}`;
      write(() => api(code, `/api/${table}?${q}`, { method: 'DELETE' }));
    },
    [code, write],
  );

  return { data, ready, save, saveMany, remove, removeSeries, removeChecked, refresh };
}
