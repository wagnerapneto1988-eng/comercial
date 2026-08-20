/* WAP Migo — motor dinâmico de demonstrações
   URL: index.html?cliente=bella-massa-demo
*/

const FALLBACK_WHATSAPP = "";
let WHATSAPP = FALLBACK_WHATSAPP;
let EMPRESA = null;
let pizzas = [];
let cart = [];

const fallbackPizzas = [
  {id:1,nome:"Mussarela",categoria:"Clássicas",desc:"Mussarela de qualidade e orégano especial.",preco:39.90,img:"assets/mussarela.jpg"},
  {id:2,nome:"Calabresa",categoria:"Clássicas",desc:"Calabresa fatiada, cebola e orégano.",preco:41.90,img:"assets/calabresa.jpg"},
  {id:3,nome:"Portuguesa",categoria:"Especiais",desc:"Presunto, ovos, cebola, pimentão e azeitonas.",preco:42.90,img:"assets/portuguesa.jpg"},
  {id:4,nome:"Frango com Catupiry",categoria:"Especiais",desc:"Frango desfiado com catupiry e orégano.",preco:45.90,img:"assets/frango.jpg"},
  {id:5,nome:"Chocolate",categoria:"Doces",desc:"Chocolate ao leite com granulado.",preco:34.90,img:"assets/chocolate.jpg"}
];

const money = v => Number(v || 0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const slugify = v => String(v || "").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");

function imageFallback(nome){
  const n = slugify(nome);
  if(n.includes("calabresa")) return "assets/calabresa.jpg";
  if(n.includes("mussarela") || n.includes("muçarela")) return "assets/mussarela.jpg";
  if(n.includes("portuguesa")) return "assets/portuguesa.jpg";
  if(n.includes("frango") || n.includes("queijo")) return "assets/frango.jpg";
  if(n.includes("lombo")) return "assets/lombo.jpg";
  if(n.includes("bacon")) return "assets/bacon.jpg";
  if(n.includes("chocolate") || n.includes("doce")) return "assets/chocolate.jpg";
  return "assets/hero-pizza.jpg";
}

function normalizaWhatsApp(v){ return String(v || "").replace(/\D/g,""); }
function whatsappLink(texto=""){
  if(!WHATSAPP) return "#";
  return `https://wa.me/${WHATSAPP}${texto ? `?text=${encodeURIComponent(texto)}` : ""}`;
}
function instagramHandle(url){
  if(!url) return "Instagram não informado";
  try { const u = new URL(url); return `@${u.pathname.replace(/\//g,"")}`; } catch { return url; }
}

function applyEmpresa(e){
  EMPRESA = e;
  const nome = e.nome || "Pizzaria Demo";
  WHATSAPP = normalizaWhatsApp(e.whatsapp);
  document.title = `${nome} | Delivery`;
  document.querySelector("#pageDescription")?.setAttribute("content", `${nome} — demonstração personalizada de delivery digital.`);
  document.querySelector("#benefitBrand").textContent = nome.toUpperCase();
  document.querySelector("#footerBrand").textContent = nome.toUpperCase();
  document.querySelector("#contactPhone").textContent = `💬 ${e.whatsapp || "WhatsApp demonstrativo"}`;
  document.querySelector("#contactInstagram").textContent = `📷 ${instagramHandle(e.instagram_url)}`;
  document.querySelector("#contactLocation").textContent = `📍 ${[e.cidade,e.estado].filter(Boolean).join(" - ") || "Localização não informada"}`;
  const logo = e.logo_url || "assets/logo.jpg";
  document.querySelector("#brandLogo").src = logo;
  document.querySelector("#brandLogo").alt = nome;
  document.querySelector("#contactLogo").src = logo;
  document.querySelector("#contactLogo").alt = nome;
  const msg = `Olá ${nome}! Quero conhecer melhor esta demonstração de delivery.`;
  ["#heroWhatsapp","#contactWhatsapp","#floatingWhatsapp"].forEach(sel => {
    const el = document.querySelector(sel); if(!el) return;
    el.href = whatsappLink(msg);
    if(!WHATSAPP){ el.addEventListener("click", demoOnly); }
  });
  if(e.cor_primaria) document.documentElement.style.setProperty("--demo-primary", e.cor_primaria);
  if(e.cor_secundaria) document.documentElement.style.setProperty("--demo-secondary", e.cor_secundaria);
}

function demoOnly(ev){
  if(ev) ev.preventDefault();
  alert("Esta é uma demonstração comercial. O WhatsApp real será ativado após a contratação.");
}

function renderFilters(){
  const box = document.querySelector("#filters");
  const cats = [...new Set(pizzas.map(p => p.categoria).filter(Boolean))];
  box.innerHTML = `<button class="active" data-filter="todas">Todas</button>` + cats.map(c=>`<button data-filter="${slugify(c)}">${c}</button>`).join("");
}

function renderPizzas(filter="todas"){
  const grid = document.querySelector("#pizzaGrid");
  const list = filter === "todas" ? pizzas : pizzas.filter(p => slugify(p.categoria) === filter);
  grid.innerHTML = list.map(p=>`
    <article class="card">
      <img src="${p.img}" alt="${p.nome}" onerror="this.src='assets/hero-pizza.jpg'">
      <div class="card-body">
        <h3>${p.nome}</h3>
        <p>${p.desc || "Item disponível no cardápio demonstrativo."}</p>
        <div class="card-bottom"><span class="price">${money(p.preco)}</span><button class="add-btn" onclick="addToCart(${p.id})">+ ADICIONAR</button></div>
      </div>
    </article>`).join("");
}

function addToCart(id){
  const found = cart.find(i=>i.id===id);
  if(found) found.qtd++; else cart.push({...pizzas.find(p=>p.id===id),qtd:1});
  updateCart(); openCart();
}
function changeQty(id, delta){
  const item = cart.find(i=>i.id===id); if(!item) return;
  item.qtd += delta; if(item.qtd<=0) cart = cart.filter(i=>i.id!==id); updateCart();
}
function updateCart(){
  document.querySelector("#cartCount").textContent = cart.reduce((s,i)=>s+i.qtd,0);
  const box = document.querySelector("#cartItems");
  box.innerHTML = !cart.length ? '<div class="empty">Seu carrinho está vazio 🍕</div>' : cart.map(i=>`
    <div class="cart-item"><div><b>${i.nome}</b><br><small>${money(i.preco)} cada</small></div>
    <div class="item-controls"><button onclick="changeQty(${i.id},-1)">−</button><b>${i.qtd}</b><button onclick="changeQty(${i.id},1)">+</button></div></div>`).join("");
  document.querySelector("#cartTotal").textContent = money(cart.reduce((s,i)=>s+i.preco*i.qtd,0));
}
function openCart(){ document.querySelector("#cartDrawer").classList.add("open"); document.querySelector("#overlay").classList.add("show"); document.querySelector("#cartDrawer").setAttribute("aria-hidden","false"); }
function closeCart(){ document.querySelector("#cartDrawer").classList.remove("open"); document.querySelector("#overlay").classList.remove("show"); document.querySelector("#cartDrawer").setAttribute("aria-hidden","true"); }

document.querySelector("#openCart").onclick=openCart;
document.querySelector("#closeCart").onclick=closeCart;
document.querySelector("#overlay").onclick=closeCart;
document.querySelector("#filters").addEventListener("click",e=>{
  if(!e.target.matches("button")) return;
  document.querySelectorAll("#filters button").forEach(b=>b.classList.remove("active")); e.target.classList.add("active"); renderPizzas(e.target.dataset.filter);
});
document.querySelector("#orderType").addEventListener("change",e=>{ document.querySelector("#address").style.display = e.target.value==="Retirada" ? "none" : "block"; });
document.querySelector("#checkout").addEventListener("click",()=>{
  if(!cart.length){ alert("Adicione pelo menos um item ao carrinho."); return; }
  if(!WHATSAPP){ demoOnly(); return; }
  const nome = document.querySelector("#customerName").value.trim() || "Cliente";
  const tipo = document.querySelector("#orderType").value;
  const endereco = document.querySelector("#address").value.trim();
  const pagamento = document.querySelector("#payment").value;
  const obs = document.querySelector("#notes").value.trim();
  const total = cart.reduce((s,i)=>s+i.preco*i.qtd,0);
  const itens = cart.map(i=>`• ${i.qtd}x ${i.nome} — ${money(i.preco*i.qtd)}`).join("\n");
  let msg = `🍕 *NOVO PEDIDO — ${(EMPRESA?.nome || "PIZZARIA").toUpperCase()}*\n\n👤 *Cliente:* ${nome}\n\n${itens}\n\n💰 *Total:* ${money(total)}\n🚚 *Tipo:* ${tipo}`;
  if(tipo==="Entrega") msg += `\n📍 *Endereço:* ${endereco || "A confirmar"}`;
  msg += `\n💳 *Pagamento:* ${pagamento}`; if(obs) msg += `\n📝 *Observações:* ${obs}`;
  msg += `\n\nPedido enviado pelo cardápio digital.`;
  window.open(whatsappLink(msg),"_blank");
});

async function boot(){
  const slug = new URLSearchParams(location.search).get("cliente") || "bella-massa-demo";
  const cfg = window.WAP_CONFIG || {};
  const keyOk = cfg.SUPABASE_ANON_KEY && !cfg.SUPABASE_ANON_KEY.includes("COLE_AQUI");
  if(!window.supabase || !cfg.SUPABASE_URL || !keyOk){
    console.warn("Supabase ainda não configurado. Usando dados locais de fallback.");
    applyEmpresa({nome:"Pizzaria Bella Massa Demo",slug,cidade:"Taboão da Serra",estado:"SP",instagram_url:"https://instagram.com/bellamassa.pizzaria",whatsapp:"",logo_url:"assets/logo.jpg"});
    pizzas = fallbackPizzas; renderFilters(); renderPizzas(); updateCart(); return;
  }
  try{
    const db = window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
    const {data:e,error:eErr} = await db.from("empresas_demo").select("*").eq("slug",slug).single();
    if(eErr) throw eErr;
    applyEmpresa(e);
    const {data:prod,error:pErr} = await db.from("produtos_demo").select("*").eq("empresa_id",e.id).eq("ativo",true).order("id");
    if(pErr) throw pErr;
    pizzas = (prod || []).map(p=>({id:p.id,nome:p.nome,categoria:p.categoria || "Cardápio",desc:p.descricao,preco:Number(p.preco || 0),img:p.imagem_url || imageFallback(p.nome)}));
    if(!pizzas.length) pizzas = fallbackPizzas;
    renderFilters(); renderPizzas(); updateCart();
  }catch(err){
    console.error(err);
    alert("Não foi possível carregar esta demonstração do banco. Exibindo o modelo local.");
    applyEmpresa({nome:"Pizzaria Bella Massa Demo",slug,cidade:"Taboão da Serra",estado:"SP",whatsapp:"",logo_url:"assets/logo.jpg"});
    pizzas = fallbackPizzas; renderFilters(); renderPizzas(); updateCart();
  }
}
boot();
