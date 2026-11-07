'use client';
import { useEffect } from 'react';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';

/** Hoja inferior arrastrable: se cierra deslizando hacia abajo desde la cabecera. */
export default function Sheet({ open, onClose, title, children, footer }) {
  const controls = useDragControls();
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const esc = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', esc);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="bd" className="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            key="sh"
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 340 }}
            drag="y"
            dragControls={controls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            onDragEnd={(_, i) => (i.offset.y > 110 || i.velocity.y > 600) && onClose()}
          >
            <div className="sheet-top" onPointerDown={(e) => controls.start(e)}>
              <div className="grab" />
              <div className="sheet-head">
                <h2>{title}</h2>
                <button type="button" className="round sm" onClick={onClose} aria-label="Cerrar">✕</button>
              </div>
            </div>
            <div className="sheet-body">{children}</div>
            {footer && <div className="sheet-foot">{footer}</div>}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
