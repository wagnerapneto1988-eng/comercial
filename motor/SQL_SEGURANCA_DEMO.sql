-- Opcional/recomendado antes de publicar a demo.
-- Permite somente leitura pública dos dados necessários à vitrine.

alter table public.empresas_demo enable row level security;
alter table public.produtos_demo enable row level security;

create policy "demo_empresas_select_publico"
on public.empresas_demo for select
to anon
using (true);

create policy "demo_produtos_select_publico"
on public.produtos_demo for select
to anon
using (ativo = true);

-- Não é necessário expor analises_demo nem propostas_demo ao site público.
-- Caso você habilite RLS nelas, não crie policy pública de SELECT.
