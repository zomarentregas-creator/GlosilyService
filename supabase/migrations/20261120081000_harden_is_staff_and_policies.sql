-- Move is_staff() para um esquema privado (fora da API) e simplifica as políticas.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.staff where user_id = (select auth.uid()));
$$;

revoke execute on function private.is_staff() from public, anon;
grant execute on function private.is_staff() to authenticated;

drop policy if exists leads_staff_all on public.leads;
create policy leads_staff_all on public.leads
  for all to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));

drop policy if exists settings_staff_write on public.settings;
create policy settings_staff_write on public.settings
  for update to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));

drop policy if exists leads_public_insert on public.leads;
create policy leads_public_insert on public.leads
  for insert to anon
  with check (status = 'Novo' and source = 'site' and notes is null);

drop function if exists public.is_staff();
