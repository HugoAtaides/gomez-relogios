-- ============================================================
-- Gomez Relógios - banco para contas e pedidos
-- Execute este script no SQL Editor do Supabase.
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_name text,
  customer_email text,
  status text not null default 'awaiting_payment',
  payment_status text not null default 'created',
  fulfillment_status text not null default 'not_started',
  order_items jsonb not null,
  subtotal numeric(12,2) not null default 0,
  shipping_cost numeric(12,2) not null default 0,
  shipping_name text,
  shipping_deadline integer,
  total numeric(12,2) not null default 0,
  mp_preference_id text,
  mp_payment_id text,
  mp_status text,
  mp_status_detail text,
  tracking_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_external_payment_idx on public.orders(mp_payment_id);
create index if not exists orders_status_idx on public.orders(status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

alter table public.orders enable row level security;

drop policy if exists "Users can view their own orders" on public.orders;
create policy "Users can view their own orders"
on public.orders
for select
to authenticated
using (auth.uid() is not null and auth.uid() = user_id);

-- O cliente não recebe permissão de INSERT/UPDATE/DELETE.
-- O checkout e o webhook usam a chave secreta do backend.

revoke insert, update, delete on public.orders from anon, authenticated;
grant select on public.orders to authenticated;
