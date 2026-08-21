/* =========================================================
   WAP MOTOR COMERCIAL
   IMPACTO V04
   script.js

   OBJETIVO:
   - carregar empresa por ?cliente=slug
   - manter template visual fixo
   - alterar principalmente logo, nome, contatos e produtos
   - mostrar 2 sinais positivos + 3 oportunidades
   - carrinho com CONTINUAR PEDINDO / FINALIZAR
   - finalizar com WhatsApp, pagamento ilustrativo,
     voltar ao início, consultoria e diagnóstico
   ========================================================= */

"use strict";


/* =========================================================
   ESTADO
   ========================================================= */

let EMPRESA = null;
let produtos = [];
let carrinho = [];
let filtroAtivo = "todas";
let ultimoFoco = null;


/* =========================================================
   FALLBACK DE PRODUTOS
   ========================================================= */

const PRODUTOS_FALLBACK = [
  {
    id: 1,
    nome: "Mussarela",
    categoria: "Clássicas",
    descricao: "Mussarela derretida e orégano.",
    preco: 39.90,
    imagem_url: "assets/produto_02_mussarela.jpg",
    preco_publico: false
  },
  {
    id: 2,
    nome: "Calabresa",
    categoria: "Clássicas",
    descricao: "Calabresa, cebola e orégano.",
    preco: 41.90,
    imagem_url: "assets/produto_01_calabresa.jpg",
    preco_publico: false
  },
  {
    id: 3,
    nome: "Portuguesa",
    categoria: "Especiais",
    descricao: "Presunto, ovos, cebola e azeitonas.",
    preco: 42.90,
    imagem_url: "assets/produto_03_portuguesa.jpg",
    preco_publico: false
  },
  {
    id: 4,
    nome: "Frango com Catupiry",
    categoria: "Especiais",
    descricao: "Frango desfiado com catupiry.",
    preco: 45.90,
    imagem_url: "assets/produto_04_frango.jpg",
    preco_publico: false
  },
  {
    id: 5,
    nome: "Chocolate",
    categoria: "Doces",
    descricao: "Chocolate ao leite.",
    preco: 34.90,
    imagem_url: "assets/produto_06_chocolate.jpg",
    preco_publico: false
  }
];


/* =========================================================
   HELPERS
   ========================================================= */

const $ = (selector, root = document) =>
  root.querySelector(selector);

const $$ = (selector, root = document) =>
  [...root.querySelectorAll(selector)];

const money = value =>
  Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function setText(selector, text) {
  const el = $(selector);
  if (el) {
    el.textContent = text;
  }
}

function setAttr(selector, attr, value) {
  const el = $(selector);

  if (
    el &&
    value !== undefined &&
    value !== null
  ) {
    el.setAttribute(attr, value);
  }
}

function safeImage(element, fallback) {
  if (!element) return;

  element.addEventListener(
    "error",
    () => {
      element.src = fallback;
    },
    { once: true }
  );
}

function normalizePhone(value) {
  return String(value || "")
    .replace(/\D/g, "");
}

function instagramHandle(url) {
  if (!url) {
    return "Instagram não informado";
  }

  try {
    const parsed = new URL(url);

    const handle = parsed.pathname
      .replace(/\//g, "");

    return handle
      ? `@${handle}`
      : "Instagram";
  } catch {
    return url;
  }
}

function prefersReducedMotion() {
  return (
    window
      .matchMedia?.(
        "(prefers-reduced-motion: reduce)"
      )
      .matches || false
  );
}


/* =========================================================
   FALLBACK DE IMAGEM
   ========================================================= */

function imageFallback(nome) {
  const normalized = slugify(nome);

  if (normalized.includes("calabresa")) {
    return "assets/produto_01_calabresa.jpg";
  }

  if (
    normalized.includes("mussarela") ||
    normalized.includes("mucarela")
  ) {
    return "assets/produto_02_mussarela.jpg";
  }

  if (normalized.includes("portuguesa")) {
    return "assets/produto_03_portuguesa.jpg";
  }

  if (normalized.includes("frango")) {
    return "assets/produto_04_frango.jpg";
  }

  if (normalized.includes("bacon")) {
    return "assets/produto_05_bacon.jpg";
  }

  if (
    normalized.includes("chocolate") ||
    normalized.includes("doce")
  ) {
    return "assets/produto_06_chocolate.jpg";
  }

  return "assets/pizza_hero_01.jpg";
}


/* =========================================================
   CONSULTOR MIGO
   ========================================================= */

function configurarMigo() {
  const img = $("#migoImage");
  const fallback = $("#migoFallback");

  if (!img) return;

  const candidatos = [
    "../assets/migo.png",
    "../assets/consultor-migo.png",
    "../assets/consultor_migo.png",
    "../assets/migo-consultor.png",
    "assets/migo.png",
    "assets/consultor-migo.png"
  ];

  let indice = 0;

  function tentarProxima() {
    if (indice >= candidatos.length) {
      img.style.display = "none";

      if (fallback) {
        fallback.style.display = "grid";
      }

      return;
    }

    img.src = candidatos[indice];
    indice += 1;
  }

  img.onload = () => {
    img.style.display = "block";

    if (fallback) {
      fallback.style.display = "none";
    }
  };

  img.onerror = tentarProxima;

  tentarProxima();
}

function fecharIntro() {
  const intro = $("#migoIntro");

  if (!intro) return;

  intro.classList.add("hidden");

  document.body.classList.remove(
    "intro-open"
  );

  window.setTimeout(() => {
    intro.setAttribute(
      "aria-hidden",
      "true"
    );
  }, 350);
}


/* =========================================================
   OBSERVAÇÕES
   ========================================================= */

function montarSinaisPositivos(empresa) {
  const positivos = [];

  if (empresa.logo_url) {
    positivos.push({
      titulo:
        "Identidade visual disponível",
      texto:
        "A marca possui elementos visuais que podem ser preservados na experiência digital.",
      verificado:
        true
    });
  }

  if (empresa.instagram_url) {
    positivos.push({
      titulo:
        "Presença nas redes sociais",
      texto:
        "Existe um canal público que ajuda a marca a ser encontrada e reconhecida.",
      verificado:
        true
    });
  }

  if (empresa.whatsapp) {
    positivos.push({
      titulo:
        "Canal direto de atendimento",
      texto:
        "O estabelecimento já possui um caminho direto de contato com o cliente.",
      verificado:
        true
    });
  }

  if (
    empresa.avaliacao &&
    Number(empresa.avaliacao) >= 4
  ) {
    positivos.push({
      titulo:
        "Boa percepção pública",
      texto:
        "A avaliação disponível indica percepção positiva que pode ser valorizada na apresentação digital.",
      verificado:
        true
    });
  }

  while (positivos.length < 2) {
    positivos.push({
      titulo:
        positivos.length === 0
          ? "Produto com forte apelo visual"
          : "Potencial de comunicação local",

      texto:
        positivos.length === 0
          ? "O segmento permite destacar produtos de maneira simples e atraente em uma experiência de pedido."
          : "A proximidade com o público facilita uma comunicação direta e objetiva.",

      verificado:
        false
    });
  }

  return positivos.slice(0, 2);
}

function montarMelhorias(empresa) {
  const melhorias = [];

  if (!empresa.site_url) {
    melhorias.push({
      titulo:
        "Criar um ponto digital próprio",
      texto:
        "Uma experiência própria pode concentrar produtos, informações e pedido sem depender apenas das redes sociais.",
      verificado:
        true
    });
  } else {
    melhorias.push({
      titulo:
        "Simplificar a jornada de pedido",
      texto:
        "Mesmo com presença digital, sempre existe oportunidade de reduzir etapas entre escolha e finalização.",
      verificado:
        false
    });
  }

  melhorias.push({
    titulo:
      "Organizar melhor a escolha dos produtos",
    texto:
      "Categorias, imagens e preços bem hierarquizados ajudam o cliente a decidir com mais rapidez.",
    verificado:
      false
  });

  if (empresa.whatsapp) {
    melhorias.push({
      titulo:
        "Enviar o pedido mais organizado ao WhatsApp",
      texto:
        "O cliente pode montar a seleção antes de iniciar a conversa, reduzindo mensagens soltas no atendimento.",
      verificado:
        true
    });
  } else {
    melhorias.push({
      titulo:
        "Criar uma ação principal clara",
      texto:
        "A experiência precisa mostrar imediatamente como o cliente pode concluir o pedido.",
      verificado:
        false
    });
  }

  return melhorias.slice(0, 3);
}

function renderObservacoes(empresa) {
  const positivos =
    montarSinaisPositivos(empresa);

  const melhorias =
    montarMelhorias(empresa);

  const positiveBox =
    $("#positiveObservations");

  const improvementBox =
    $("#improvementObservations");

  if (positiveBox) {
    positiveBox.innerHTML =
      positivos
        .map(
          (item, index) => `
            <article class="observation-item">

              <span class="observation-item-index">
                ${index + 1}
              </span>

              <div>
                <strong>
                  ${escapeHtml(item.titulo)}
                </strong>

                <p>
                  ${escapeHtml(item.texto)}
                </p>

                ${
                  item.verificado
                    ? `
                      <span class="verified-badge">
                        ✓ informação pública encontrada
                      </span>
                    `
                    : ""
                }
              </div>

            </article>
          `
        )
        .join("");
  }

  if (improvementBox) {
    improvementBox.innerHTML =
      melhorias
        .map(
          (item, index) => `
            <article class="observation-item">

              <span class="observation-item-index">
                ${index + 1}
              </span>

              <div>
                <strong>
                  ${escapeHtml(item.titulo)}
                </strong>

                <p>
                  ${escapeHtml(item.texto)}
                </p>

                ${
                  item.verificado
                    ? `
                      <span class="verified-badge">
                        ✓ informação pública encontrada
                      </span>
                    `
                    : ""
                }
              </div>

            </article>
          `
        )
        .join("");
  }
}


/* =========================================================
   EMPRESA
   ========================================================= */

function applyEmpresa(empresa) {
  EMPRESA = empresa || {};

  const nome =
    EMPRESA.nome ||
    "Pizzaria Demo";

  document.title =
    `${nome} | Modelo de Delivery`;

  setAttr(
    "#pageDescription",
    "content",
    `${nome} — demonstração funcional de delivery criada pela WAP.`
  );

  setText(
    "#brandName",
    nome.toUpperCase()
  );

  setText(
    "#footerBrand",
    nome.toUpperCase()
  );

  setText(
    "#contactPhone",
    `💬 ${
      EMPRESA.whatsapp ||
      "WhatsApp não informado"
    }`
  );

  setText(
    "#contactInstagram",
    `📷 ${
      instagramHandle(
        EMPRESA.instagram_url
      )
    }`
  );

  setText(
    "#contactLocation",
    `📍 ${
      [
        EMPRESA.cidade,
        EMPRESA.estado
      ]
        .filter(Boolean)
        .join(" - ")
        ||
        "Localização não informada"
    }`
  );

  setText(
    "#heroDescription",
    EMPRESA.descricao_curta ||
    `Uma experiência de pedido limpa, visual e funcional preparada para ${nome}.`
  );

  const logo =
    EMPRESA.logo_url ||
    "assets/logo.jpg";

  [
    "#brandLogo",
    "#contactLogo"
  ].forEach(selector => {
    const img = $(selector);

    if (!img) return;

    img.src = logo;
    img.alt = nome;

    safeImage(
      img,
      "assets/pizza_hero_01.jpg"
    );
  });

  const hero =
    $("#heroPizza");

  if (hero) {
    hero.src =
      EMPRESA.hero_image_url ||
      "assets/pizza_hero_01.jpg";

    hero.alt =
      `Produto em destaque de ${nome}`;

    safeImage(
      hero,
      "assets/pizza_hero_01.jpg"
    );
  }

  const delivery =
    $("#deliveryBike");

  if (delivery) {
    delivery.src =
      EMPRESA.delivery_image_url ||
      "assets/delivery_01.jpg";

    delivery.alt =
      `Entrega de ${nome}`;

    safeImage(
      delivery,
      "assets/delivery_01.jpg"
    );
  }

  renderObservacoes(
    EMPRESA
  );
}


/* =========================================================
   FILTROS
   ========================================================= */

function renderFilters() {
  const box = $("#filters");

  if (!box) return;

  const categorias = [
    ...new Set(
      produtos
        .map(p => p.categoria)
        .filter(Boolean)
    )
  ];

  box.innerHTML =
    `
      <button
        type="button"
        data-filter="todas"
        class="${
          filtroAtivo === "todas"
            ? "active"
            : ""
        }"
      >
        Todas
      </button>
    `
    +
    categorias
      .map(categoria => {
        const slug =
          slugify(categoria);

        return `
          <button
            type="button"
            data-filter="${escapeHtml(slug)}"
            class="${
              filtroAtivo === slug
                ? "active"
                : ""
            }"
          >
            ${escapeHtml(categoria)}
          </button>
        `;
      })
      .join("");
}


/* =========================================================
   PREÇO
   ========================================================= */

function priceLabel(produto) {
  if (
    produto.preco === null ||
    produto.preco === undefined ||
    Number(produto.preco) <= 0
  ) {
    return "Consulte";
  }

  return money(
    produto.preco
  );
}


/* =========================================================
   PRODUTOS
   ========================================================= */

function renderProdutos(
  filtro = filtroAtivo
) {
  const grid =
    $("#pizzaGrid");

  if (!grid) return;

  filtroAtivo =
    filtro || "todas";

  const lista =
    filtroAtivo === "todas"
      ? produtos
      : produtos.filter(
          produto =>
            slugify(
              produto.categoria
            ) === filtroAtivo
        );

  grid.classList.add(
    "is-updating"
  );

  if (!lista.length) {
    grid.innerHTML =
      `
        <div class="empty">
          Nenhum item encontrado nesta categoria.
        </div>
      `;

    grid.classList.remove(
      "is-updating"
    );

    return;
  }

  grid.innerHTML =
    lista
      .map(produto => {
        const fallback =
          imageFallback(
            produto.nome
          );

        return `
          <article
            class="card"
            data-product-id="${produto.id}"
          >

            <div class="card-media">

              <img
                src="${escapeHtml(
                  produto.imagem_url ||
                  fallback
                )}"
                alt="${escapeHtml(
                  produto.nome
                )}"
                loading="lazy"
                decoding="async"
                onerror="
                  this.onerror=null;
                  this.src='${escapeHtml(fallback)}'
                "
              >

            </div>


            <div class="card-body">

              <div class="card-copy">

                <h3>
                  ${escapeHtml(
                    produto.nome
                  )}
                </h3>

                <p>
                  ${escapeHtml(
                    produto.descricao ||
                    "Item do cardápio."
                  )}
                </p>

              </div>


              <div class="card-bottom">

                <span class="price">

                  ${escapeHtml(
                    priceLabel(
                      produto
                    )
                  )}

                  ${
                    produto.preco_publico
                      ? `
                        <small class="public-price">
                          preço público
                        </small>
                      `
                      : ""
                  }

                </span>


                <button
                  class="add-btn"
                  type="button"
                  data-add-product="${produto.id}"
                >
                  + ADICIONAR
                </button>

              </div>

            </div>

          </article>
        `;
      })
      .join("");

  requestAnimationFrame(() => {
    grid.classList.remove(
      "is-updating"
    );
  });

  setupCardInteractions();
}


/* =========================================================
   CARRINHO
   ========================================================= */

function addToCart(
  id,
  button = null
) {
  const produto =
    produtos.find(
      item =>
        String(item.id) ===
        String(id)
    );

  if (!produto) return;

  const existente =
    carrinho.find(
      item =>
        String(item.id) ===
        String(id)
    );

  if (existente) {
    existente.qtd += 1;
  } else {
    carrinho.push({
      ...produto,
      qtd: 1
    });
  }

  updateCart();

  animateAddButton(
    button
  );

  pulseCartButton();

  showToast(
    `${produto.nome} adicionado.`,
    "success"
  );

  /* CORREÇÃO:
     sempre abre o carrinho após adicionar
     para mostrar:
     CONTINUAR PEDINDO / FINALIZAR PEDIDO
  */
  openCart();
}

function changeQty(
  id,
  delta
) {
  const item =
    carrinho.find(
      produto =>
        String(produto.id) ===
        String(id)
    );

  if (!item) return;

  item.qtd +=
    Number(delta);

  if (item.qtd <= 0) {
    carrinho =
      carrinho.filter(
        produto =>
          String(produto.id) !==
          String(id)
      );
  }

  updateCart();
}

function removeItem(id) {
  const produto =
    carrinho.find(
      item =>
        String(item.id) ===
        String(id)
    );

  carrinho =
    carrinho.filter(
      item =>
        String(item.id) !==
        String(id)
    );

  updateCart();

  if (produto) {
    showToast(
      `${produto.nome} removido.`,
      "info"
    );
  }
}

function totalCarrinho() {
  return carrinho.reduce(
    (total, item) =>
      total +
      (
        Number(item.preco) ||
        0
      ) *
      item.qtd,
    0
  );
}

function quantidadeCarrinho() {
  return carrinho.reduce(
    (total, item) =>
      total +
      item.qtd,
    0
  );
}

function updateCart() {
  const count =
    quantidadeCarrinho();

  const total =
    totalCarrinho();

  setText(
    "#cartCount",
    count
  );

  setText(
    "#menuCartCount",
    count
  );

  setText(
    "#cartTotal",
    money(total)
  );

  const box =
    $("#cartItems");

  if (!box) return;

  if (!carrinho.length) {
    box.innerHTML =
      `
        <div class="empty">
          Seu carrinho está vazio 🍕
        </div>
      `;

    return;
  }

  box.innerHTML =
    carrinho
      .map(item => `
        <div
          class="cart-item"
          data-cart-item="${item.id}"
        >

          <div class="cart-item-info">

            <b>
              ${escapeHtml(
                item.nome
              )}
            </b>

            <small>
              ${escapeHtml(
                priceLabel(item)
              )}
            </small>

            <button
              type="button"
              class="remove-item"
              data-remove-product="${item.id}"
            >
              remover
            </button>

          </div>


          <div class="item-controls">

            <button
              type="button"
              data-qty-product="${item.id}"
              data-qty-delta="-1"
              aria-label="Diminuir quantidade"
            >
              −
            </button>

            <b>
              ${item.qtd}
            </b>

            <button
              type="button"
              data-qty-product="${item.id}"
              data-qty-delta="1"
              aria-label="Aumentar quantidade"
            >
              +
            </button>

          </div>

        </div>
      `)
      .join("");
}


/* =========================================================
   ABRIR / FECHAR CARRINHO
   ========================================================= */

function openCart() {
  const drawer =
    $("#cartDrawer");

  const overlay =
    $("#overlay");

  if (
    !drawer ||
    !overlay
  ) {
    return;
  }

  ultimoFoco =
    document.activeElement;

  drawer.classList.add(
    "open"
  );

  overlay.classList.add(
    "show"
  );

  overlay.setAttribute(
    "aria-hidden",
    "false"
  );

  drawer.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.classList.add(
    "cart-open"
  );

  requestAnimationFrame(() => {
    $("#closeCart")
      ?.focus({
        preventScroll: true
      });
  });
}

function closeCart() {
  const drawer =
    $("#cartDrawer");

  const overlay =
    $("#overlay");

  if (
    !drawer ||
    !overlay
  ) {
    return;
  }

  drawer.classList.remove(
    "open"
  );

  overlay.classList.remove(
    "show"
  );

  overlay.setAttribute(
    "aria-hidden",
    "true"
  );

  drawer.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.classList.remove(
    "cart-open"
  );

  if (
    ultimoFoco &&
    typeof ultimoFoco.focus ===
      "function"
  ) {
    ultimoFoco.focus({
      preventScroll: true
    });
  }
}


/* =========================================================
   FINALIZAÇÃO
   ========================================================= */

function finalizarPedido() {
  if (!carrinho.length) {
    showToast(
      "Adicione pelo menos um produto antes de finalizar.",
      "warning"
    );

    return;
  }

  const tipo =
    $("#orderType")?.value ||
    "Entrega";

  const total =
    totalCarrinho();

  const resumo =
    carrinho
      .map(
        item =>
          `${item.qtd}x ${item.nome}`
      )
      .join(" • ");

  setText(
    "#orderSummaryText",
    `${tipo} • ${resumo} • Total demonstrativo ${money(total)}`
  );

  closeCart();

  abrirFinalizacao();
}

function abrirFinalizacao() {
  const modal =
    $("#orderComplete");

  if (!modal) return;

  modal.classList.add(
    "show"
  );

  modal.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.classList.add(
    "cart-open"
  );
}

function fecharFinalizacao() {
  const modal =
    $("#orderComplete");

  if (!modal) return;

  modal.classList.remove(
    "show"
  );

  modal.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.classList.remove(
    "cart-open"
  );
}


/* =========================================================
   WHATSAPP
   ========================================================= */

function montarMensagemWhatsApp() {
  const nomeEmpresa =
    EMPRESA?.nome ||
    "estabelecimento";

  const tipo =
    $("#orderType")?.value ||
    "Entrega";

  const endereco =
    $("#addressInput")?.value
      ?.trim() || "";

  const linhas = [
    `Olá, ${nomeEmpresa}!`,
    "",
    "Gostaria de fazer este pedido:"
  ];

  carrinho.forEach(item => {
    const subtotal =
      (
        Number(item.preco) ||
        0
      ) *
      item.qtd;

    linhas.push(
      `• ${item.qtd}x ${item.nome} — ${money(subtotal)}`
    );
  });

  linhas.push(
    "",
    `Tipo: ${tipo}`
  );

  if (
    tipo === "Entrega" &&
    endereco
  ) {
    linhas.push(
      `Endereço: ${endereco}`
    );
  }

  linhas.push(
    `Total: ${money(
      totalCarrinho()
    )}`,
    "",
    "Pedido gerado pela demonstração de delivery WAP."
  );

  return linhas.join("\n");
}

function enviarPedidoWhatsApp() {
  const telefone =
    normalizePhone(
      EMPRESA?.whatsapp
    );

  if (!telefone) {
    showToast(
      "WhatsApp do estabelecimento não informado.",
      "warning"
    );

    return;
  }

  const mensagem =
    montarMensagemWhatsApp();

  const url =
    `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;

  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );
}


/* =========================================================
   PAGAMENTO ILUSTRATIVO
   ========================================================= */

function abrirPagamento() {
  const modal =
    $("#paymentInfo");

  if (!modal) return;

  modal.classList.add(
    "show"
  );

  modal.setAttribute(
    "aria-hidden",
    "false"
  );
}

function fecharPagamento() {
  const modal =
    $("#paymentInfo");

  if (!modal) return;

  modal.classList.remove(
    "show"
  );

  modal.setAttribute(
    "aria-hidden",
    "true"
  );
}


/* =========================================================
   VOLTAR AO INÍCIO
   ========================================================= */

function voltarAoInicio() {
  fecharFinalizacao();

  window.scrollTo({
    top: 0,
    behavior:
      prefersReducedMotion()
        ? "auto"
        : "smooth"
  });
}


/* =========================================================
   FEEDBACK
   ========================================================= */

function showToast(
  message,
  type = "success"
) {
  let container =
    $("#wapToastContainer");

  if (!container) {
    container =
      document.createElement(
        "div"
      );

    container.id =
      "wapToastContainer";

    container.className =
      "wap-toast-container";

    document.body.appendChild(
      container
    );
  }

  const toast =
    document.createElement(
      "div"
    );

  toast.className =
    `wap-toast wap-toast-${type}`;

  toast.textContent =
    message;

  container.appendChild(
    toast
  );

  requestAnimationFrame(() => {
    toast.classList.add(
      "show"
    );
  });

  window.setTimeout(() => {
    toast.classList.remove(
      "show"
    );

    window.setTimeout(() => {
      toast.remove();
    }, 240);
  }, 2200);
}

function animateAddButton(button) {
  if (!button) return;

  const original =
    button.dataset.originalLabel ||
    button.textContent;

  button.dataset.originalLabel =
    original;

  button.classList.add(
    "added"
  );

  button.textContent =
    "✓ ADICIONADO";

  window.setTimeout(() => {
    button.classList.remove(
      "added"
    );

    button.textContent =
      original;
  }, 1000);
}

function pulseCartButton() {
  const button =
    $("#openCart");

  if (
    !button ||
    prefersReducedMotion()
  ) {
    return;
  }

  button.classList.remove(
    "cart-pulse"
  );

  void button.offsetWidth;

  button.classList.add(
    "cart-pulse"
  );

  window.setTimeout(() => {
    button.classList.remove(
      "cart-pulse"
    );
  }, 500);
}


/* =========================================================
   MICROINTERAÇÃO DOS CARDS
   ========================================================= */

function setupCardInteractions() {
  $$(".card").forEach(card => {
    card.addEventListener(
      "pointerdown",
      () => {
        card.classList.add(
          "pressed"
        );
      }
    );

    [
      "pointerup",
      "pointercancel",
      "pointerleave"
    ].forEach(eventName => {
      card.addEventListener(
        eventName,
        () => {
          card.classList.remove(
            "pressed"
          );
        }
      );
    });
  });
}


/* =========================================================
   REVEAL
   ========================================================= */

function setupRevealAnimations() {
  const targets =
    $$(
      ".observation-group, .card, .delivery-panel, .proposal-card"
    );

  if (
    prefersReducedMotion() ||
    !(
      "IntersectionObserver" in
      window
    )
  ) {
    targets.forEach(el => {
      el.classList.add(
        "is-visible"
      );
    });

    return;
  }

  const observer =
    new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target
            .classList
            .add(
              "is-visible"
            );

          observer.unobserve(
            entry.target
          );
        });
      },
      {
        threshold: .10,
        rootMargin:
          "0px 0px -25px 0px"
      }
    );

  targets.forEach(el => {
    el.classList.add(
      "reveal"
    );

    observer.observe(el);
  });
}


/* =========================================================
   EVENTOS
   ========================================================= */

function bindEvents() {
  $("#seeModelBtn")
    ?.addEventListener(
      "click",
      fecharIntro
    );

  $("#openCart")
    ?.addEventListener(
      "click",
      openCart
    );

  $("#menuCartShortcut")
    ?.addEventListener(
      "click",
      openCart
    );

  $("#deliveryCartBtn")
    ?.addEventListener(
      "click",
      openCart
    );

  $("#closeCart")
    ?.addEventListener(
      "click",
      closeCart
    );

  $("#overlay")
    ?.addEventListener(
      "click",
      closeCart
    );

  $("#continueOrder")
    ?.addEventListener(
      "click",
      closeCart
    );

  $("#checkout")
    ?.addEventListener(
      "click",
      finalizarPedido
    );

  $("#closeOrderComplete")
    ?.addEventListener(
      "click",
      fecharFinalizacao
    );

  $("#sendWhatsappOrder")
    ?.addEventListener(
      "click",
      enviarPedidoWhatsApp
    );

  $("#onlinePaymentBtn")
    ?.addEventListener(
      "click",
      abrirPagamento
    );

  $("#closePaymentInfo")
    ?.addEventListener(
      "click",
      fecharPagamento
    );

  $("#homeAfterOrder")
    ?.addEventListener(
      "click",
      voltarAoInicio
    );

  $("#backToTop")
    ?.addEventListener(
      "click",
      voltarAoInicio
    );

  $("#filters")
    ?.addEventListener(
      "click",
      event => {
        const button =
          event.target.closest(
            "[data-filter]"
          );

        if (!button) return;

        $$("#filters button")
          .forEach(item =>
            item.classList.remove(
              "active"
            )
          );

        button.classList.add(
          "active"
        );

        filtroAtivo =
          button.dataset.filter ||
          "todas";

        renderProdutos(
          filtroAtivo
        );
      }
    );

  $("#pizzaGrid")
    ?.addEventListener(
      "click",
      event => {
        const button =
          event.target.closest(
            "[data-add-product]"
          );

        if (!button) return;

        addToCart(
          button.dataset.addProduct,
          button
        );
      }
    );

  $("#cartItems")
    ?.addEventListener(
      "click",
      event => {
        const remove =
          event.target.closest(
            "[data-remove-product]"
          );

        if (remove) {
          removeItem(
            remove.dataset.removeProduct
          );

          return;
        }

        const qty =
          event.target.closest(
            "[data-qty-product]"
          );

        if (qty) {
          changeQty(
            qty.dataset.qtyProduct,
            Number(
              qty.dataset.qtyDelta ||
              0
            )
          );
        }
      }
    );

  $("#orderType")
    ?.addEventListener(
      "change",
      event => {
        const address =
          $("#address");

        if (!address) return;

        const retirada =
          event.target.value ===
          "Retirada";

        address.style.display =
          retirada
            ? "none"
            : "block";
      }
    );

  document.addEventListener(
    "keydown",
    event => {
      if (event.key !== "Escape") {
        return;
      }

      if (
        $("#paymentInfo")
          ?.classList
          .contains("show")
      ) {
        fecharPagamento();
        return;
      }

      if (
        $("#orderComplete")
          ?.classList
          .contains("show")
      ) {
        fecharFinalizacao();
        return;
      }

      closeCart();
    }
  );
}


/* =========================================================
   SUPABASE
   ========================================================= */

async function supabaseRest(
  path,
  params = {}
) {
  const cfg =
    window.WAP_CONFIG ||
    {};

  const url =
    cfg.SUPABASE_URL;

  const key =
    cfg.SUPABASE_ANON_KEY;

  if (
    !url ||
    !key
  ) {
    throw new Error(
      "config.js não configurado."
    );
  }

  const query =
    new URLSearchParams(
      params
    );

  const endpoint =
    `${url}/rest/v1/${path}?${query.toString()}`;

  const controller =
    new AbortController();

  const timer =
    window.setTimeout(
      () =>
        controller.abort(),
      10000
    );

  try {
    const response =
      await fetch(
        endpoint,
        {
          headers: {
            apikey: key,
            Authorization:
              `Bearer ${key}`,
            Accept:
              "application/json"
          },
          cache:
            "no-store",
          signal:
            controller.signal
        }
      );

    if (!response.ok) {
      const detail =
        await response.text();

      throw new Error(
        `Supabase REST ${response.status}: ${detail}`
      );
    }

    return response.json();

  } finally {
    window.clearTimeout(
      timer
    );
  }
}


/* =========================================================
   NORMALIZAR PRODUTOS
   ========================================================= */

function normalizeProducts(
  lista = []
) {
  return lista.map(
    produto => ({
      id:
        produto.id,

      nome:
        produto.nome,

      categoria:
        produto.categoria ||
        "Cardápio",

      descricao:
        produto.descricao,

      preco:
        produto.preco === null ||
        produto.preco === undefined
          ? null
          : Number(
              produto.preco || 0
            ),

      imagem_url:
        produto.imagem_url ||
        imageFallback(
          produto.nome
        ),

      preco_publico:
        Boolean(
          produto.preco_publico
        ),

      fonte_url:
        produto.fonte_url ||
        ""
    })
  );
}


/* =========================================================
   EMPRESA FALLBACK
   ========================================================= */

function fallbackEmpresa() {
  return {
    nome:
      "Pizzaria Demo",

    segmento:
      "Pizzaria",

    cidade:
      "Taboão da Serra",

    estado:
      "SP",

    descricao_curta:
      "Uma experiência de pedido limpa, moderna e fácil de usar.",

    logo_url:
      "assets/logo.jpg",

    hero_image_url:
      "assets/pizza_hero_01.jpg",

    delivery_image_url:
      "assets/delivery_01.jpg"
  };
}


/* =========================================================
   BOOT
   ========================================================= */

async function boot() {
  bindEvents();

  configurarMigo();

  const slug =
    new URLSearchParams(
      location.search
    ).get("cliente")
    ||
    "bella-massa-demo";

  console.info(
    "WAP Impacto V04:",
    slug
  );

  try {
    const empresas =
      await supabaseRest(
        "empresas_demo",
        {
          select: "*",
          slug:
            `eq.${slug}`,
          limit:
            "1"
        }
      );

    if (!empresas.length) {
      throw new Error(
        `Cliente '${slug}' não encontrado.`
      );
    }

    const empresa =
      empresas[0];

    applyEmpresa(
      empresa
    );

    const produtosBanco =
      await supabaseRest(
        "produtos_demo",
        {
          select: "*",
          empresa_id:
            `eq.${empresa.id}`,
          ativo:
            "eq.true",
          order:
            "id.asc"
        }
      );

    produtos =
      normalizeProducts(
        produtosBanco ||
        []
      );

    if (!produtos.length) {
      produtos =
        PRODUTOS_FALLBACK;
    }

    renderFilters();

    renderProdutos();

    updateCart();

    window.setTimeout(
      setupRevealAnimations,
      80
    );

    console.info(
      "WAP Impacto V04 carregado",
      {
        empresa:
          empresa.nome,
        produtos:
          produtos.length
      }
    );

  } catch (error) {
    console.error(
      "Falha ao carregar empresa:",
      error
    );

    const empresa =
      fallbackEmpresa();

    applyEmpresa(
      empresa
    );

    produtos =
      PRODUTOS_FALLBACK;

    renderFilters();

    renderProdutos();

    updateCart();

    window.setTimeout(
      setupRevealAnimations,
      80
    );

    showToast(
      "Demonstração carregada em modo local.",
      "info"
    );
  }
}


/* =========================================================
   COMPATIBILIDADE
   ========================================================= */

window.addToCart =
  addToCart;

window.changeQty =
  changeQty;

window.removeItem =
  removeItem;

window.openCart =
  openCart;

window.closeCart =
  closeCart;


/* =========================================================
   INICIAR
   ========================================================= */

boot();