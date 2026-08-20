/* WAP Motor Comercial V2
   Demo por URL: index.html?cliente=slug
   Dados: empresas_demo + produtos_demo
*/

let EMPRESA = null;
let pizzas = [];
let cart = [];

const fallbackPizzas = [
  {id:1,nome:"Mussarela",categoria:"Clássicas",descricao:"Mussarela e orégano.",preco:39.90,imagem_url:"assets/mussarela.jpg",preco_publico:false},
  {id:2,nome:"Calabresa",categoria:"Clássicas",descricao:"Calabresa, cebola e orégano.",preco:41.90,imagem_url:"assets/calabresa.jpg",preco_publico:false},
  {id:3,nome:"Portuguesa",categoria:"Especiais",descricao:"Presunto, ovos, cebola e azeitonas.",preco:42.90,imagem_url:"assets/portuguesa.jpg",preco_publico:false},
  {id:4,nome:"Frango com Catupiry",categoria:"Especiais",descricao:"Frango desfiado com catupiry.",preco:45.90,imagem_url:"assets/frango.jpg",preco_publico:false},
  {id:5,nome:"Chocolate",categoria:"Doces",descricao:"Chocolate ao leite.",preco:34.90,imagem_url:"assets/chocolate.jpg",preco_publico:false}
];

const money = v => Number(v || 0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const slugify = v => String(v || "").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");

function imageFallback(nome){
  const n = slugify(nome);
  if(n.includes("calabresa")) return "assets/calabresa.jpg";
  if(n.includes("mussarela") || n.includes("mucarela")) return "assets/mussarela.jpg";
  if(n.includes("portuguesa")) return "assets/portuguesa.jpg";
  if(n.includes("frango")) return "assets/frango.jpg";
  if(n.includes("lombo")) return "assets/lombo.jpg";
  if(n.includes("bacon")) return "assets/bacon.jpg";
  if(n.includes("chocolate") || n.includes("doce")) return "assets/chocolate.jpg";
  return "assets/hero-pizza.jpg";
}

function instagramHandle(url){
  if(!url) return "Instagram não informado";
  try {
    const u = new URL(url);
    return `@${u.pathname.replace(/\//g,"")}`;
  } catch { return url; }
}

function safeImage(el, fallback){
  if(!el) return;
  el.onerror = () => {
    el.onerror = null;
    el.src = fallback;
  };
}

function applyEmpresa(e){
  EMPRESA = e;
  const nome = e.nome || "Pizzaria Demo";
  document.title = `${nome} | Demonstração de Delivery`;
  document.querySelector("#pageDescription")?.setAttribute("content", `${nome} — demonstração personalizada de delivery digital.`);
  document.querySelector("#benefitBrand").textContent = nome.toUpperCase();
  document.querySelector("#footerBrand").textContent = nome.toUpperCase();
  document.querySelector("#contactPhone").textContent = `💬 ${e.whatsapp || "WhatsApp não informado"}`;
  document.querySelector("#contactInstagram").textContent = `📷 ${instagramHandle(e.instagram_url)}`;
  document.querySelector("#contactLocation").textContent = `📍 ${[e.cidade,e.estado].filter(Boolean).join(" - ") || "Localização não informada"}`;
  document.querySelector("#heroDescription").textContent = e.descricao_curta || `Uma experiência de delivery personalizada para ${nome}.`;

  const logo = e.logo_url || "assets/logo.jpg";
  const brandLogo = document.querySelector("#brandLogo");
  const contactLogo = document.querySelector("#contactLogo");
  brandLogo.src = logo; brandLogo.alt = nome; safeImage(brandLogo,"assets/logo.jpg");
  contactLogo.src = logo; contactLogo.alt = nome; safeImage(contactLogo,"assets/logo.jpg");

  const hero = document.querySelector("#heroPizza");
  hero.src = e.hero_image_url || "assets/hero-pizza.jpg";
  safeImage(hero,"assets/hero-pizza.jpg");

  const delivery = document.querySelector("#deliveryBike");
  delivery.src = e.delivery_image_url || "assets/delivery.jpg";
  safeImage(delivery,"assets/delivery.jpg");

  if(e.cor_primaria) document.documentElement.style.setProperty("--demo-primary", e.cor_primaria);
  if(e.cor_secundaria) document.documentElement.style.setProperty("--demo-secondary", e.cor_secundaria);

  // Em uma demo comercial nenhum botão deve enviar pedido real.
  ["#heroWhatsapp","#contactWhatsapp","#floatingWhatsapp"].forEach(sel=>{
    const el = document.querySelector(sel);
    if(!el) return;
    el.href = "#";
    el.onclick = demoOnly;
  });
}

function demoOnly(ev){
  if(ev) ev.preventDefault();
  alert("Ambiente demonstrativo WAP. Nenhum pedido será enviado.");
}

function renderFilters(){
  const box = document.querySelector("#filters");
  const cats = [...new Set(pizzas.map(p=>p.categoria).filter(Boolean))];
  box.innerHTML = `<button class="active" data-filter="todas">Todas</button>` +
    cats.map(c=>`<button data-filter="${slugify(c)}">${c}</button>`).join("");
}

function priceLabel(p){
  if(p.preco === null || p.preco === undefined || Number(p.preco) <= 0) return "Consulte";
  return money(p.preco);
}

function renderPizzas(filter="todas"){
  const grid = document.querySelector("#pizzaGrid");
  const list = filter === "todas" ? pizzas : pizzas.filter(p=>slugify(p.categoria)===filter);
  grid.innerHTML = list.map(p=>`
    <article class="card">
      <img src="${p.imagem_url || imageFallback(p.nome)}" alt="${p.nome}" onerror="this.onerror=null;this.src='${imageFallback(p.nome)}'">
      <div class="card-body">
        <h3>${p.nome}</h3>
        <p>${p.descricao || "Item do cardápio demonstrativo."}</p>
        <div class="card-bottom">
          <span class="price">${priceLabel(p)}${p.preco_publico ? '<small class="public-price"> preço público</small>' : ''}</span>
          <button class="add-btn" onclick="addToCart(${p.id})">+ ADICIONAR</button>
        </div>
      </div>
    </article>`).join("");
}

function addToCart(id){
  const product = pizzas.find(p=>p.id===id);
  if(!product) return;
  const found = cart.find(i=>i.id===id);
  if(found) found.qtd++;
  else cart.push({...product,qtd:1});
  updateCart();
  openCart();
}

function changeQty(id,delta){
  const item = cart.find(i=>i.id===id);
  if(!item) return;
  item.qtd += delta;
  if(item.qtd<=0) cart = cart.filter(i=>i.id!==id);
  updateCart();
}

function removeItem(id){
  cart = cart.filter(i=>i.id!==id);
  updateCart();
}

function updateCart(){
  document.querySelector("#cartCount").textContent = cart.reduce((s,i)=>s+i.qtd,0);
  const box = document.querySelector("#cartItems");
  box.innerHTML = !cart.length ? '<div class="empty">Seu carrinho está vazio 🍕</div>' : cart.map(i=>`
    <div class="cart-item">
      <div>
        <b>${i.nome}</b><br>
        <small>${priceLabel(i)}${i.preco_publico ? " • preço público" : ""}</small>
        <button class="remove-item" onclick="removeItem(${i.id})">remover</button>
      </div>
      <div class="item-controls">
        <button onclick="changeQty(${i.id},-1)">−</button><b>${i.qtd}</b><button onclick="changeQty(${i.id},1)">+</button>
      </div>
    </div>`).join("");

  const total = cart.reduce((s,i)=>s+(Number(i.preco)||0)*i.qtd,0);
  document.querySelector("#cartTotal").textContent = money(total);
}

function openCart(){
  document.querySelector("#cartDrawer").classList.add("open");
  document.querySelector("#overlay").classList.add("show");
  document.querySelector("#cartDrawer").setAttribute("aria-hidden","false");
}
function closeCart(){
  document.querySelector("#cartDrawer").classList.remove("open");
  document.querySelector("#overlay").classList.remove("show");
  document.querySelector("#cartDrawer").setAttribute("aria-hidden","true");
}

document.querySelector("#openCart").onclick=openCart;
document.querySelector("#closeCart").onclick=closeCart;
document.querySelector("#overlay").onclick=closeCart;
document.querySelector("#continueOrder").onclick=closeCart;

document.querySelector("#filters").addEventListener("click",e=>{
  if(!e.target.matches("button")) return;
  document.querySelectorAll("#filters button").forEach(b=>b.classList.remove("active"));
  e.target.classList.add("active");
  renderPizzas(e.target.dataset.filter);
});

document.querySelector("#orderType").addEventListener("change",e=>{
  document.querySelector("#address").style.display = e.target.value==="Retirada" ? "none" : "block";
});

document.querySelector("#checkout").addEventListener("click",()=>{
  if(!cart.length){
    alert("Adicione pelo menos um item ao carrinho para testar o fluxo.");
    return;
  }
  alert("Simulação concluída. Este ambiente é uma demonstração WAP e nenhum pedido foi enviado.");
});

async function supabaseRest(path, params={}){
  const cfg = window.WAP_CONFIG || {};
  const url = cfg.SUPABASE_URL;
  const key = cfg.SUPABASE_ANON_KEY;
  if(!url || !key) throw new Error("config.js não configurado.");

  const qs = new URLSearchParams(params);
  const endpoint = `${url}/rest/v1/${path}?${qs.toString()}`;
  const res = await fetch(endpoint,{
    headers:{apikey:key,Accept:"application/json"},
    cache:"no-store"
  });
  if(!res.ok){
    const detail = await res.text();
    throw new Error(`Supabase REST ${res.status}: ${detail}`);
  }
  return res.json();
}

async function boot(){
  const slug = new URLSearchParams(location.search).get("cliente") || "bella-massa-demo";
  console.info("WAP Demo V2: carregando cliente",slug);

  try{
    const empresas = await supabaseRest("empresas_demo",{
      select:"*",
      slug:`eq.${slug}`,
      limit:"1"
    });
    if(!empresas.length) throw new Error(`Cliente '${slug}' não encontrado.`);

    const e = empresas[0];
    applyEmpresa(e);

    const prod = await supabaseRest("produtos_demo",{
      select:"*",
      empresa_id:`eq.${e.id}`,
      ativo:"eq.true",
      order:"id.asc"
    });

    pizzas = (prod || []).map(p=>({
      id:p.id,
      nome:p.nome,
      categoria:p.categoria || "Cardápio",
      descricao:p.descricao,
      preco:p.preco === null ? null : Number(p.preco || 0),
      imagem_url:p.imagem_url || imageFallback(p.nome),
      preco_publico:!!p.preco_publico,
      fonte_url:p.fonte_url || ""
    }));

    if(!pizzas.length) pizzas = fallbackPizzas;
    renderFilters();
    renderPizzas();
    updateCart();

    console.info("WAP Demo V2: carregado com sucesso",{empresa:e.nome,produtos:pizzas.length});
  }catch(err){
    console.error("WAP Demo V2: falha",err);
    applyEmpresa({
      nome:"Pizzaria Demo",
      cidade:"Taboão da Serra",
      estado:"SP",
      logo_url:"assets/logo.jpg",
      hero_image_url:"assets/hero-pizza.jpg",
      delivery_image_url:"assets/delivery.jpg"
    });
    pizzas = fallbackPizzas;
    renderFilters();
    renderPizzas();
    updateCart();
  }
}
boot();
