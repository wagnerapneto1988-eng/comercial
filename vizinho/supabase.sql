-- Execute este arquivo no SQL Editor do Supabase.
-- Depois crie um usuário no Supabase Auth e adicione o UUID dele em app_admins.

create extension if not exists pgcrypto;

create table if not exists public.diagnosticos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  responsavel text not null,
  contato text,
  nome_projeto text not null,
  status text not null default 'novo'
    check (status in ('novo','em_analise','proposta_enviada','finalizado')),
  respostas jsonb not null default '{}'::jsonb,
  relatorio text not null
);

create table if not exists public.app_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.diagnosticos enable row level security;
alter table public.app_admins enable row level security;

-- Formulário público: permite apenas inserir novos diagnósticos.
drop policy if exists "public_insert_diagnosticos" on public.diagnosticos;
create policy "public_insert_diagnosticos"
on public.diagnosticos
for insert
to anon, authenticated
with check (status = 'novo');

-- Administradores podem consultar diagnósticos.
drop policy if exists "admins_select_diagnosticos" on public.diagnosticos;
create policy "admins_select_diagnosticos"
on public.diagnosticos
for select
to authenticated
using (
  exists (
    select 1 from public.app_admins a
    where a.user_id = auth.uid()
  )
);

-- Administradores podem atualizar status e conteúdo.
drop policy if exists "admins_update_diagnosticos" on public.diagnosticos;
create policy "admins_update_diagnosticos"
on public.diagnosticos
for update
to authenticated
using (
  exists (
    select 1 from public.app_admins a
    where a.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.app_admins a
    where a.user_id = auth.uid()
  )
);

-- Cada usuário autenticado consegue verificar apenas se o próprio UID está em app_admins.
drop policy if exists "admin_self_check" on public.app_admins;
create policy "admin_self_check"
on public.app_admins
for select
to authenticated
using (user_id = auth.uid());

-- Atualização automática de updated_at.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_diagnosticos_updated_at on public.diagnosticos;
create trigger trg_diagnosticos_updated_at
before update on public.diagnosticos
for each row execute function public.set_updated_at();

-- PASSO FINAL:
-- 1) Authentication > Users: crie seu usuário administrador.
-- 2) Copie o UUID dele.
-- 3) Rode:
-- insert into public.app_admins (user_id) values ('COLE-O-UUID-DO-USUARIO-AQUI');
