'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api';
import { addDays, todayISO } from './dates';

const EMPTY = { meals: [], absences: [], events: [], dishes: [] };

function upsertLocal(table, list, row) {
  const same = table === 'meals' ? (x) => x.date === row.date && x.slot === row.slot : (x) => x.id === row.id;
  const i = list.findIndex(same);
  if (i >= 0) return list.map((x, j) => (j === i ? { ...x, ...row, id: x.id } : x));
  return [...list, { ...row, id: row.id || `tmp-${row.date}-${row.slot}` }];
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
      setData(await api(code, `/api/state?from=${addDays(todayISO(), -14)}`));
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
      const body = table === 'meals' ? { ...row, id: undefined } : row;
      write(() => api(code, `/api/${table}`, { method: 'POST', body }));
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

  return { data, ready, save, remove, refresh };
}
