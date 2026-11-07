'use client';
import { motion } from 'framer-motion';
import { buzz } from '@/lib/helpers';

/** Fila que se borra al deslizar a la izquierda (hay "Deshacer" en el aviso). */
export default function SwipeRow({ onDelete, onClick, children, className = '' }) {
  return (
    <motion.div layout exit={{ opacity: 0, height: 0, marginBottom: 0 }} className="swipe-row">
      <div className="swipe-bg" aria-hidden>🗑️ Borrar</div>
      <motion.div
        className={`swipe-fg ${className}`}
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.6, right: 0 }}
        dragSnapToOrigin
        onDragEnd={(_, i) => {
          if (i.offset.x < -110 || i.velocity.x < -700) {
            buzz(20);
            onDelete();
          }
        }}
        onTap={onClick}
        whileTap={{ scale: 0.985 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
