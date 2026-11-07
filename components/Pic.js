'use client';
import { motion } from 'framer-motion';

/** Icono ilustrado circular. `icon` viene de lib/icons. Con size ≤ 52 usa la versión recortada (sin cartel). */
export function Pic({ icon, size = 48, ring, className = '', animate = true }) {
  if (!icon) return null;
  const small = size <= 52;
  const img = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={small ? icon.small : icon.src} alt={icon.label} width={size} height={size} loading="lazy" draggable={false} />
      {icon.badge && <i className="pic-badge" style={{ fontSize: Math.max(11, size * 0.34) }}>{icon.badge}</i>}
    </>
  );
  const style = { width: size, height: size };
  const cls = `pic${small ? ' small' : ''}${ring ? ' ring' : ''} ${className}`;
  return animate ? (
    <motion.span className={cls} style={style} initial={{ scale: 0.4, rotate: -12, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 380, damping: 17 }}>
      {img}
    </motion.span>
  ) : (
    <span className={cls} style={style}>{img}</span>
  );
}

/** Varios iconos solapados (p. ej. dos hermanos). */
export function PicStack({ icons, size = 44 }) {
  return (
    <span className="pic-stack">
      {icons.map((ic, i) => <Pic key={ic.key} icon={ic} size={size} ring animate={false} className={i ? 'second' : ''} />)}
    </span>
  );
}
