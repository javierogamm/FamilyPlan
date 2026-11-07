'use client';
import { EVENT_EMOJIS } from '@/lib/constants';
import { buzz } from '@/lib/helpers';
import { ILLUS_ICONS, iconByKey } from '@/lib/icons';
import { Pic } from './Pic';

/** Elige el icono de una extraescolar: ilustrado (según niños) o emoji. onPick({icon, activity, emoji?, kids?}). */
export default function IconPicker({ kids, icon, emoji, onPick }) {
  const list = ILLUS_ICONS.filter((i) => !kids.length || i.kids.some((k) => kids.includes(k)));
  return (
    <>
      <div className="icon-grid">
        {list.map((i) => (
          <button key={i.key} type="button" className={`icon-opt${icon === i.key ? ' on' : ''}`} onClick={() => { buzz(); onPick({ icon: i.key, activity: i.activity, emoji: i.emoji, kids: i.kids }); }}>
            <Pic icon={iconByKey(i.key)} size={64} animate={false} />
            <small>{i.label}</small>
          </button>
        ))}
      </div>
      <div className="emoji-row">
        {EVENT_EMOJIS.map((e) => (
          <button key={e} type="button" className={!icon && e === emoji ? 'on' : ''} onClick={() => { buzz(); onPick({ icon: '', activity: '', emoji: e }); }}>{e}</button>
        ))}
      </div>
    </>
  );
}
