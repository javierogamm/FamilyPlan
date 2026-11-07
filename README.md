# Plan Familiar

App móvil (Next.js 15 + React 19 + Framer Motion) para la gestión semanal del hogar, con persistencia en Supabase y despliegue en Vercel.

**Funciones**: semana laboral L–V · menú de comida y cena con platos prefijados (+ los tuyos) · quién cocina / quién compra / compra lista · ausencias de papá y mamá · eventos y extraescolares (con repetición semanal) · avisos automáticos · PWA instalable · swipe entre días y semanas, swipe para borrar (con "Deshacer").

## Puesta en marcha
1. Supabase: crea un proyecto y ejecuta `supabase/schema.sql` en el SQL Editor.
2. `cp .env.example .env.local` y rellena `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`.
3. `npm install && npm run dev`.

## Vercel
Importa el repo y define `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` (Settings → Environment Variables). No uses prefijo `NEXT_PUBLIC_` para la clave.

## Acceso y seguridad
Sin cuentas de usuario: la familia comparte un **código** (se crea al entrar por primera vez). Todas las tablas tienen RLS activado sin políticas; solo se accede desde las rutas `/api` con la service role key. Quien conozca el código puede ver y editar: usa uno largo y no trivial. No hay límite de intentos (mejora recomendada si se expone públicamente).

## Avisos
Se calculan en cliente (próximos 3 días laborables): comida/cena sin planificar, sin cocinero, cocinero ausente, falta compra o responsable, ambos padres ausentes, eventos de hoy/mañana, y semana siguiente sin planificar (de jueves en adelante). Las notificaciones del sistema se lanzan **al abrir la app**; el push en segundo plano requeriría Web Push + un cron (no incluido).
