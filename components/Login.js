'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Login({ onEnter, error }) {
  const [code, setCode] = useState('');
  const ok = code.trim().length >= 4;
  return (
    <div className="login">
      <motion.div className="login-logo" initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 12 }}>🏡</motion.div>
      <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>Plan Familiar</motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>Menús, compra, ausencias y agenda de toda la semana.</motion.p>
      <motion.form initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} onSubmit={(e) => { e.preventDefault(); ok && onEnter(code.trim()); }}>
        <label htmlFor="code">Código de familia</label>
        <input id="code" className="field" value={code} onChange={(e) => setCode(e.target.value)} placeholder="ej. casa-garcia-2026" autoCapitalize="none" autoCorrect="off" autoComplete="off" maxLength={64} />
        {error && <div className="form-error">{error}</div>}
        <button className="btn primary" disabled={!ok} type="submit">Entrar</button>
        <small>Si el código no existe se crea una familia nueva. Compártelo solo con quien viva contigo: quien lo conozca verá y editará el plan.</small>
      </motion.form>
    </div>
  );
}
