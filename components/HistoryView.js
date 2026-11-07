'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { SLOTS } from '@/lib/constants';
import { dayNum, isWeekend, weekDays, weekdayName } from '@/lib/dates';
import { dishCounts, last30 } from '@/lib/history';
import { hasDishes, isSuggested, mealAt } from '@/lib/helpers';
import { personIcon } from '@/lib/icons';
import { Pic } from './Pic';
import { Segmented } from './ui';

const RANGES = [{ value: 'week', label: '📆 Semana (7 días)' }, { value: 'month', label: '🗓️ Mes (30 días)' }];

function Ranking({ title, rows, total }) {
  const [all, setAll] = useState(false);
  const max = rows[0]?.count || 1;
  const shown = all ? rows : rows.slice(0, 12);
  return (
    <section className="rank">
      <h3>{title} <small>{rows.length} distintos</small></h3>
      {rows.length === 0 && <p className="muted pad">Aún no hay datos.</p>}
      {shown.map((r, i) => (
        <div key={r.name} className="rank-row">
          <span className="rk-pos">{i + 1}</span>
          <span className="rk-emoji">{r.emoji}</span>
          <span className="rk-main">
            <b>{r.name}</b>
            <span className="rk-bar"><motion.i initial={{ width: 0 }} animate={{ width: `${(r.count / max) * 100}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} /></span>
          </span>
          <span className="rk-n">×{r.count}</span>
        </div>
      ))}
      {rows.length > 12 && <button type="button" className="link" onClick={() => setAll((v) => !v)}>{all ? 'Ver menos' : `Ver todos (${rows.length})`}</button>}
      {total === 0 && null}
    </section>
  );
}

export default function HistoryView({ monday, today, data, openMeal }) {
  const [range, setRange] = useState('week');
  const { from, to } = last30(today);
  const counts = dishCounts(data.meals, from, to);
  return (
    <div className="history">
      <Segmented name="hist-range" value={range} onChange={setRange} options={RANGES} />
      {range === 'week' ? (
        <div className="hist-week">
          {weekDays(monday, 7).map((d) => (
            <section key={d} className={`hist-day${isWeekend(d) ? ' weekend' : ''}${d === today ? ' today' : ''}`}>
              <h4><span>{dayNum(d)}</span> {weekdayName(d)}{d === today && <em className="badge">Hoy</em>}</h4>
              {SLOTS.map((s) => {
                const m = mealAt(data.meals, d, s.id);
                return (
                  <button key={s.id} type="button" className={`hist-meal${hasDishes(m) ? '' : ' empty'}${isSuggested(m) ? ' suggested' : ''}`} onClick={() => openMeal(d, s.id)}>
                    <span className="slot-ico">{s.icon}</span>
                    {hasDishes(m) ? (
                      <span className="hm-names">
                        {m.dish && <span><i>{m.emoji}</i> {m.dish}</span>}
                        {m.dish2 && <span><i>{m.emoji2}</i> {m.dish2}</span>}
                      </span>
                    ) : <span className="hm-names muted">Sin planificar</span>}
                    {m?.done && <span className="done-chip">✓</span>}
                    {isSuggested(m) && <span className="sug-chip">💡</span>}
                    {m?.cook && !isSuggested(m) && m.cook !== 'otros' && <Pic icon={personIcon(m.cook, 'cocinar')} size={34} animate={false} />}
                  </button>
                );
              })}
            </section>
          ))}
        </div>
      ) : (
        <>
          <p className="muted hint">Del {from.slice(8)}/{from.slice(5, 7)} al {to.slice(8)}/{to.slice(5, 7)} · {counts.total} comidas registradas</p>
          <div className="rank-grid">
            <Ranking title="🥣 Primeros" rows={counts.primeros} total={counts.total} />
            <Ranking title="🍗 Segundos" rows={counts.segundos} total={counts.total} />
          </div>
        </>
      )}
    </div>
  );
}
