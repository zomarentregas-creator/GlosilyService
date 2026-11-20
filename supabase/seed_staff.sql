-- Dar acesso à área de gestão a um utilizador.
-- 1) Crie o utilizador em Supabase > Authentication > Users (e-mail + palavra-passe).
-- 2) Substitua o e-mail abaixo e execute no SQL Editor.

insert into public.staff (user_id)
select id from auth.users where email = 'SUBSTITUIR@EMAIL.COM'
on conflict do nothing;
