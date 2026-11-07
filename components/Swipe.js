'use client';
import { AnimatePresence, motion } from 'framer-motion';

const variants = {
  enter: (d) => ({ x: d > 0 ? 70 : -70, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d) => ({ x: d > 0 ? -70 : 70, opacity: 0 }),
};

/** Contenedor que cambia de página al deslizar a izquierda/derecha. `dir`: 1 avanza, -1 retrocede. */
export default function Swipe({ id, dir, onSwipe, children }) {
  return (
    <div className="swipe-host">
      <AnimatePresence mode="popLayout" initial={false} custom={dir}>
        <motion.div
          key={id}
          custom={dir}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'spring', stiffness: 380, damping: 36 }}
          drag="x"
          dragDirectionLock
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.3}
          onDragEnd={(_, { offset, velocity }) => {
            if (offset.x < -70 || velocity.x < -500) onSwipe(1);
            else if (offset.x > 70 || velocity.x > 500) onSwipe(-1);
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
