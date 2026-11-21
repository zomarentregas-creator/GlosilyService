-- Endurecimento + medição. Aplicar no SQL Editor do Supabase (depois da migração de acompanhamento).

-- 1) Limite de pedidos pelo site: máx. 3 por telefone/hora e 30 por minuto no total.
create or replace function private.throttle_lead()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.source = 'site' then
    if (select count(*) from public.leads where phone = new.phone and created_at > now() - interval '1 hour') >= 3
       or (select count(*) from public.leads where source = 'site' and created_at > now() - interval '1 minute') >= 30 then
      raise exception 'Demasiados pedidos. Tente mais tarde.' using errcode = 'P0001';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists leads_throttle on public.leads;
create trigger leads_throttle before insert on public.leads for each row execute function private.throttle_lead();

-- 2) Consulta de pedidos com bloqueio: 5 falhas por código/15 min e 60 falhas globais/min.
create table if not exists public.track_attempts (
  id bigint generated always as identity primary key,
  code text not null, ok boolean not null default false, at timestamptz not null default now());
create index if not exists track_attempts_code_idx on public.track_attempts (code, at);
alter table public.track_attempts enable row level security;
revoke all on public.track_attempts from anon, authenticated;

create or replace function public.track_order(p_code text, p_phone4 text)
returns table (product text, stage text, public_note text, created_at timestamptz, updated_at timestamptz)
language plpgsql volatile security definer set search_path = public as $$
declare c text := upper(trim(coalesce(p_code, '')));
begin
  delete from public.track_attempts a where a.at < now() - interval '1 day';
  if (select count(*) from public.track_attempts a where a.code = c and a.at > now() - interval '15 minutes') >= 5
     or (select count(*) from public.track_attempts a where a.at > now() - interval '1 minute') >= 60 then
    return;
  end if;
  return query
    select l.product, l.stage, l.public_note, l.created_at, l.updated_at
    from public.leads l
    where l.track_code = c
      and char_length(regexp_replace(coalesce(p_phone4, ''), '\D', '', 'g')) = 4
      and right(regexp_replace(l.phone, '\D', '', 'g'), 4) = regexp_replace(p_phone4, '\D', '', 'g')
    limit 1;
  if not found then insert into public.track_attempts (code) values (c); end if;
end $$;
revoke execute on function public.track_order(text, text) from public;
grant execute on function public.track_order(text, text) to anon, authenticated;

-- 3) Medição simples, sem cookies nem dados pessoais.
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null check (name in ('pageview','quote_submitted','wa_click','track_used','product_view')),
  data text check (data is null or char_length(data) <= 40),
  created_at timestamptz not null default now());
create index if not exists events_created_idx on public.events (created_at desc);
alter table public.events enable row level security;
drop policy if exists events_public_insert on public.events;
create policy events_public_insert on public.events for insert to anon, authenticated with check (true);
drop policy if exists events_staff_read on public.events;
create policy events_staff_read on public.events for select to authenticated using ((select private.is_staff()));
revoke all on public.events from anon, authenticated;
grant insert on public.events to anon, authenticated;
grant select on public.events to authenticated;
