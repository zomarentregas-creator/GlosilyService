-- Acompanhamento público de pedidos por código + últimos 4 dígitos do telefone.
-- Aplicar ANTES de publicar o site novo (SQL Editor do Supabase).
create or replace function public.gen_track_code()
returns text language sql volatile as $$
  select 'GLS-' || string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 1 + floor(random()*32)::int, 1), '')
  from generate_series(1,6)
$$;

alter table public.leads
  add column if not exists track_code  text,
  add column if not exists stage       text not null default 'Pedido recebido',
  add column if not exists public_note text;

update public.leads set track_code = public.gen_track_code() where track_code is null;

alter table public.leads
  alter column track_code set default public.gen_track_code(),
  alter column track_code set not null;

alter table public.leads drop constraint if exists leads_stage_check;
alter table public.leads add constraint leads_stage_check check (stage in
  ('Pedido recebido','Cotação enviada','Confirmado','Em trânsito','Desalfandegamento','Pronto para levantar','Entregue','Cancelado'));
alter table public.leads drop constraint if exists leads_track_code_check;
alter table public.leads add constraint leads_track_code_check check (track_code ~ '^GLS-[A-HJ-NP-Z2-9]{6}$');
alter table public.leads drop constraint if exists leads_public_note_check;
alter table public.leads add constraint leads_public_note_check check (public_note is null or char_length(public_note) <= 300);
create unique index if not exists leads_track_code_key on public.leads (track_code);

-- O público só pode criar pedidos "limpos" (sem estado avançado nem nota interna).
drop policy if exists leads_public_insert on public.leads;
create policy leads_public_insert on public.leads
  for insert to anon
  with check (status = 'Novo' and source = 'site' and notes is null
              and stage = 'Pedido recebido' and public_note is null);

-- Consulta pública: devolve só dados não pessoais e exige código + 4 dígitos do telefone.
create or replace function public.track_order(p_code text, p_phone4 text)
returns table (product text, stage text, public_note text, created_at timestamptz, updated_at timestamptz)
language sql stable security definer set search_path = public as $$
  select l.product, l.stage, l.public_note, l.created_at, l.updated_at
  from public.leads l
  where l.track_code = upper(trim(p_code))
    and char_length(regexp_replace(coalesce(p_phone4,''), '\D', '', 'g')) = 4
    and right(regexp_replace(l.phone, '\D', '', 'g'), 4) = regexp_replace(p_phone4, '\D', '', 'g')
  limit 1
$$;
revoke execute on function public.track_order(text, text) from public;
grant execute on function public.track_order(text, text) to anon, authenticated;
