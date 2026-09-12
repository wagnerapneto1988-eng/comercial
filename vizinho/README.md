# Diagnóstico Graphic Novel + Supabase + Painel

## O que já está pronto
- Diagnóstico em HTML/CSS/JavaScript.
- Geração automática do relatório.
- Gravação na tabela `diagnosticos` do Supabase.
- Painel administrativo com login via Supabase Auth.
- Busca, filtro e alteração de status.
- RLS para impedir leitura pública dos diagnósticos.

## 1. Criar as tabelas
Abra o Supabase > SQL Editor e execute `supabase.sql`.

## 2. Criar o administrador
No Supabase > Authentication > Users, crie um usuário com e-mail e senha.
Copie o UUID do usuário e execute no SQL Editor:

insert into public.app_admins (user_id)
values ('UUID_DO_SEU_USUARIO');

## 3. Configurar o site
Abra `config.js` e substitua:
- `COLE_AQUI_SUA_PROJECT_URL`
- `COLE_AQUI_SUA_ANON_PUBLIC_KEY`

Esses dados ficam em Supabase > Project Settings / API.

A anon/public key pode ser usada no navegador com RLS configurado.
NUNCA use a `service_role` key no frontend.

## 4. Arquivos
- `index.html` — diagnóstico público.
- `painel.html` — painel administrativo.
- `app.js` — formulário + gravação.
- `painel.js` — login + consulta + atualização.
- `style.css` — visual.
- `config.js` — URL e anon key.
- `supabase.sql` — banco e políticas.

## Observação
Este pacote está tecnicamente preparado para o Supabase, mas ele só passa a gravar no SEU projeto depois de você preencher `config.js` e executar `supabase.sql`.
