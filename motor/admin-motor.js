const cfg = window.WAP_CONFIG || {};
const sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

let companies=[],proposals=[],products=[];
let currentCompanyId=null;

const $=s=>document.querySelector(s);
const loginView=$("#loginView"), panelView=$("#panelView"), loginForm=$("#loginForm");
const loginMessage=$("#loginMessage"), sessionEmail=$("#sessionEmail"), logoutBtn=$("#logoutBtn");
const refreshBtn=$("#refreshBtn"), newCompanyBtn=$("#newCompanyBtn"), companiesList=$("#companiesList");
const searchInput=$("#searchInput"), companyDialog=$("#companyDialog"), companyForm=$("#companyForm");
const formMessage=$("#formMessage"), productsDialog=$("#productsDialog"), productForm=$("#productForm");
const productsList=$("#productsList"), productMessage=$("#productMessage");

const DEMO_BASE = `${location.origin}${location.pathname.replace(/admin-motor\.html.*$/,"")}`;

function slugify(v){return String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"")}
function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function demoUrl(c){return `${DEMO_BASE}?cliente=${encodeURIComponent(c.slug)}`}
function proposalFor(id){return proposals.find(p=>String(p.empresa_id)===String(id))}

async function currentSession(){const{data}=await sb.auth.getSession();return data.session}
async function showSession(session){
  const logged=!!session;
  loginView.classList.toggle("hidden",logged); panelView.classList.toggle("hidden",!logged);
  logoutBtn.classList.toggle("hidden",!logged); refreshBtn.classList.toggle("hidden",!logged); newCompanyBtn.classList.toggle("hidden",!logged);
  sessionEmail.textContent=session?.user?.email||"Não conectado";
  if(logged) await loadAll();
}

loginForm.addEventListener("submit",async e=>{
  e.preventDefault(); loginMessage.textContent="Entrando...";
  const{data,error}=await sb.auth.signInWithPassword({email:$("#loginEmail").value.trim(),password:$("#loginPassword").value});
  if(error){loginMessage.textContent=`Erro: ${error.message}`;return}
  loginMessage.textContent=""; await showSession(data.session);
});
logoutBtn.onclick=async()=>{await sb.auth.signOut();await showSession(null)};
refreshBtn.onclick=loadAll;

async function loadAll(){
  companiesList.innerHTML='<div class="empty">Carregando...</div>';
  const[c,p,pr]=await Promise.all([
    sb.from("empresas_demo").select("*").order("created_at",{ascending:false}),
    sb.from("propostas_demo").select("*").order("created_at",{ascending:false}),
    sb.from("produtos_demo").select("*").order("id",{ascending:true})
  ]);
  if(c.error){companiesList.innerHTML=`<div class="empty">Erro: ${c.error.message}</div>`;return}
  companies=c.data||[]; proposals=p.data||[]; products=pr.data||[];
  $("#statCompanies").textContent=companies.length;
  $("#statProposals").textContent=proposals.length;
  $("#statPending").textContent=proposals.filter(x=>x.status_envio==="nao_enviado").length;
  $("#statProducts").textContent=products.filter(x=>x.ativo!==false).length;
  renderCompanies();
}

function approach(c,p){
  const custom = p?.mensagem_abordagem?.trim();
  const intro = custom || `Olá! Analisamos a presença digital da ${c.nome} e preparamos uma demonstração personalizada de como uma experiência própria de delivery poderia funcionar para vocês.`;
  return `${intro}

🍕 Demonstração personalizada:
${demoUrl(c)}

É apenas uma demonstração, sem compromisso. Se fizer sentido, posso explicar a proposta por aqui.`;
}

function renderCompanies(){
  const q=searchInput.value.trim().toLowerCase();
  const list=companies.filter(c=>!q||[c.nome,c.cidade,c.segmento,c.slug].filter(Boolean).join(" ").toLowerCase().includes(q));
  if(!list.length){companiesList.innerHTML='<div class="empty">Nenhuma empresa encontrada.</div>';return}

  companiesList.innerHTML=list.map(c=>{
    const p=proposalFor(c.id);
    const count=products.filter(x=>String(x.empresa_id)===String(c.id)&&x.ativo!==false).length;
    return `<article class="company">
      <div><h3>${escapeHtml(c.nome)}</h3><div class="meta">${escapeHtml(c.segmento||"")} • ${escapeHtml([c.cidade,c.estado].filter(Boolean).join(" - "))} • ${count} item(ns)</div></div>
      <div><span class="status">${escapeHtml(p?.status_envio||c.status||"prospect")}</span></div>
      <div class="meta">${escapeHtml(c.instagram_url||"Instagram não informado")}</div>
      <div class="actions">
        <a class="action green" href="${demoUrl(c)}" target="_blank">Abrir demo</a>
        ${c.instagram_url?`<a class="action" href="${escapeHtml(c.instagram_url)}" target="_blank">Instagram</a>`:""}
        <button class="action" data-copy="${c.id}">Copiar abordagem</button>
        <button class="action" data-products="${c.id}">Cardápio</button>
        <button class="action" data-edit="${c.id}">Editar</button>
        ${p?`<button class="action" data-sent="${p.id}">Marcar enviado</button>`:""}
      </div>
    </article>`;
  }).join("");
}
searchInput.oninput=renderCompanies;

companiesList.addEventListener("click",async e=>{
  const copy=e.target.closest("[data-copy]");
  if(copy){
    const c=companies.find(x=>String(x.id)===copy.dataset.copy);
    const p=proposalFor(c.id);
    await navigator.clipboard.writeText(approach(c,p));
    const old=copy.textContent;copy.textContent="Copiado ✓";setTimeout(()=>copy.textContent=old,1200);
  }
  const sent=e.target.closest("[data-sent]");
  if(sent){
    const{error}=await sb.from("propostas_demo").update({status_envio:"enviado",enviado_em:new Date().toISOString()}).eq("id",sent.dataset.sent);
    if(error) alert(error.message); else await loadAll();
  }
  const edit=e.target.closest("[data-edit]");
  if(edit) openCompany(companies.find(x=>String(x.id)===edit.dataset.edit));
  const prod=e.target.closest("[data-products]");
  if(prod) openProducts(companies.find(x=>String(x.id)===prod.dataset.products));
});

function openCompany(c=null){
  companyForm.reset();formMessage.textContent="";
  for(const el of companyForm.elements){if(el.name) el.value=c?.[el.name]??""}
  companyDialog.showModal();
}
newCompanyBtn.onclick=()=>openCompany();
$("#closeDialog").onclick=()=>companyDialog.close();
$("#cancelDialog").onclick=()=>companyDialog.close();

companyForm.addEventListener("input",e=>{
  if(e.target.name==="nome"&&!companyForm.elements.slug.dataset.manual) companyForm.elements.slug.value=slugify(e.target.value);
  if(e.target.name==="slug") e.target.dataset.manual="1";
});

companyForm.addEventListener("submit",async e=>{
  e.preventDefault();formMessage.textContent="Salvando...";
  const payload=Object.fromEntries(new FormData(companyForm).entries());
  const id=payload.id; delete payload.id; payload.slug=slugify(payload.slug); payload.status=payload.status||"prospect";
  let result;
  if(id) result=await sb.from("empresas_demo").update(payload).eq("id",id).select().single();
  else result=await sb.from("empresas_demo").insert(payload).select().single();
  if(result.error){formMessage.textContent=`Erro: ${result.error.message}`;return}

  if(!id){
    await sb.from("propostas_demo").insert({
      empresa_id:result.data.id,
      titulo:`Demonstração personalizada para ${result.data.nome}`,
      mensagem_abordagem:`Olá! Analisamos a presença digital da ${result.data.nome} e preparamos uma demonstração personalizada de como uma experiência própria de delivery poderia funcionar para vocês.`,
      link_demo:`?cliente=${result.data.slug}`,
      status_envio:"nao_enviado"
    });
  }
  formMessage.textContent="Salvo.";
  setTimeout(()=>companyDialog.close(),350);
  await loadAll();
});

function openProducts(c){
  currentCompanyId=c.id;
  $("#productsTitle").textContent=`Cardápio — ${c.nome}`;
  productForm.reset();
  productForm.elements.empresa_id.value=c.id;
  productMessage.textContent="";
  renderProducts(c.id);
  productsDialog.showModal();
}
$("#closeProducts").onclick=()=>productsDialog.close();

function renderProducts(companyId){
  const list=products.filter(p=>String(p.empresa_id)===String(companyId)&&p.ativo!==false);
  productsList.innerHTML=list.length?list.map(p=>`
    <div class="product-row">
      <div><b>${escapeHtml(p.nome)}</b><br><small>${escapeHtml(p.categoria||"")} • ${p.preco?`R$ ${Number(p.preco).toFixed(2).replace(".",",")}`:"Consulte"}${p.preco_publico?" • público":""}</small></div>
      <a class="action" href="${escapeHtml(p.fonte_url||"#")}" ${p.fonte_url?'target="_blank"':""}>Fonte</a>
      <button class="del" data-del-product="${p.id}">Excluir</button>
    </div>`).join(""):'<div class="empty">Nenhum item cadastrado.</div>';
}

productForm.addEventListener("submit",async e=>{
  e.preventDefault();productMessage.textContent="Adicionando...";
  const payload=Object.fromEntries(new FormData(productForm).entries());
  payload.empresa_id=Number(payload.empresa_id);
  payload.preco=payload.preco?Number(payload.preco):null;
  payload.preco_publico=payload.preco_publico==="true";
  payload.ativo=true;
  const{error}=await sb.from("produtos_demo").insert(payload);
  if(error){productMessage.textContent=`Erro: ${error.message}`;return}
  productMessage.textContent="Item adicionado.";
  productForm.reset();productForm.elements.empresa_id.value=currentCompanyId;
  await loadAll();renderProducts(currentCompanyId);
});

productsList.addEventListener("click",async e=>{
  const del=e.target.closest("[data-del-product]");
  if(!del)return;
  if(!confirm("Remover este item da demo?"))return;
  const{error}=await sb.from("produtos_demo").delete().eq("id",del.dataset.delProduct);
  if(error) alert(error.message); else{await loadAll();renderProducts(currentCompanyId)}
});

sb.auth.onAuthStateChange((_event,session)=>showSession(session));
currentSession().then(showSession);
