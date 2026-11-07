'use client';
import { useEffect, useState } from 'react';
import Login from './Login';
import Shell from './Shell';

const KEY = 'fp_code';

export default function App() {
  const [code, setCode] = useState(undefined); // undefined = aún leyendo almacenamiento
  const [error, setError] = useState(null);

  useEffect(() => {
    try { setCode(localStorage.getItem(KEY) || null); } catch { setCode(null); }
  }, []);

  const enter = (c) => {
    try { localStorage.setItem(KEY, c); } catch {}
    setError(null);
    setCode(c);
  };
  const logout = (e) => {
    try { localStorage.removeItem(KEY); } catch {}
    if (e?.message) setError(e.message);
    setCode(null);
  };

  if (code === undefined) return <div className="splash">🏡</div>;
  return code ? <Shell code={code} onLogout={logout} /> : <Login onEnter={enter} error={error} />;
}
