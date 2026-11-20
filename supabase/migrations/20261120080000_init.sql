-- GlosilyService: esquema inicial (já aplicado no projecto Supabase lkghbdeouemtogczidoi)
create extension if not exists pgcrypto;

create table if not exists public.staff (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.staff where user_id = auth.uid());
$$;

create table if not exists public.leads (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 2 and 120),
  phone      text not null check (char_length(phone) between 6 and 30),
  email      text check (email is null or char_length(email) <= 160),
  product    text not null check (char_length(product) between 1 and 160),
  quantity   text check (quantity is null or char_length(quantity) <= 60),
  message    text check (message is null or char_length(message) <= 2000),
  channel    text not null default 'WhatsApp' check (channel in ('WhatsApp', 'E-mail')),
  status     text not null default 'Novo' check (status in ('Novo','Contactado','Qualificado','Fechado','Perdido')),
  notes      text check (notes is null or char_length(notes) <= 4000),
  source     text not null default 'site' check (source in ('site', 'manual')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_status_idx  on public.leads (status);
create index if not exists leads_created_idx on public.leads (created_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_touch on public.leads;
create trigger leads_touch before update on public.leads
  for each row execute function public.touch_updated_at();

create table if not exists public.settings (
  id         boolean primary key default true check (id),
  whatsapp   text not null default '' check (whatsapp ~ '^[0-9]{0,20}$'),
  email      text not null default '' check (char_length(email) <= 160),
  updated_at timestamptz not null default now()
);

insert into public.settings (id) values (true) on conflict do nothing;

drop trigger if exists settings_touch on public.settings;
create trigger settings_touch before update on public.settings
  for each row execute function public.touch_updated_at();

alter table public.staff    enable row level security;
alter table public.leads    enable row level security;
alter table public.settings enable row level security;

drop policy if exists staff_self_read on public.staff;
create policy staff_self_read on public.staff
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists leads_public_insert on public.leads;
create policy leads_public_insert on public.leads
  for insert to anon, authenticated
  with check (status = 'Novo' and source = 'site' and notes is null);

drop policy if exists leads_staff_all on public.leads;
create policy leads_staff_all on public.leads
  for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists settings_public_read on public.settings;
create policy settings_public_read on public.settings
  for select to anon, authenticated using (true);

drop policy if exists settings_staff_write on public.settings;
create policy settings_staff_write on public.settings
  for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

revoke all on public.staff, public.leads, public.settings from anon, authenticated;
grant select on public.staff to authenticated;
grant insert on public.leads to anon, authenticated;
grant select, update, delete on public.leads to authenticated;
grant select on public.settings to anon, authenticated;
grant update on public.settings to authenticated;

revoke execute on function public.is_staff() from public, anon;
grant execute on function public.is_staff() to authenticated;
