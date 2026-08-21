/* =========================================================
   WAP MOTOR COMERCIAL
   DELIVERY EXPERIENCE V3.1
   PROPOSTA AUTOMÁTICA PERSONALIZADA

   URL:
   index.html?cliente=slug

   Banco:
   empresas_demo
   produtos_demo
   ========================================================= */

"use strict";


/* =========================================================
   ESTADO GLOBAL
   ========================================================= */

let EMPRESA = null;

let pizzas = [];

let cart = [];

let activeFilter = "todas";

let lastFocusedElement = null;


/* =========================================================
   PRODUTOS DE FALLBACK
   ========================================================= */

const fallbackPizzas = [

  {
    id: 1,

    nome: "Mussarela",

    categoria: "Clássicas",

    descricao:
      "Mussarela derretida e orégano.",

    preco: 39.90,

    imagem_url:
      "assets/produto_02_mussarela.jpg",

    preco_publico: false
  },

  {
    id: 2,

    nome: "Calabresa",

    categoria: "Clássicas",

    descricao:
      "Calabresa, cebola e orégano.",

    preco: 41.90,

    imagem_url:
      "assets/produto_01_calabresa.jpg",

    preco_publico: false
  },

  {
    id: 3,

    nome: "Portuguesa",

    categoria: "Especiais",

    descricao:
      "Presunto, ovos, cebola e azeitonas.",

    preco: 42.90,

    imagem_url:
      "assets/produto_03_portuguesa.jpg",

    preco_publico: false
  },

  {
    id: 4,

    nome: "Frango com Catupiry",

    categoria: "Especiais",

    descricao:
      "Frango desfiado com catupiry.",

    preco: 45.90,

    imagem_url:
      "assets/produto_04_frango.jpg",

    preco_publico: false
  },

  {
    id: 5,

    nome: "Chocolate",

    categoria: "Doces",

    descricao:
      "Chocolate ao leite.",

    preco: 34.90,

    imagem_url:
      "assets/produto_06_chocolate.jpg",

    preco_publico: false
  }

];


/* =========================================================
   HELPERS
   ========================================================= */

const $ = (
  selector,
  root = document
) => root.querySelector(selector);


const $$ = (
  selector,
  root = document
) => [...root.querySelectorAll(selector)];


const money = value =>
  Number(value || 0)
    .toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL"
      }
    );


const slugify = value =>
  String(value || "")
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /(^-|-$)/g,
      ""
    );


const escapeHtml = value =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");


function setText(
  selector,
  text
) {

  const element =
    $(selector);

  if(element){
    element.textContent =
      text;
  }

}


function setAttribute(
  selector,
  attribute,
  value
) {

  const element =
    $(selector);

  if(
    element &&
    value !== null &&
    value !== undefined
  ){

    element.setAttribute(
      attribute,
      value
    );

  }

}


function firstValue(
  ...values
){

  return values.find(
    value =>
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
  );

}


/* =========================================================
   IMAGENS
   ========================================================= */

function imageFallback(
  nome
){

  const normalized =
    slugify(nome);

  if(
    normalized.includes(
      "calabresa"
    )
  ){

    return "assets/produto_01_calabresa.jpg";

  }

  if(
    normalized.includes(
      "mussarela"
    ) ||
    normalized.includes(
      "mucarela"
    )
  ){

    return "assets/produto_02_mussarela.jpg";

  }

  if(
    normalized.includes(
      "portuguesa"
    )
  ){

    return "assets/produto_03_portuguesa.jpg";

  }

  if(
    normalized.includes(
      "frango"
    )
  ){

    return "assets/produto_04_frango.jpg";

  }

  if(
    normalized.includes(
      "bacon"
    )
  ){

    return "assets/produto_05_bacon.jpg";

  }

  if(
    normalized.includes(
      "chocolate"
    ) ||
    normalized.includes(
      "doce"
    )
  ){

    return "assets/produto_06_chocolate.jpg";

  }

  return "assets/pizza_hero_01.jpg";

}


function safeImage(
  element,
  fallback
){

  if(!element){
    return;
  }

  element.addEventListener(
    "error",
    () => {

      element.src =
        fallback;

    },
    {
      once: true
    }
  );

}


/* =========================================================
   INSTAGRAM
   ========================================================= */

function instagramHandle(
  url
){

  if(!url){

    return "Instagram não informado";

  }

  try{

    const parsed =
      new URL(url);

    const handle =
      parsed.pathname
        .replace(
          /\//g,
          ""
        );

    return handle
      ? `@${handle}`
      : "Instagram";

  }catch{

    return url;

  }

}


/* =========================================================
   MOVIMENTO
   ========================================================= */

function prefersReducedMotion(){

  return (
    window
      .matchMedia?.(
        "(prefers-reduced-motion: reduce)"
      )
      .matches || false
  );

}


/* =========================================================
   MOTOR VISUAL
   ========================================================= */

const EXPERIENCE_DEFAULTS = {

  brandStyle:
    "modern",

  primaryColor:
    "#ff3b30",

  accentColor:
    "#ffb000",

  visualDensity:
    "comfortable",

  heroLayout:
    "split",

  cardStyle:
    "elevated",

  ctaTone:
    "direct",

  photoEmphasis:
    "high",

  audienceProfile:
    "general",

  accessibilityLevel:
    "enhanced",

  motionLevel:
    "subtle"

};


function inferExperience(
  company = {}
){

  const external =
    window.WAP_EXPERIENCE || {};

  const audience =
    firstValue(

      company.audience_profile,

      company.publico,

      external.audienceProfile,

      EXPERIENCE_DEFAULTS
        .audienceProfile

    );


  const accessibilityLevel =

    firstValue(

      external
        .accessibilityLevel,

      company
        .accessibility_level,

      String(audience)
        .toLowerCase()
        .includes("idos")

        ? "maximum"

        : EXPERIENCE_DEFAULTS
            .accessibilityLevel

    );


  return {

    brandStyle:

      firstValue(

        external.brandStyle,

        company.brand_style,

        EXPERIENCE_DEFAULTS
          .brandStyle

      ),


    primaryColor:

      firstValue(

        external.primaryColor,

        company.cor_primaria,

        EXPERIENCE_DEFAULTS
          .primaryColor

      ),


    accentColor:

      firstValue(

        external.accentColor,

        company.cor_secundaria,

        EXPERIENCE_DEFAULTS
          .accentColor

      ),


    visualDensity:

      firstValue(

        external.visualDensity,

        company.visual_density,

        accessibilityLevel ===
        "maximum"

          ? "spacious"

          : EXPERIENCE_DEFAULTS
              .visualDensity

      ),


    heroLayout:

      firstValue(

        external.heroLayout,

        company.hero_layout,

        EXPERIENCE_DEFAULTS
          .heroLayout

      ),


    cardStyle:

      firstValue(

        external.cardStyle,

        company.card_style,

        EXPERIENCE_DEFAULTS
          .cardStyle

      ),


    ctaTone:

      firstValue(

        external.ctaTone,

        company.cta_tone,

        EXPERIENCE_DEFAULTS
          .ctaTone

      ),


    photoEmphasis:

      firstValue(

        external.photoEmphasis,

        company.photo_emphasis,

        EXPERIENCE_DEFAULTS
          .photoEmphasis

      ),


    audienceProfile:
      audience,


    accessibilityLevel,


    motionLevel:

      prefersReducedMotion()

        ? "off"

        : firstValue(

            external.motionLevel,

            company.motion_level,

            EXPERIENCE_DEFAULTS
              .motionLevel

          )

  };

}


function applyExperience(
  company = {}
){

  const experience =
    inferExperience(
      company
    );

  const root =
    document.documentElement;

  const body =
    document.body;


  root.style.setProperty(
    "--demo-primary",
    experience.primaryColor
  );


  root.style.setProperty(
    "--demo-secondary",
    experience.accentColor
  );


  body.dataset.brandStyle =
    experience.brandStyle;


  body.dataset.visualDensity =
    experience.visualDensity;


  body.dataset.heroLayout =
    experience.heroLayout;


  body.dataset.cardStyle =
    experience.cardStyle;


  body.dataset.ctaTone =
    experience.ctaTone;


  body.dataset.photoEmphasis =
    experience.photoEmphasis;


  body.dataset.audienceProfile =
    experience.audienceProfile;


  body.dataset.accessibilityLevel =
    experience.accessibilityLevel;


  body.dataset.motionLevel =
    experience.motionLevel;


  if(
    experience
      .accessibilityLevel ===
    "maximum"
  ){

    root.style.setProperty(
      "--wap-hit-area",
      "52px"
    );

    root.style.setProperty(
      "--wap-readable-size",
      "1.05rem"
    );

  }


  if(
    experience.motionLevel ===
    "off"
  ){

    body
      .classList
      .add(
        "reduce-motion"
      );

  }

}


/* =========================================================
   MOTOR DE PROPOSTA
   ========================================================= */

function detectProfile(
  company
){

  const text =
    [
      company.nome,
      company.segmento,
      company.descricao_curta,
      company.categoria
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();


  if(
    text.includes("pizza") ||
    text.includes("pizzaria")
  ){

    return "pizzaria";

  }


  if(
    text.includes("lanche") ||
    text.includes("hamburg")
  ){

    return "lanchonete";

  }


  if(
    text.includes("restaurante")
  ){

    return "restaurante";

  }


  if(
    text.includes("marmita")
  ){

    return "marmitaria";

  }


  return "delivery";

}


/* =========================================================
   QUALIDADES
   ========================================================= */

function buildQualities(
  company
){

  const qualities =
    [];


  if(
    company.logo_url
  ){

    qualities.push({

      title:
        "Identidade já reconhecível",

      text:
        "O estabelecimento já possui elementos visuais que podem ser aproveitados para criar uma experiência digital mais consistente."

    });

  }


  if(
    company.instagram_url
  ){

    qualities.push({

      title:
        "Presença nas redes sociais",

      text:
        "A marca já possui um canal capaz de gerar descoberta e relacionamento com potenciais clientes."

    });

  }


  if(
    company.whatsapp
  ){

    qualities.push({

      title:
        "Canal direto com o cliente",

      text:
        "O WhatsApp já permite contato rápido e pode ganhar um fluxo mais organizado para pedidos."

    });

  }


  if(
    company.hero_image_url
  ){

    qualities.push({

      title:
        "Potencial visual forte",

      text:
        "Boas imagens de produtos ajudam a transformar atenção em desejo e valorizam a apresentação da marca."

    });

  }


  if(
    company.avaliacao &&
    Number(
      company.avaliacao
    ) >= 4
  ){

    qualities.push({

      title:
        "Boa percepção pública",

      text:
        "A avaliação encontrada indica uma base positiva de confiança que pode ser valorizada na experiência digital."

    });

  }


  if(
    qualities.length <
    2
  ){

    qualities.push({

      title:
        "Produto com apelo imediato",

      text:
        "O segmento possui forte potencial visual e costuma funcionar muito bem em experiências digitais rápidas e objetivas."

    });

  }


  if(
    qualities.length <
    2
  ){

    qualities.push({

      title:
        "Proximidade com o público",

      text:
        "O atendimento local permite criar uma comunicação mais direta, simples e próxima do consumidor."

    });

  }


  return qualities
    .slice(
      0,
      2
    );

}


/* =========================================================
   OPORTUNIDADES
   ========================================================= */

function buildOpportunities(
  company
){

  const opportunities =
    [];


  if(
    !company.site_url
  ){

    opportunities.push({

      title:
        "Criar um ponto digital próprio",

      text:
        "Uma página própria reduz a dependência exclusiva de redes sociais e concentra cardápio, marca e chamada para pedido."

    });

  }else{

    opportunities.push({

      title:
        "Simplificar a jornada móvel",

      text:
        "A experiência pode conduzir o visitante com menos etapas entre visualizar produtos e iniciar um pedido."

    });

  }


  opportunities.push({

    title:
      "Organizar melhor o cardápio",

    text:
      "Categorias, fotografias, preços e descrições bem hierarquizados facilitam a escolha e valorizam os produtos."

  });


  if(
    company.whatsapp
  ){

    opportunities.push({

      title:
        "Transformar WhatsApp em conversão",

      text:
        "Em vez de depender de uma conversa começando do zero, o cliente pode chegar ao WhatsApp já sabendo o que deseja."

    });

  }else{

    opportunities.push({

      title:
        "Criar um CTA comercial claro",

      text:
        "O visitante precisa encontrar rapidamente qual é a próxima ação para comprar ou entrar em contato."

    });

  }


  opportunities.push({

    title:
      "Fortalecer a apresentação da marca",

    text:
      "Uma experiência própria transmite organização e profissionalismo antes mesmo do primeiro atendimento."

  });


  return opportunities
    .slice(
      0,
      3
    );

}


/* =========================================================
   TEXTO COMERCIAL
   ========================================================= */

function buildProposalCopy(
  company
){

  const name =
    company.nome ||
    "seu estabelecimento";


  const profile =
    detectProfile(
      company
    );


  const hasInstagram =
    Boolean(
      company.instagram_url
    );


  const hasWhatsapp =
    Boolean(
      company.whatsapp
    );


  const hasSite =
    Boolean(
      company.site_url
    );


  let headline;

  let argument;

  let conversionHeadline;

  let conversionText;

  let finalPitch;

  let finalPitchText;


  if(
    profile ===
    "pizzaria"
  ){

    headline =
      `${name} já tem o principal: um produto que desperta desejo. A oportunidade é tornar o caminho até o pedido igualmente atraente.`;


    argument =
      "Nossa proposta é organizar a experiência em torno daquilo que o cliente realmente quer fazer: encontrar sabores, comparar opções, montar o pedido e chegar ao atendimento sem esforço.";


    conversionHeadline =
      "A pizza chama atenção. A experiência precisa transformar essa atenção em pedido.";


    conversionText =
      "Fotos fortes, cardápio organizado e uma chamada clara para ação diminuem o caminho entre a vontade de pedir e a decisão de compra.";

  }else{

    headline =
      `${name} pode transformar sua presença digital em uma jornada mais simples para o cliente.`;


    argument =
      "A proposta une apresentação da marca, organização dos produtos e um caminho mais direto para a ação principal do consumidor.";


    conversionHeadline =
      "Quando a experiência é simples, o cliente entende mais rápido o que escolher e como comprar.";


    conversionText =
      "Nosso objetivo é reduzir distrações e apresentar as informações mais importantes na ordem certa.";

  }


  if(
    hasInstagram &&
    !hasSite
  ){

    argument +=
      " A presença nas redes sociais já ajuda na descoberta; uma experiência própria pode assumir a etapa seguinte e organizar a conversão.";

  }


  if(
    hasWhatsapp
  ){

    argument +=
      " O WhatsApp continua importante, mas passa a receber um cliente mais preparado para concluir o atendimento.";

  }


  finalPitch =
    `Podemos transformar esta demonstração em uma experiência oficial para ${name}.`;


  finalPitchText =
    "A WAP cuida da personalização visual, estrutura do cardápio, experiência móvel, carrinho, publicação e integração com o canal comercial do estabelecimento.";


  return {

    headline,

    argument,

    conversionHeadline,

    conversionText,

    finalPitch,

    finalPitchText

  };

}


/* =========================================================
   RENDER DO DIAGNÓSTICO
   ========================================================= */

function renderAnalysis(
  company
){

  const qualities =
    buildQualities(
      company
    );


  const opportunities =
    buildOpportunities(
      company
    );


  const qualityBox =
    $("#qualitiesList");


  const opportunityBox =
    $("#opportunitiesList");


  if(
    qualityBox
  ){

    qualityBox.innerHTML =
      qualities
        .map(
          (
            item,
            index
          ) => `
            <div class="analysis-item">

              <span class="analysis-item-number">
                ${index + 1}
              </span>

              <div>

                <strong>
                  ${escapeHtml(
                    item.title
                  )}
                </strong>

                <p>
                  ${escapeHtml(
                    item.text
                  )}
                </p>

              </div>

            </div>
          `
        )
        .join("");

  }


  if(
    opportunityBox
  ){

    opportunityBox.innerHTML =
      opportunities
        .map(
          (
            item,
            index
          ) => `
            <div class="analysis-item">

              <span class="analysis-item-number">
                ${index + 1}
              </span>

              <div>

                <strong>
                  ${escapeHtml(
                    item.title
                  )}
                </strong>

                <p>
                  ${escapeHtml(
                    item.text
                  )}
                </p>

              </div>

            </div>
          `
        )
        .join("");

  }

}


/* =========================================================
   APLICAR EMPRESA
   ========================================================= */

function applyEmpresa(
  company
){

  EMPRESA =
    company || {};


  const name =
    EMPRESA.nome ||
    "Pizzaria Demo";


  document.title =
    `${name} | Demonstração WAP`;


  setAttribute(
    "#pageDescription",
    "content",
    `${name} — análise e demonstração digital personalizada pela WAP.`
  );


  setText(
    "#brandName",
    name.toUpperCase()
  );


  setText(
    "#heroBrand",
    name
  );


  setText(
    "#proposalBrand",
    name.toUpperCase()
  );


  setText(
    "#footerBrand",
    name.toUpperCase()
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

    `Criamos esta demonstração para mostrar como ${name} pode oferecer uma experiência digital mais clara, profissional e simples para seus clientes.`
  );


  const proposal =
    buildProposalCopy(
      EMPRESA
    );


  setText(
    "#proposalHeadline",
    proposal.headline
  );


  setText(
    "#proposalArgument",
    proposal.argument
  );


  setText(
    "#conversionHeadline",
    proposal.conversionHeadline
  );


  setText(
    "#conversionText",
    proposal.conversionText
  );


  setText(
    "#finalPitch",
    proposal.finalPitch
  );


  setText(
    "#finalPitchText",
    proposal.finalPitchText
  );


  renderAnalysis(
    EMPRESA
  );


  /* LOGO */

  const logo =
    EMPRESA.logo_url ||
    "assets/pizza_hero_01.jpg";


  [
    "#brandLogo",
    "#contactLogo"
  ]
    .forEach(
      selector => {

        const image =
          $(selector);

        if(
          !image
        ){
          return;
        }

        image.src =
          logo;

        image.alt =
          name;

        safeImage(
          image,
          "assets/pizza_hero_01.jpg"
        );

      }
    );


  /* HERO */

  const hero =
    $("#heroPizza");


  if(
    hero
  ){

    hero.src =

      EMPRESA.hero_image_url ||

      "assets/pizza_hero_01.jpg";


    hero.alt =
      `Destaque visual de ${name}`;


    safeImage(
      hero,
      "assets/pizza_hero_01.jpg"
    );

  }


  /* DELIVERY */

  const delivery =
    $("#deliveryBike");


  if(
    delivery
  ){

    delivery.src =

      EMPRESA.delivery_image_url ||

      "assets/delivery_01.jpg";


    delivery.alt =
      `Experiência de entrega de ${name}`;


    safeImage(
      delivery,
      "assets/delivery_01.jpg"
    );

  }


  applyExperience(
    EMPRESA
  );


  [
    "#contactWhatsapp",
    "#floatingWhatsapp"
  ]
    .forEach(
      selector => {

        const element =
          $(selector);

        if(
          !element
        ){
          return;
        }

        element.href =
          "#";

        element.addEventListener(
          "click",
          demoCommercial
        );

      }
    );

}


/* =========================================================
   AVISO DA DEMO
   ========================================================= */

function demoCommercial(
  event
){

  if(
    event
  ){

    event.preventDefault();

  }


  showToast(
    "Demonstração comercial WAP. O contato real será configurado na versão oficial.",
    "info"
  );

}


/* =========================================================
   FILTROS
   ========================================================= */

function renderFilters(){

  const box =
    $("#filters");


  if(
    !box
  ){

    return;

  }


  const categories =
    [
      ...new Set(
        pizzas
          .map(
            product =>
              product.categoria
          )
          .filter(Boolean)
      )
    ];


  box.innerHTML =

    `
      <button
        type="button"
        class="${
          activeFilter ===
          "todas"
            ? "active"
            : ""
        }"
        data-filter="todas"
        aria-pressed="${
          activeFilter ===
          "todas"
        }"
      >
        Todas
      </button>
    `

    +

    categories
      .map(
        category => {

          const slug =
            slugify(
              category
            );

          return `
            <button
              type="button"
              data-filter="${escapeHtml(slug)}"
              class="${
                activeFilter ===
                slug
                  ? "active"
                  : ""
              }"
              aria-pressed="${
                activeFilter ===
                slug
              }"
            >
              ${escapeHtml(category)}
            </button>
          `;

        }
      )
      .join("");

}


/* =========================================================
   PREÇO
   ========================================================= */

function priceLabel(
  product
){

  if(
    product.preco ===
      null ||

    product.preco ===
      undefined ||

    Number(
      product.preco
    ) <= 0
  ){

    return "Consulte";

  }


  return money(
    product.preco
  );

}


/* =========================================================
   PRODUTOS
   ========================================================= */

function renderPizzas(
  filter =
  activeFilter
){

  const grid =
    $("#pizzaGrid");


  if(
    !grid
  ){

    return;

  }


  activeFilter =
    filter ||
    "todas";


  const list =

    activeFilter ===
    "todas"

      ? pizzas

      : pizzas.filter(
          product =>
            slugify(
              product.categoria
            ) ===
            activeFilter
        );


  grid.classList.add(
    "is-updating"
  );


  if(
    !list.length
  ){

    grid.innerHTML =
      `
        <div class="empty">
          Nenhum item encontrado nesta categoria.
        </div>
      `;

    return;

  }


  grid.innerHTML =
    list
      .map(
        product => {

          const fallback =
            imageFallback(
              product.nome
            );


          return `
            <article
              class="card"
              data-product-id="${product.id}"
            >

              <div class="card-media">

                <img
                  src="${escapeHtml(
                    product.imagem_url ||
                    fallback
                  )}"

                  alt="${escapeHtml(
                    product.nome
                  )}"

                  loading="lazy"

                  decoding="async"

                  onerror="
                    this.onerror=null;
                    this.src='${escapeHtml(
                      fallback
                    )}'
                  "
                >

              </div>


              <div class="card-body">

                <div class="card-copy">

                  <h3>
                    ${escapeHtml(
                      product.nome
                    )}
                  </h3>

                  <p>
                    ${escapeHtml(
                      product.descricao ||
                      "Item do cardápio demonstrativo."
                    )}
                  </p>

                </div>


                <div class="card-bottom">

                  <span class="price">

                    ${escapeHtml(
                      priceLabel(
                        product
                      )
                    )}

                    ${
                      product
                        .preco_publico

                        ? `
                          <small class="public-price">
                            preço público
                          </small>
                        `

                        : ""
                    }

                  </span>


                  <button
                    type="button"
                    class="add-btn"
                    data-add-product="${product.id}"
                    aria-label="Adicionar ${escapeHtml(
                      product.nome
                    )} ao carrinho"
                  >
                    + ADICIONAR
                  </button>

                </div>

              </div>

            </article>
          `;

        }
      )
      .join("");


  requestAnimationFrame(
    () => {

      grid
        .classList
        .remove(
          "is-updating"
        );

    }
  );


  setupCardInteractions();

}


/* =========================================================
   CARRINHO
   ========================================================= */

function addToCart(
  id,
  sourceButton = null
){

  const product =
    pizzas.find(
      item =>
        String(item.id) ===
        String(id)
    );


  if(
    !product
  ){

    return;

  }


  const found =
    cart.find(
      item =>
        String(item.id) ===
        String(id)
    );


  if(
    found
  ){

    found.qtd +=
      1;

  }else{

    cart.push({

      ...product,

      qtd:
        1

    });

  }


  updateCart();


  animateAddButton(
    sourceButton
  );


  pulseCartButton();


  showToast(
    `${product.nome} adicionado ao carrinho.`,
    "success"
  );


  announce(
    `${product.nome} adicionado ao carrinho.`
  );


  if(
    window.innerWidth >=
    980
  ){

    openCart();

  }

}


function changeQty(
  id,
  delta
){

  const item =
    cart.find(
      product =>
        String(product.id) ===
        String(id)
    );


  if(
    !item
  ){

    return;

  }


  item.qtd +=
    Number(delta);


  if(
    item.qtd <=
    0
  ){

    cart =
      cart.filter(
        product =>
          String(product.id) !==
          String(id)
      );

  }


  updateCart();

}


function removeItem(
  id
){

  const item =
    cart.find(
      product =>
        String(product.id) ===
        String(id)
    );


  cart =
    cart.filter(
      product =>
        String(product.id) !==
        String(id)
    );


  updateCart();


  if(
    item
  ){

    showToast(
      `${item.nome} removido.`,
      "info"
    );

  }

}


/* =========================================================
   ATUALIZAR CARRINHO
   ========================================================= */

function updateCart(){

  const count =
    cart.reduce(
      (
        total,
        item
      ) =>
        total +
        item.qtd,
      0
    );


  const total =
    cart.reduce(
      (
        sum,
        item
      ) =>
        sum +

        (
          Number(
            item.preco
          ) || 0
        ) *

        item.qtd,
      0
    );


  setText(
    "#cartCount",
    count
  );


  setText(
    "#cartTotal",
    money(total)
  );


  const box =
    $("#cartItems");


  if(
    box
  ){

    if(
      !cart.length
    ){

      box.innerHTML =
        `
          <div class="empty">
            Seu carrinho está vazio 🍕
          </div>
        `;

    }else{

      box.innerHTML =
        cart
          .map(
            item => `
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
                      priceLabel(
                        item
                      )
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
            `
          )
          .join("");

    }

  }


  updateContextualCTA();

}


/* =========================================================
   CTA CONTEXTUAL
   ========================================================= */

function updateContextualCTA(){

  const count =
    cart.reduce(
      (
        sum,
        item
      ) =>
        sum +
        item.qtd,
      0
    );


  const total =
    cart.reduce(
      (
        sum,
        item
      ) =>
        sum +

        (
          Number(
            item.preco
          ) || 0
        ) *

        item.qtd,
      0
    );


  const checkout =
    $("#checkout");


  if(
    checkout
  ){

    checkout.textContent =

      count

        ? `SIMULAR PEDIDO • ${money(total)}`

        : "SIMULAR PEDIDO";

  }


  const cartButton =
    $("#openCart");


  if(
    cartButton
  ){

    cartButton.setAttribute(

      "aria-label",

      count

        ? `Abrir carrinho com ${count} item${count > 1 ? "s" : ""}`

        : "Abrir carrinho"

    );

  }

}


/* =========================================================
   ABRIR / FECHAR CARRINHO
   ========================================================= */

function openCart(){

  const drawer =
    $("#cartDrawer");

  const overlay =
    $("#overlay");


  if(
    !drawer ||
    !overlay
  ){

    return;

  }


  lastFocusedElement =
    document.activeElement;


  drawer
    .classList
    .add(
      "open"
    );


  overlay
    .classList
    .add(
      "show"
    );


  drawer.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body
    .classList
    .add(
      "cart-open"
    );


  requestAnimationFrame(
    () => {

      $("#closeCart")
        ?.focus(
          {
            preventScroll:
              true
          }
        );

    }
  );

}


function closeCart(){

  const drawer =
    $("#cartDrawer");

  const overlay =
    $("#overlay");


  if(
    !drawer ||
    !overlay
  ){

    return;

  }


  drawer
    .classList
    .remove(
      "open"
    );


  overlay
    .classList
    .remove(
      "show"
    );


  drawer.setAttribute(
    "aria-hidden",
    "true"
  );


  document.body
    .classList
    .remove(
      "cart-open"
    );


  if(
    lastFocusedElement
      ?.focus
  ){

    lastFocusedElement.focus(
      {
        preventScroll:
          true
      }
    );

  }

}


/* =========================================================
   CHECKOUT DEMO
   ========================================================= */

function simulateCheckout(){

  if(
    !cart.length
  ){

    showToast(
      "Adicione pelo menos um item para testar o fluxo.",
      "warning"
    );

    return;

  }


  const type =
    $("#orderType")
      ?.value ||
    "Entrega";


  showToast(
    `Simulação concluída — ${type}. Nenhum pedido real foi enviado.`,
    "success"
  );


  window.setTimeout(
    closeCart,
    650
  );

}


/* =========================================================
   FEEDBACK
   ========================================================= */

function ensureLiveRegion(){

  let live =
    $("#wapLiveRegion");


  if(
    live
  ){

    return live;

  }


  live =
    document.createElement(
      "div"
    );


  live.id =
    "wapLiveRegion";


  live.setAttribute(
    "aria-live",
    "polite"
  );


  live.setAttribute(
    "aria-atomic",
    "true"
  );


  Object.assign(
    live.style,
    {

      position:
        "fixed",

      width:
        "1px",

      height:
        "1px",

      overflow:
        "hidden",

      clip:
        "rect(0 0 0 0)"

    }
  );


  document.body
    .appendChild(
      live
    );


  return live;

}


function announce(
  message
){

  const live =
    ensureLiveRegion();


  live.textContent =
    "";


  requestAnimationFrame(
    () => {

      live.textContent =
        message;

    }
  );

}


function showToast(
  message,
  type = "success"
){

  let container =
    $("#wapToastContainer");


  if(
    !container
  ){

    container =
      document.createElement(
        "div"
      );


    container.id =
      "wapToastContainer";


    container.className =
      "wap-toast-container";


    document.body
      .appendChild(
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


  container
    .appendChild(
      toast
    );


  requestAnimationFrame(
    () => {

      toast
        .classList
        .add(
          "show"
        );

    }
  );


  window.setTimeout(
    () => {

      toast
        .classList
        .remove(
          "show"
        );


      window.setTimeout(
        () =>
          toast.remove(),
        250
      );

    },
    2200
  );

}


/* =========================================================
   MICROINTERAÇÕES
   ========================================================= */

function animateAddButton(
  button
){

  if(
    !button
  ){

    return;

  }


  const original =
    button.dataset.originalLabel ||
    button.textContent;


  button.dataset.originalLabel =
    original;


  button
    .classList
    .add(
      "added"
    );


  button.textContent =
    "✓ ADICIONADO";


  window.setTimeout(
    () => {

      button
        .classList
        .remove(
          "added"
        );


      button.textContent =
        original;

    },
    1100
  );

}


function pulseCartButton(){

  const button =
    $("#openCart");


  if(
    !button ||
    prefersReducedMotion()
  ){

    return;

  }


  button
    .classList
    .remove(
      "cart-pulse"
    );


  void button.offsetWidth;


  button
    .classList
    .add(
      "cart-pulse"
    );

}


function setupCardInteractions(){

  $$(".card")
    .forEach(
      card => {

        card.addEventListener(
          "pointerdown",
          () => {

            card
              .classList
              .add(
                "pressed"
              );

          }
        );


        [
          "pointerup",
          "pointercancel",
          "pointerleave"
        ]
          .forEach(
            eventName => {

              card.addEventListener(
                eventName,
                () => {

                  card
                    .classList
                    .remove(
                      "pressed"
                    );

                }
              );

            }
          );

      }
    );

}


/* =========================================================
   ANIMAÇÃO NA ROLAGEM
   ========================================================= */

function setupRevealAnimations(){

  const targets =
    $$(
      ".analysis-panel, .benefit-card, .card, .proposal-card, .delivery-frame"
    );


  if(
    prefersReducedMotion() ||
    !(
      "IntersectionObserver"
      in window
    )
  ){

    targets
      .forEach(
        element =>
          element
            .classList
            .add(
              "is-visible"
            )
      );

    return;

  }


  const observer =
    new IntersectionObserver(
      entries => {

        entries.forEach(
          entry => {

            if(
              !entry.isIntersecting
            ){

              return;

            }


            entry.target
              .classList
              .add(
                "is-visible"
              );


            observer
              .unobserve(
                entry.target
              );

          }
        );

      },
      {

        threshold:
          .12,

        rootMargin:
          "0px 0px -30px 0px"

      }
    );


  targets
    .forEach(
      element => {

        element
          .classList
          .add(
            "reveal"
          );


        observer.observe(
          element
        );

      }
    );

}


/* =========================================================
   EVENTOS
   ========================================================= */

function bindEvents(){

  $("#openCart")
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
      simulateCheckout
    );


  $("#filters")
    ?.addEventListener(
      "click",
      event => {

        const button =
          event.target.closest(
            "button[data-filter]"
          );


        if(
          !button
        ){

          return;

        }


        $$("#filters button")
          .forEach(
            item => {

              item
                .classList
                .remove(
                  "active"
                );


              item.setAttribute(
                "aria-pressed",
                "false"
              );

            }
          );


        button
          .classList
          .add(
            "active"
          );


        button.setAttribute(
          "aria-pressed",
          "true"
        );


        activeFilter =
          button.dataset.filter ||
          "todas";


        renderPizzas(
          activeFilter
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


        if(
          !button
        ){

          return;

        }


        addToCart(
          button.dataset
            .addProduct,
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


        if(
          remove
        ){

          removeItem(
            remove.dataset
              .removeProduct
          );

          return;

        }


        const quantity =
          event.target.closest(
            "[data-qty-product]"
          );


        if(
          quantity
        ){

          changeQty(

            quantity.dataset
              .qtyProduct,

            Number(
              quantity.dataset
                .qtyDelta ||
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


        if(
          !address
        ){

          return;

        }


        const pickup =
          event.target.value ===
          "Retirada";


        address.style.display =
          pickup
            ? "none"
            : "block";

      }
    );


  document
    .addEventListener(
      "keydown",
      event => {

        if(
          event.key ===
          "Escape"
        ){

          closeCart();

        }

      }
    );

}


/* =========================================================
   SUPABASE REST
   ========================================================= */

async function supabaseRest(
  path,
  params = {}
){

  const config =
    window.WAP_CONFIG ||
    {};


  const url =
    config.SUPABASE_URL;


  const key =
    config.SUPABASE_ANON_KEY;


  if(
    !url ||
    !key
  ){

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


  const timeout =
    window.setTimeout(
      () =>
        controller.abort(),
      10000
    );


  try{

    const response =
      await fetch(
        endpoint,
        {

          headers:
          {

            apikey:
              key,

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


    if(
      !response.ok
    ){

      const detail =
        await response.text();


      throw new Error(
        `Supabase REST ${response.status}: ${detail}`
      );

    }


    return response.json();

  }finally{

    clearTimeout(
      timeout
    );

  }

}


/* =========================================================
   NORMALIZAR PRODUTOS
   ========================================================= */

function normalizeProducts(
  products = []
){

  return products
    .map(
      product => ({

        id:
          product.id,

        nome:
          product.nome,

        categoria:
          product.categoria ||
          "Cardápio",

        descricao:
          product.descricao,

        preco:

          product.preco ===
            null ||

          product.preco ===
            undefined

            ? null

            : Number(
                product.preco ||
                0
              ),

        imagem_url:

          product.imagem_url ||

          imageFallback(
            product.nome
          ),

        preco_publico:
          Boolean(
            product.preco_publico
          ),

        fonte_url:
          product.fonte_url ||
          ""

      })
    );

}


/* =========================================================
   EMPRESA FALLBACK
   ========================================================= */

function fallbackEmpresa(){

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
      "Uma demonstração de delivery moderna, rápida e simples de usar.",

    logo_url:
      "assets/pizza_hero_01.jpg",

    hero_image_url:
      "assets/pizza_hero_01.jpg",

    delivery_image_url:
      "assets/delivery_01.jpg",

    cor_primaria:
      "#e53935",

    cor_secundaria:
      "#ffb300"

  };

}


/* =========================================================
   BOOT
   ========================================================= */

async function boot(){

  bindEvents();


  ensureLiveRegion();


  const slug =

    new URLSearchParams(
      location.search
    )
      .get(
        "cliente"
      )

    ||

    "bella-massa-demo";


  console.info(
    "WAP Motor Comercial V3.1:",
    slug
  );


  document.body
    .classList
    .add(
      "wap-loading"
    );


  try{

    /* EMPRESA */

    const companies =
      await supabaseRest(
        "empresas_demo",
        {

          select:
            "*",

          slug:
            `eq.${slug}`,

          limit:
            "1"

        }
      );


    if(
      !companies.length
    ){

      throw new Error(
        `Cliente '${slug}' não encontrado.`
      );

    }


    const company =
      companies[0];


    applyEmpresa(
      company
    );


    /* PRODUTOS */

    const products =
      await supabaseRest(
        "produtos_demo",
        {

          select:
            "*",

          empresa_id:
            `eq.${company.id}`,

          ativo:
            "eq.true",

          order:
            "id.asc"

        }
      );


    pizzas =
      normalizeProducts(
        products ||
        []
      );


    if(
      !pizzas.length
    ){

      pizzas =
        fallbackPizzas;

    }


    renderFilters();

    renderPizzas();

    updateCart();


    setTimeout(
      setupRevealAnimations,
      80
    );


    console.info(
      "WAP Motor carregado",
      {

        empresa:
          company.nome,

        produtos:
          pizzas.length,

        perfil:
          detectProfile(
            company
          ),

        experiencia:
          inferExperience(
            company
          )

      }
    );

  }catch(
    error
  ){

    console.error(
      "Falha ao carregar cliente:",
      error
    );


    const company =
      fallbackEmpresa();


    applyEmpresa(
      company
    );


    pizzas =
      fallbackPizzas;


    renderFilters();

    renderPizzas();

    updateCart();


    setTimeout(
      setupRevealAnimations,
      80
    );


    showToast(
      "Demo carregada em modo local.",
      "info"
    );

  }finally{

    document.body
      .classList
      .remove(
        "wap-loading"
      );


    document.body
      .classList
      .add(
        "wap-ready"
      );

  }

}


/* =========================================================
   COMPATIBILIDADE COM HTML ANTIGO
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


window.demoOnly =
  demoCommercial;


/* =========================================================
   START
   ========================================================= */

boot();