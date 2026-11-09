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
Sin cuentas de usuario: la familia comparte un **código** (no distingue mayúsculas). «Entrar» solo funciona con un código existente; las familias nuevas se crean explícitamente con «Crear familia». Todas las tablas tienen RLS activado sin políticas; solo se accede desde las rutas `/api` con la service role key. Quien conozca el código puede ver y editar: usa uno largo y no trivial. No hay límite de intentos (mejora recomendada si se expone públicamente).

## Avisos
Se calculan en cliente (próximos 3 días laborables): comida/cena sin planificar, sin cocinero, cocinero ausente, falta compra o responsable, ambos padres ausentes, eventos de hoy/mañana, y semana siguiente sin planificar (de jueves en adelante). Las notificaciones del sistema se lanzan **al abrir la app**; el push en segundo plano requeriría Web Push + un cron (no incluido).

## Notificaciones push
Llegan con la app cerrada (Android/Chrome, y iPhone ≥ 16.4 con la app instalada en la pantalla de inicio):
- 30 min antes de cada extraescolar (a quien lleva; a todos si no hay nadie asignado).
- 19:30: platos marcados «Noche antes» para mañana.
- 12:00 y 17:00: tareas del día de cada progenitor (cocinar, comprar, llevar/recoger).

Configuración: claves VAPID y `CRON_SECRET` (ver `.env.example`), tablas de la Migración 9 y un programador externo que llame cada 5 minutos a
`GET /api/cron/notify` con `Authorization: Bearer <CRON_SECRET>`. El cron gratuito de Vercel solo permite una ejecución diaria, por eso se
recomienda `pg_cron` + `pg_net` de Supabase (SQL en la documentación del PR) o el cron de Vercel en plan Pro (`*/5 * * * *`).
