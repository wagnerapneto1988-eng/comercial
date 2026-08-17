# WAP COMERCIAL — ARQUITETURA CONSOLIDADA

Data de consolidação: 17/08/2026

## 1. Papel do WAP Comercial
O WAP Comercial é o hub principal da WAP Consultoria Digital.
Ele apresenta a empresa, conduz o diagnóstico com o Consultor Migo,
registra a jornada do visitante e direciona para modelos de negócio interativos.

## 2. Página inicial
Elementos definidos:
- Logo WAP Consultoria Digital.
- Frase principal: "Transformamos suas ideias em soluções digitais."
- Consultor Migo como guia da experiência.
- Frase do personagem: "Sou o Consultor Migo. Vamos juntos?"
- Botão principal: "INICIAR DIAGNÓSTICO".
- Menu institucional enxuto:
  - Quem Somos
  - Nossa Missão
  - Modelos de Negócio
- WhatsApp flutuante.
- Número: (11) 98855-5913.
- Mensagem pronta de contato.
- Localização: Taboão da Serra, São Paulo.
- Sem e-mail na abertura.
- Identidade visual: azul predominante, verde complementar e laranja para destaque/CTA.

## 3. Modelos de Negócio
Cada modelo de negócio será desenvolvido como projeto independente em ZIP,
seguindo o mesmo conceito do modelo de pizzaria.

Exemplos:
- Pizzaria: cardápio, carrinho e pedido via WhatsApp.
- Escola: EAD, cursos, aulas, progresso e avaliações.
- Salão/Barbearia: agendamento.
- Loja: catálogo, carrinho e pedidos.
- Pet Shop: serviços e agendamento.
- Assistência Técnica: abertura/acompanhamento de atendimento.

Arquitetura preferida:
- 1 modelo = 1 repositório GitHub.
- 1 demonstração independente por segmento.
- O WAP Comercial funciona como vitrine/hub e aponta para cada modelo.
- Links diretos de cada modelo podem ser usados na prospecção via WhatsApp.

## 4. Jornada do Visitante
Objetivo: automatizar ao máximo a jornada comercial.

Eventos úteis a registrar:
- entrada no site;
- origem do acesso;
- páginas/seções visualizadas;
- clique em menus;
- abertura de modelos de negócio;
- categoria/segmento escolhido;
- início do diagnóstico;
- respostas do diagnóstico;
- conclusão ou abandono;
- interesse em soluções;
- clique no WhatsApp;
- duração aproximada da sessão.

A navegação anônima usa um session_id.
Quando o visitante informar seus dados no diagnóstico, futuramente a sessão
poderá ser associada ao lead.

## 5. Banco de Dados / Supabase
Tabelas atuais:
- public.diagnosticos
- public.jornada_eventos

A tabela jornada_eventos é suficiente para a primeira fase do rastreamento.
Não é necessário criar várias tabelas imediatamente.

Tabela futura opcional:
- public.modelos_negocio
Usar somente quando houver necessidade de cadastrar, ativar, desativar ou
editar modelos diretamente pelo painel administrativo.

## 6. Painel Administrativo
O painel deve evoluir de listagem de registros para inteligência comercial.

Indicadores desejados:
- visitantes;
- sessões;
- diagnósticos iniciados;
- diagnósticos concluídos;
- taxa de conclusão;
- modelos mais acessados;
- segmentos de maior interesse;
- cliques no WhatsApp;
- taxa de conversão;
- origem dos leads;
- linha do tempo por sessão/lead;
- lead frio / interessado / diagnóstico concluído / contato iniciado.

## 7. Infraestrutura
Fase atual:
- GitHub Pages para frontend e demonstrações.
- Supabase para dados, autenticação e eventos.
- Custos mínimos / gratuitos enquanto o volume permitir.

Fase futura:
Se o tráfego aumentar, a migração para infraestrutura paga será feita conforme
necessidade real. O princípio é validar e crescer primeiro, escalar depois.

## 8. Princípio do Projeto
Automatizar ao máximo sem perder simplicidade.
Transformar a navegação em dados úteis.
Usar os modelos de negócio como demonstração comercial real.
Personalizar a abordagem conforme o comportamento do visitante.
Manter transparência e privacidade na coleta de dados.
