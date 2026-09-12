const cfg = window.APP_CONFIG || {};
const configured = cfg.SUPABASE_URL && !cfg.SUPABASE_URL.includes("COLE_AQUI") &&
                   cfg.SUPABASE_ANON_KEY && !cfg.SUPABASE_ANON_KEY.includes("COLE_AQUI");
const setupWarning = document.getElementById("setupWarning");
if (!configured) setupWarning.classList.remove("hidden");
const sb = configured ? supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;

const loginCard=document.getElementById('loginCard');
const dashboard=document.getElementById('dashboard');
const loginForm=document.getElementById('loginForm');
const loginMsg=document.getElementById('loginMsg');
const cards=document.getElementById('cards');
const emptyState=document.getElementById('emptyState');
const search=document.getElementById('search');
const statusFilter=document.getElementById('statusFilter');
let rows=[];

function fmtDate(s){return new Date(s).toLocaleString('pt-BR');}
function safe(v){return String(v??'').replace(/[&<>"']/g,m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' }[m]));}
function statusLabel(s){return ({novo:'Novo',em_analise:'Em análise',proposta_enviada:'Proposta enviada',finalizado:'Finalizado'})[s]||s;}

async function verifyAdmin(){
  if(!sb) return false;
  const {data:{user}}=await sb.auth.getUser();
  if(!user) return false;
  const {data,error}=await sb.from('app_admins').select('user_id').eq('user_id',user.id).maybeSingle();
  if(error || !data){ await sb.auth.signOut(); return false; }
  return true;
}
async function refresh(){
  const {data,error}=await sb.from('diagnosticos').select('*').order('created_at',{ascending:false});
  if(error){alert("Erro ao carregar: "+error.message);return;}
  rows=data||[]; render();
}
function render(){
  const q=search.value.toLowerCase().trim(), st=statusFilter.value;
  const filtered=rows.filter(r=>{
    const hay=[r.nome_projeto,r.responsavel,r.contato].join(' ').toLowerCase();
    return (!q||hay.includes(q)) && (!st||r.status===st);
  });
  document.getElementById('totalCount').textContent=rows.length;
  document.getElementById('newCount').textContent=rows.filter(r=>r.status==='novo').length;
  document.getElementById('analysisCount').textContent=rows.filter(r=>r.status==='em_analise').length;
  cards.innerHTML=filtered.map(r=>{
    const a=r.respostas||{};
    return `<article class="card">
      <div class="card-top">
        <div><h3>${safe(r.nome_projeto)}</h3><div class="meta">${safe(r.responsavel)} · ${fmtDate(r.created_at)}</div></div>
        <span class="pill">${safe(statusLabel(r.status))}</span>
      </div>
      <p>${safe(a.ideiaCentral||'')}</p>
      <div class="grid2">
        <div class="kv"><strong>Contato</strong>${safe(r.contato||'Não informado')}</div>
        <div class="kv"><strong>Primeira versão</strong>${safe(a.primeiraVersao||'Não informado')}</div>
      </div>
      <div class="card-actions">
        <select data-id="${r.id}" class="statusSelect">
          <option value="novo" ${r.status==='novo'?'selected':''}>Novo</option>
          <option value="em_analise" ${r.status==='em_analise'?'selected':''}>Em análise</option>
          <option value="proposta_enviada" ${r.status==='proposta_enviada'?'selected':''}>Proposta enviada</option>
          <option value="finalizado" ${r.status==='finalizado'?'selected':''}>Finalizado</option>
        </select>
      </div>
      <details><summary>Ver relatório completo</summary><pre>${safe(r.relatorio||'')}</pre></details>
    </article>`;
  }).join('');
  emptyState.classList.toggle('hidden',filtered.length!==0);
  document.querySelectorAll('.statusSelect').forEach(el=>el.addEventListener('change',updateStatus));
}
async function updateStatus(e){
  const id=e.target.dataset.id, status=e.target.value;
  const {error}=await sb.from('diagnosticos').update({status}).eq('id',id);
  if(error){alert("Não foi possível atualizar: "+error.message);return;}
  const row=rows.find(x=>x.id===id); if(row) row.status=status; render();
}
loginForm.addEventListener('submit',async e=>{
  e.preventDefault(); if(!sb){loginMsg.textContent="Configure o Supabase primeiro.";return;}
  loginMsg.textContent="Entrando...";
  const {error}=await sb.auth.signInWithPassword({email:document.getElementById('email').value,password:document.getElementById('password').value});
  if(error){loginMsg.textContent=error.message;return;}
  if(!(await verifyAdmin())){loginMsg.textContent="Usuário autenticado, mas sem permissão de administrador.";return;}
  loginCard.classList.add('hidden'); dashboard.classList.remove('hidden'); await refresh();
});
document.getElementById('logoutBtn').addEventListener('click',async()=>{await sb.auth.signOut();dashboard.classList.add('hidden');loginCard.classList.remove('hidden');});
document.getElementById('refreshBtn').addEventListener('click',refresh);
search.addEventListener('input',render);statusFilter.addEventListener('change',render);

(async()=>{
  if(!sb) return;
  if(await verifyAdmin()){loginCard.classList.add('hidden');dashboard.classList.remove('hidden');await refresh();}
})();
