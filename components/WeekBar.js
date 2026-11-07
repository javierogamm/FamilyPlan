'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { DAY_SHORT, dayNum, mondayOf, startDay, weekDays, weekTitle } from '@/lib/dates';
import { absentOn, eventsOn } from '@/lib/helpers';
import { personIcon } from '@/lib/icons';
import { Pic } from './Pic';

export default function WeekBar({ me, onMe, monday, selected, today, showDays, data, onSelect, onShift, onToday }) {
  const { title, range } = weekTitle(monday);
  const isThisWeek = mondayOf(startDay(today)) === monday;
  return (
    <header className="weekbar">
      <div className="wb-top">
        <div>
          <h1>{title}</h1>
          <p>Semana {range}</p>
        </div>
        <div className="wb-actions">
          {me && <button type="button" className="me-btn" aria-label="Cambiar de persona" onClick={onMe}><Pic icon={personIcon(me)} size={40} animate={false} ring /></button>}
          <AnimatePresence>
            {!isThisWeek && (
              <motion.button key="today" type="button" className="chip-btn" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }} onClick={onToday}>
                Hoy
              </motion.button>
            )}
          </AnimatePresence>
          <button type="button" className="round" aria-label="Semana anterior" onClick={() => onShift(-1)}>‹</button>
          <button type="button" className="round" aria-label="Semana siguiente" onClick={() => onShift(1)}>›</button>
        </div>
      </div>
      {showDays && (
        <div className="days" role="tablist">
          {weekDays(monday).map((d, i) => {
            const sel = d === selected;
            const away = absentOn(data.absences, d);
            const hasEv = eventsOn(data.events, d).length > 0;
            return (
              <button key={d} type="button" role="tab" aria-selected={sel} className={`day${sel ? ' sel' : ''}${d === today ? ' today' : ''}`} onClick={() => onSelect(d)}>
                {sel && <motion.span layoutId="daypill" className="day-pill" transition={{ type: 'spring', stiffness: 450, damping: 34 }} />}
                <span className="dl">{DAY_SHORT[i]}</span>
                <span className="dn">{dayNum(d)}</span>
                <span className="dots">
                  {away.map((p) => <i key={p} className={`dot dot-${p}`} />)}
                  {hasEv && <i className="dot dot-ev" />}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
