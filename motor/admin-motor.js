const cfg = window.WAP_CONFIG || {};
const SUPABASE_URL = cfg.SUPABASE_URL;
const SUPABASE_KEY = cfg.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  alert("config.js não encontrado ou incompleto.");
}

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
let companies = [];
let proposals = [];
let products = [];

const $ = s => document.querySelector(s);
const loginView = $("#loginView");
const panelView = $("#panelView");
const loginForm = $("#loginForm");
const loginMessage = $("#loginMessage");
const sessionEmail = $("#sessionEmail");
const logoutBtn = $("#logoutBtn");
const refreshBtn = $("#refreshBtn");
const newCompanyBtn = $("#newCompanyBtn");
const companiesList = $("#companiesList");
const searchInput = $("#searchInput");
const dialog = $("#companyDialog");
const companyForm = $("#companyForm");
const formMessage = $("#formMessage");

function slugify(v){
  return String(v || "").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
}

async function currentSession(){
  const { data } = await sb.auth.getSession();
  return data.session;
}

async function showSession(session){
  const logged = !!session;
  loginView.classList.toggle("hidden", logged);
  panelView.classList.toggle("hidden", !logged);
  logoutBtn.classList.toggle("hidden", !logged);
  refreshBtn.classList.toggle("hidden", !logged);
  newCompanyBtn.classList.toggle("hidden", !logged);
  sessionEmail.textContent = session?.user?.email || "Não conectado";
  if(logged) await loadAll();
}

loginForm.addEventListener("submit", async e=>{
  e.preventDefault();
  loginMessage.textContent = "Entrando...";
  const email = $("#loginEmail").value.trim();
  const password = $("#loginPassword").value;
  const { data, error } = await sb.auth.signInWithPassword({email,password});
  if(error){ loginMessage.textContent = `Erro: ${error.message}`; return; }
  loginMessage.textContent = "";
  await showSession(data.session);
});

logoutBtn.addEventListener("click", async()=>{
  await sb.auth.signOut();
  await showSession(null);
});

refreshBtn.addEventListener("click", loadAll);

async function loadAll(){
  companiesList.innerHTML = '<div class="empty">Carregando...</div>';

  const [c,p,pr] = await Promise.all([
    sb.from("empresas_demo").select("*").order("created_at",{ascending:false}),
    sb.from("propostas_demo").select("*").order("created_at",{ascending:false}),
    sb.from("produtos_demo").select("*").eq("ativo",true)
  ]);

  if(c.error){ companiesList.innerHTML = `<div class="empty">Erro empresas: ${c.error.message}</div>`; return; }
  if(p.error) console.warn("Propostas:",p.error.message);
  if(pr.error) console.warn("Produtos:",pr.error.message);

  companies = c.data || [];
  proposals = p.data || [];
  products = pr.data || [];
  renderStats();
  renderCompanies();
}

function renderStats(){
  $("#statCompanies").textContent = companies.length;
  $("#statProposals").textContent = proposals.length;
  $("#statPending").textContent = proposals.filter(p=>p.status_envio==="nao_enviado").length;
  $("#statProducts").textContent = products.length;
}

function proposalFor(companyId){
  return proposals.find(p=>String(p.empresa_id)===String(companyId));
}

function renderCompanies(){
  const q = searchInput.value.trim().toLowerCase();
  const list = companies.filter(c=>{
    const text = [c.nome,c.cidade,c.segmento,c.slug].filter(Boolean).join(" ").toLowerCase();
    return !q || text.includes(q);
  });

  if(!list.length){
    companiesList.innerHTML = '<div class="empty">Nenhuma empresa encontrada.</div>';
    return;
  }

  companiesList.innerHTML = list.map(c=>{
    const p = proposalFor(c.id);
    const demo = `index.html?cliente=${encodeURIComponent(c.slug)}`;
    const message = p?.mensagem_abordagem || `Olá! Preparamos uma demonstração digital personalizada para ${c.nome}.`;
    return `
      <article class="company">
        <div>
          <h3>${escapeHtml(c.nome)}</h3>
          <div class="meta">${escapeHtml(c.segmento || "segmento não informado")} • ${escapeHtml([c.cidade,c.estado].filter(Boolean).join(" - ") || "sem localização")}</div>
        </div>
        <div><span class="status">${escapeHtml(p?.status_envio || c.status || "prospect")}</span></div>
        <div class="meta">${escapeHtml(c.instagram_url || "Instagram não informado")}</div>
        <div class="actions">
          <a class="action green" href="${demo}" target="_blank">Abrir demo</a>
          ${c.instagram_url ? `<a class="action" href="${escapeAttr(c.instagram_url)}" target="_blank">Instagram</a>` : ""}
          <button class="action" data-copy="${escapeAttr(message)}">Copiar abordagem</button>
          ${p ? `<button class="action" data-sent="${p.id}">Marcar enviado</button>` : ""}
        </div>
      </article>`;
  }).join("");
}

searchInput.addEventListener("input",renderCompanies);

companiesList.addEventListener("click", async e=>{
  const copy = e.target.closest("[data-copy]");
  if(copy){
    await navigator.clipboard.writeText(copy.dataset.copy);
    const old = copy.textContent; copy.textContent = "Copiado ✓";
    setTimeout(()=>copy.textContent=old,1200);
  }

  const sent = e.target.closest("[data-sent]");
  if(sent){
    sent.disabled = true;
    const { error } = await sb.from("propostas_demo")
      .update({status_envio:"enviado",enviado_em:new Date().toISOString()})
      .eq("id",sent.dataset.sent);
    if(error) alert("Erro ao atualizar proposta: "+error.message);
    await loadAll();
  }
});

newCompanyBtn.addEventListener("click",()=>dialog.showModal());
$("#closeDialog").addEventListener("click",()=>dialog.close());
$("#cancelDialog").addEventListener("click",()=>dialog.close());

companyForm.addEventListener("input",e=>{
  if(e.target.name==="nome"){
    const slugInput = companyForm.elements.slug;
    if(!slugInput.dataset.manual) slugInput.value = slugify(e.target.value);
  }
  if(e.target.name==="slug") e.target.dataset.manual="1";
});

companyForm.addEventListener("submit", async e=>{
  e.preventDefault();
  formMessage.textContent = "Salvando...";
  const fd = new FormData(companyForm);
  const payload = Object.fromEntries(fd.entries());
  payload.slug = slugify(payload.slug);
  payload.status = "prospect";
  const {data,error} = await sb.from("empresas_demo").insert(payload).select().single();
  if(error){ formMessage.textContent = `Erro: ${error.message}`; return; }

  const demoLink = `index.html?cliente=${data.slug}`;
  const {error:pError} = await sb.from("propostas_demo").insert({
    empresa_id:data.id,
    titulo:`Demonstração personalizada para ${data.nome}`,
    mensagem_abordagem:`Olá! Preparamos uma demonstração digital personalizada para ${data.nome}. Gostaria de te mostrar como uma experiência própria de delivery pode funcionar para a empresa.`,
    link_demo:demoLink,
    status_envio:"nao_enviado"
  });

  if(pError) console.warn("Empresa criada, mas proposta não foi criada:",pError.message);
  formMessage.textContent = "Empresa criada.";
  companyForm.reset();
  setTimeout(()=>dialog.close(),450);
  await loadAll();
});

function escapeHtml(v){
  return String(v ?? "").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}
function escapeAttr(v){ return escapeHtml(v); }

sb.auth.onAuthStateChange((_event,session)=>showSession(session));
currentSession().then(showSession);
