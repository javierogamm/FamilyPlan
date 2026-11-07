'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Segmented } from './ui';

const MODES = [{ value: 'login', label: 'Entrar' }, { value: 'create', label: 'Crear familia' }];

export default function Login({ onEnter, onCancel, error: initialError }) {
  const [mode, setMode] = useState('login');
  const [code, setCode] = useState('');
  const [error, setError] = useState(initialError);
  const [busy, setBusy] = useState(false);
  const ok = code.trim().length >= 4;
  const create = mode === 'create';

  const submit = async (e) => {
    e.preventDefault();
    if (!ok || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/household', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ code, mode }) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'No se pudo conectar');
      onEnter(json.code);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="login">
      <motion.div className="login-logo" initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 12 }}>🏡</motion.div>
      <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>Plan Familiar</motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>Menús, compras, ausencias y agenda de toda la semana.</motion.p>
      <motion.form initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} onSubmit={submit}>
        <Segmented name="login-mode" value={mode} onChange={(m) => { setMode(m); setError(null); }} options={MODES} />
        <label htmlFor="code">Código de familia</label>
        <input id="code" className="field" value={code} onChange={(e) => setCode(e.target.value)} placeholder="ej. casa-garcia-2026" autoCapitalize="none" autoCorrect="off" autoComplete="off" spellCheck={false} maxLength={64} />
        {error && <div className="form-error">{error}</div>}
        <button className="btn primary" disabled={!ok || busy} type="submit">{busy ? 'Un momento…' : create ? 'Crear familia' : 'Entrar'}</button>
        {onCancel && <button type="button" className="link" onClick={onCancel}>← Volver a mi familia</button>}
        <small>
          {create
            ? 'Elige un código que solo conozcáis vosotros (mínimo 4 caracteres). No distingue mayúsculas de minúsculas.'
            : 'Usa el mismo código en todos los dispositivos para ver los mismos datos. No distingue mayúsculas de minúsculas.'}
        </small>
      </motion.form>
    </div>
  );
}
