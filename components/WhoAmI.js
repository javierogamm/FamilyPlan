'use client';
import { motion } from 'framer-motion';
import { PARENTS } from '@/lib/constants';
import { personIcon } from '@/lib/icons';
import { Pic } from './Pic';

export default function WhoAmI({ onPick, onBack }) {
  return (
    <div className="login">
      <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>¿Quién eres?</motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>Así te enseñamos tus tareas y avisos primero.</motion.p>
      <div className="who-grid">
        {PARENTS.map((p, i) => (
          <motion.button key={p.id} type="button" className="who-tile" initial={{ opacity: 0, y: 30, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.15 + i * 0.1, type: 'spring', stiffness: 260, damping: 18 }} whileTap={{ scale: 0.94 }} onClick={() => onPick(p.id)}>
            <Pic icon={personIcon(p.id)} size={150} animate={false} />
            <b>{p.label}</b>
          </motion.button>
        ))}
      </div>
      {onBack && <button type="button" className="link" onClick={onBack}>Cambiar de familia</button>}
    </div>
  );
}
