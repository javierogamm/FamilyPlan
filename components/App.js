'use client';
import { useEffect, useState } from 'react';
import Login from './Login';
import Shell from './Shell';
import WhoAmI from './WhoAmI';

const K = { code: 'fp_code', me: 'fp_me' };
const get = (k) => { try { return localStorage.getItem(k) || null; } catch { return null; } };
const put = (k, v) => { try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch {} };

export default function App() {
  const [code, setCode] = useState(undefined); // undefined = aún leyendo almacenamiento
  const [me, setMe] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { setMe(get(K.me)); setCode(get(K.code)); }, []);

  const enter = (c) => { put(K.code, c); setError(null); setCode(c); };
  const logout = (e) => {
    put(K.code, null); put(K.me, null);
    if (e?.message) setError(e.message);
    setMe(null); setCode(null);
  };
  const pickMe = (id) => { put(K.me, id); setMe(id); };

  if (code === undefined) return <div className="splash">🏡</div>;
  if (!code) return <Login onEnter={enter} error={error} />;
  if (!me) return <WhoAmI onPick={pickMe} onBack={() => logout()} />;
  return <Shell code={code} me={me} onChangeMe={pickMe} onLogout={logout} />;
}
