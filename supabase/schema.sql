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
  cook text check (cook in ('papa','mama','otros')),
  shopper text check (shopper in ('papa','mama','otros')),
  shopping_ok boolean not null default false,
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
  emoji text not null default '📌'
);

create table if not exists dishes (
  id uuid primary key,
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  emoji text not null default '🍽️',
  unique (household_id, name)
);

create index if not exists meals_hh_date on meals (household_id, date);
create index if not exists absences_hh_end on absences (household_id, end_date);
create index if not exists events_hh_date on events (household_id, date);

-- RLS activado SIN políticas: el acceso público directo queda denegado.
-- La app accede solo desde el servidor (rutas /api) con la service role key.
alter table households enable row level security;
alter table meals enable row level security;
alter table absences enable row level security;
alter table events enable row level security;
alter table dishes enable row level security;
