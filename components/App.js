'use client';
import { useEffect, useState } from 'react';
import Login from './Login';
import Shell from './Shell';
import WhoAmI from './WhoAmI';

const read = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const write = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch {} };

/** Familias guardadas en este navegador: [{code, me}] + familia actual. Migra las claves antiguas (fp_code / fp_me). */
function loadState() {
  let families = [];
  try { families = JSON.parse(read('fp_families')) || []; } catch {}
  let code = read('fp_code');
  if (!families.length && code) families = [{ code, me: read('fp_me') || null }];
  if (!families.some((f) => f.code === code)) code = families[0]?.code ?? null;
  return { families, code };
}

export default function App() {
  const [state, setState] = useState(undefined); // undefined = leyendo almacenamiento
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => setState(loadState()), []);

  const commit = (families, code) => {
    write('fp_families', JSON.stringify(families));
    write('fp_code', code);
    setState({ families, code });
  };
  if (state === undefined) return <div className="splash">🏡</div>;
  const { families, code } = state;
  const current = families.find((f) => f.code === code);

  const enter = (c) => {
    commit(families.some((f) => f.code === c) ? families : [...families, { code: c, me: null }], c);
    setAdding(false);
    setError(null);
  };
  const pickMe = (id) => commit(families.map((f) => (f.code === code ? { ...f, me: id } : f)), code);
  const forget = (c) => {
    const rest = families.filter((f) => f.code !== c);
    commit(rest, c === code ? rest[0]?.code ?? null : code);
  };
  const authError = (e) => { setError(e?.message || null); forget(code); };

  if (!code || adding) return <Login onEnter={enter} error={error} onCancel={code ? () => setAdding(false) : null} />;
  if (!current?.me) return <WhoAmI onPick={pickMe} onBack={() => setAdding(true)} />;
  return (
    <Shell key={code} code={code} me={current.me} families={families} onPickMe={pickMe} onSwitch={(c) => commit(families, c)} onAdd={() => setAdding(true)} onForget={forget} onLogout={authError} />
  );
}
