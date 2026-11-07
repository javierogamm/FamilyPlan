-- Plan Familiar · esquema Supabase. Ejecutar en SQL Editor.
create extension if not exists pgcrypto;

create table if not exists households (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists meals (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  date date not null,
  slot text not null check (slot in ('comida','cena')),
  dish text not null default '',
  emoji text not null default '🍽️',
  dish2 text not null default '',
  emoji2 text not null default '🍽️',
  cook text check (cook in ('papa','mama','otros')),
  shopper text check (shopper in ('papa','mama','otros')),
  shopping_ok boolean not null default false,
  done boolean not null default false,
  suggested boolean not null default false,
  suggested_by text check (suggested_by in ('papa','mama')),
  needs_buy boolean not null default false,
  cook_when text not null default 'same' check (cook_when in ('same','eve','weekend')),
  note text not null default '',
  updated_at timestamptz not null default now(),
  unique (household_id, date, slot)
);

create table if not exists absences (
  id uuid primary key,
  household_id uuid not null references households(id) on delete cascade,
  person text not null check (person in ('papa','mama')),
  start_date date not null,
  end_date date not null,
  start_time time,
  kind text not null default 'otro' check (kind in ('viaje','trabajo','otro')),
  note text not null default '',
  check (end_date >= start_date)
);

create table if not exists events (
  id uuid primary key,
  household_id uuid not null references households(id) on delete cascade,
  date date not null,
  time time,
  title text not null,
  kind text not null default 'evento' check (kind in ('evento','extraescolar')),
  who text not null default '',
  repeat text not null default 'none' check (repeat in ('none','weekly')),
  emoji text not null default '📌',
  needs_transport boolean not null default false,
  transport text check (transport in ('papa','mama')),
  activity text not null default '',
  series_id uuid,
  location text not null default 'outside' check (location in ('school','outside')),
  icon text not null default ''
);

create table if not exists shopping (
  id uuid primary key,
  household_id uuid not null references households(id) on delete cascade,
  store text not null check (store in ('super','fruteria','carniceria','pascual','otros')),
  items text not null default '',
  shopper text check (shopper in ('papa','mama','otros')),
  date date,
  done boolean not null default false,
  created_at timestamptz not null default now(),
  list_id text
);
create index if not exists shopping_hh on shopping (household_id, done, date);

create table if not exists dishes (
  id uuid primary key,
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  emoji text not null default '🍽️',
  course text not null default 'both' check (course in ('primero','segundo','both')),
  unique (household_id, name)
);

create index if not exists meals_hh_date on meals (household_id, date);
create index if not exists absences_hh_end on absences (household_id, end_date);
create index if not exists events_hh_date on events (household_id, date);

-- Migración 8 (varias listas de la compra y asociar compras a una lista):
create table if not exists lists (
  id uuid primary key,
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  emoji text not null default '🧾',
  created_at timestamptz not null default now()
);
alter table lists disable row level security;
alter table list_items add column if not exists list_id text not null default 'main';
alter table shopping add column if not exists list_id text;
create index if not exists list_items_list on list_items (household_id, list_id);

-- Migración 7 (lista de la compra):
create table if not exists list_items (
  id uuid primary key,
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  store text not null default 'super' check (store in ('super','fruteria','carniceria','pascual','otros')),
  list_id text not null default 'main',
  qty int not null default 1,
  carry int not null default 0,
  checked boolean not null default false,
  added_by text check (added_by in ('papa','mama')),
  created_at timestamptz not null default now()
);
create index if not exists list_items_hh on list_items (household_id, checked);
create table if not exists item_stock (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  name_key text not null,
  store text not null default 'super' check (store in ('super','fruteria','carniceria','pascual','otros')),
  emoji text not null default '🛒',
  uses int not null default 0,
  last_used date,
  unique (household_id, name_key)
);
alter table list_items disable row level security;
alter table item_stock disable row level security;

-- Migración 6 (comida sugerida):
alter table meals add column if not exists suggested boolean not null default false;
alter table meals add column if not exists suggested_by text check (suggested_by in ('papa','mama'));

-- Migración 5 (primero y segundo, platos propios por curso):
alter table meals add column if not exists dish2 text not null default '';
alter table meals add column if not exists emoji2 text not null default '🍽️';
alter table dishes add column if not exists course text not null default 'both' check (course in ('primero','segundo','both'));

-- Migración 4 (hora de inicio de viajes / trabajo):
alter table absences add column if not exists start_time time;

-- Migración 3 (extraescolares recurrentes, lugar, icono, viaje/trabajo):
alter table events add column if not exists series_id uuid;
alter table events add column if not exists location text not null default 'outside' check (location in ('school','outside'));
alter table events add column if not exists icon text not null default '';
alter table absences add column if not exists kind text not null default 'otro' check (kind in ('viaje','trabajo','otro'));
create index if not exists events_series on events (household_id, series_id, date);

-- Migración para bases ya creadas (iconos, transporte, comidas hechas, cuándo se cocina y compras):
alter table meals add column if not exists needs_buy boolean not null default false;
alter table meals add column if not exists cook_when text not null default 'same' check (cook_when in ('same','eve','weekend'));
create table if not exists shopping (id uuid primary key, household_id uuid not null references households(id) on delete cascade, store text not null check (store in ('super','fruteria','carniceria','pascual','otros')), items text not null default '', shopper text check (shopper in ('papa','mama','otros')), date date, done boolean not null default false, created_at timestamptz not null default now());
create index if not exists shopping_hh on shopping (household_id, done, date);
alter table shopping disable row level security;
alter table meals add column if not exists done boolean not null default false;
alter table events add column if not exists needs_transport boolean not null default false;
alter table events add column if not exists transport text check (transport in ('papa','mama'));
alter table events add column if not exists activity text not null default '';

-- Sin RLS (el acceso es solo desde el servidor con la service role key).
alter table households disable row level security;
alter table meals      disable row level security;
alter table absences   disable row level security;
alter table events     disable row level security;
alter table dishes     disable row level security;
-- Opcional: impedir acceso por la API pública de Supabase
-- revoke all on households, meals, absences, events, dishes from anon, authenticated;
