'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { addDays, diffDays, mondayOf, startDay, todayISO } from '@/lib/dates';
import { computeAlerts } from '@/lib/alerts';
import { buzz } from '@/lib/helpers';
import { useFamily } from '@/lib/store';
import WeekBar from './WeekBar';
import WeekView from './WeekView';
import MealsView from './MealsView';
import AgendaView from './AgendaView';
import AlertsView from './AlertsView';
import MealSheet from './MealSheet';
import AddSheet from './AddSheet';
import Swipe from './Swipe';

const TABS = [
  { id: 'semana', label: 'Semana', d: 'M4 6h16M4 12h16M4 18h10' },
  { id: 'comidas', label: 'Comidas', d: 'M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M17 21V3c-2.5 1.5-3.5 5-3.5 8h3.5' },
  { id: 'agenda', label: 'Agenda', d: 'M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM4 10h16M9 3v4M15 3v4' },
  { id: 'avisos', label: 'Avisos', d: 'M6 17V11a6 6 0 1 1 12 0v6l1.5 2h-15zM10 21a2 2 0 0 0 4 0' },
];

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function persist(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

export default function Shell({ code, onLogout }) {
  const [today, setToday] = useState(todayISO);
  const [toast, setToast] = useState(null);
  const showToast = useCallback((t) => setToast({ ...t, n: Date.now() }), []);
  const { data, ready, save, remove } = useFamily(code, { onAuthError: onLogout, onError: (msg) => showToast({ msg: `⚠️ ${msg}` }) });

  const [tab, setTab] = useState('semana');
  const [monday, setMonday] = useState(() => mondayOf(startDay(todayISO())));
  const [selected, setSelected] = useState(() => startDay(todayISO()));
  const [dir, setDir] = useState(1);
  const [sheet, setSheet] = useState(null);
  const counter = useRef(0);
  const [dismissed, setDismissed] = useState(() => load('fp_dismissed', []));
  const [notif, setNotif] = useState('unsupported');

  useEffect(() => {
    const vis = () => document.visibilityState === 'visible' && setToday(todayISO());
    document.addEventListener('visibilitychange', vis);
    if ('Notification' in window) setNotif(Notification.permission);
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
    return () => document.removeEventListener('visibilitychange', vis);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const alerts = useMemo(() => (ready ? computeAlerts(data, today).filter((a) => !dismissed.includes(a.id)) : []), [data, ready, today, dismissed]);

  // Notificaciones del sistema para lo urgente (una vez por aviso). Se generan al abrir la app.
  useEffect(() => {
    if (notif !== 'granted' || !ready) return;
    const seen = load('fp_notified', []);
    const fresh = alerts.filter((a) => a.level === 'high' && !seen.includes(a.id));
    if (!fresh.length) return;
    persist('fp_notified', [...seen, ...fresh.map((a) => a.id)].slice(-200));
    navigator.serviceWorker?.ready.then((reg) => fresh.slice(0, 3).forEach((a) => reg.showNotification(a.title, { body: a.text, tag: a.id, icon: '/icon-192.png' }))).catch(() => {});
  }, [alerts, notif, ready]);

  const shiftWeek = useCallback((delta) => {
    setDir(delta);
    setMonday((m) => addDays(m, 7 * delta));
    setSelected((s) => addDays(s, 7 * delta));
  }, []);
  const shiftDay = (delta) => {
    const i = diffDays(selected, monday) + delta;
    if (i > 4) { setDir(1); setMonday(addDays(monday, 7)); setSelected(addDays(monday, 7)); }
    else if (i < 0) { setDir(-1); setMonday(addDays(monday, -7)); setSelected(addDays(monday, -3)); }
    else { setDir(delta); setSelected(addDays(monday, i)); }
  };
  const selectDay = (d) => { setDir(d > selected ? 1 : -1); setSelected(d); };
  const goDate = (d) => { setMonday(mondayOf(d)); setSelected(d); };
  const goToday = () => {
    const t = startDay(today);
    setDir(t > selected ? 1 : -1);
    goDate(t);
  };

  const open = (s) => setSheet({ ...s, open: true, n: ++counter.current });
  const closeSheet = useCallback(() => setSheet((s) => s && { ...s, open: false }), []);
  const openMeal = (date, slotId) => open({ kind: 'meal', date, slotId });
  const openAdd = (date, edit = null) => open({ kind: 'add', date, edit });

  const removeWithUndo = (table, row) => {
    remove(table, row);
    showToast({ msg: table === 'meals' ? 'Plato quitado' : 'Borrado', undo: () => save(table, row) });
  };
  const dismiss = (id) => {
    const next = [...dismissed, id].slice(-300);
    setDismissed(next);
    persist('fp_dismissed', next);
    showToast({ msg: 'Aviso descartado', undo: () => { const r = next.filter((x) => x !== id); setDismissed(r); persist('fp_dismissed', r); } });
  };
  const goAlert = (a) => {
    goDate(a.go.date);
    setTab(a.go.tab);
    if (a.go.slot) openMeal(a.go.date, a.go.slot);
  };
  const enableNotif = async () => {
    try { setNotif(await Notification.requestPermission()); } catch {}
  };

  const swipeWeek = (d) => shiftWeek(d);

  // Teclado (PC): ← → cambian de día (Comidas) o de semana (resto).
  const keyNav = useRef();
  keyNav.current = (delta) => (tab === 'comidas' ? shiftDay(delta) : shiftWeek(delta));
  useEffect(() => {
    const onKey = (e) => {
      if (sheet?.open || e.altKey || e.ctrlKey || e.metaKey || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      if (e.key === 'ArrowRight') keyNav.current(1);
      else if (e.key === 'ArrowLeft') keyNav.current(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheet?.open]);
  const urgent = alerts.filter((a) => a.level !== 'info').length;

  return (
    <div className="app">
      <div className="blobs" aria-hidden><i /><i /><i /></div>
      {tab !== 'avisos' && (
        <WeekBar monday={monday} selected={selected} today={today} showDays={tab !== 'semana'} data={data} onSelect={selectDay} onShift={shiftWeek} onToday={goToday} />
      )}
      <main className="main">
        {!ready ? (
          <div className="skeleton" aria-busy>{[0, 1, 2].map((i) => <i key={i} />)}</div>
        ) : (
          <>
            {tab === 'semana' && (
              <Swipe id={`w-${monday}`} dir={dir} onSwipe={swipeWeek}>
                <WeekView monday={monday} today={today} data={data} openMeal={openMeal} openEvent={(e, d) => openAdd(d, e)} goDay={(d) => { selectDay(d); setTab('comidas'); }} />
              </Swipe>
            )}
            {tab === 'comidas' && (
              <Swipe id={`d-${selected}`} dir={dir} onSwipe={shiftDay}>
                <MealsView monday={monday} date={selected} data={data} openMeal={openMeal} save={save} />
              </Swipe>
            )}
            {tab === 'agenda' && (
              <AgendaView save={save} monday={monday} today={today} selected={selected} data={data} openEvent={(e) => openAdd(selected, e)} openAbsence={(a) => openAdd(selected, a)} openAdd={(d) => openAdd(d)} removeWithUndo={removeWithUndo} />
            )}
            {tab === 'avisos' && (
              <AlertsView alerts={alerts} onGo={goAlert} onDismiss={dismiss} notif={notif} onEnableNotif={enableNotif} code={code} onLogout={onLogout} />
            )}
          </>
        )}
      </main>

      <AnimatePresence>
        {(tab === 'semana' || tab === 'agenda') && ready && (
          <motion.button key="fab" type="button" className="fab" aria-label="Añadir a la agenda" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} whileTap={{ scale: 0.88 }} onClick={() => { buzz(); openAdd(selected); }}>
            ＋
          </motion.button>
        )}
      </AnimatePresence>

      <nav className="tabbar" aria-label="Secciones">
        {TABS.map((t) => (
          <button key={t.id} type="button" className={tab === t.id ? 'on' : ''} aria-current={tab === t.id ? 'page' : undefined} onClick={() => { buzz(6); setTab(t.id); }}>
            {tab === t.id && <motion.span layoutId="tabpill" className="tab-pill" transition={{ type: 'spring', stiffness: 450, damping: 34 }} />}
            <span className="tab-ico">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={t.d} /></svg>
              {t.id === 'avisos' && urgent > 0 && <motion.b key={urgent} className="badge-n" initial={{ scale: 0 }} animate={{ scale: 1 }}>{urgent}</motion.b>}
            </span>
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </nav>

      <AnimatePresence>
        {toast && (
          <motion.div key={toast.n} className="toast" role="status" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}>
            <span>{toast.msg}</span>
            {toast.undo && <button type="button" onClick={() => { toast.undo(); setToast(null); }}>Deshacer</button>}
          </motion.div>
        )}
      </AnimatePresence>

      {sheet?.kind === 'meal' && <MealSheet key={sheet.n} open={sheet.open} date={sheet.date} slotId={sheet.slotId} data={data} save={save} remove={removeWithUndo} onClose={closeSheet} />}
      {sheet?.kind === 'add' && <AddSheet key={sheet.n} open={sheet.open} date={sheet.date} edit={sheet.edit} save={save} onDelete={(row) => removeWithUndo('person' in row ? 'absences' : 'events', row)} onClose={closeSheet} />}
    </div>
  );
}
