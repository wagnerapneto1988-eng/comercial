const cfg = window.APP_CONFIG || {};
const configured = cfg.SUPABASE_URL && !cfg.SUPABASE_URL.includes("COLE_AQUI") &&
                   cfg.SUPABASE_ANON_KEY && !cfg.SUPABASE_ANON_KEY.includes("COLE_AQUI");
const setupWarning = document.getElementById("setupWarning");
if (!configured) setupWarning.classList.remove("hidden");
const sb = configured ? supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;

const form = document.getElementById('diagnosticForm');
const steps = [...document.querySelectorAll('.step')];
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const finishBtn = document.getElementById('finishBtn');
const progressBar = document.getElementById('progressBar');
const stepLabel = document.getElementById('stepLabel');
const progressText = document.getElementById('progressText');
const result = document.getElementById('result');
const resultMessage = document.getElementById('resultMessage');
const report = document.getElementById('report');
let current = 0;

function updateUI(){
  steps.forEach((s,i)=>s.classList.toggle('active',i===current));
  const pct=Math.round(((current+1)/steps.length)*100);
  progressBar.style.width=pct+'%';
  stepLabel.textContent=`Etapa ${current+1} de ${steps.length} — ${steps[current].dataset.title}`;
  progressText.textContent=pct+'%';
  prevBtn.disabled=current===0;
  nextBtn.classList.toggle('hidden',current===steps.length-1);
  finishBtn.classList.toggle('hidden',current!==steps.length-1);
}
function validateCurrent(){
  for(const field of steps[current].querySelectorAll('[required]')){
    if(!String(field.value||'').trim()){field.reportValidity();field.focus();return false;}
  }
  return true;
}
prevBtn.addEventListener('click',()=>{if(current>0){current--;updateUI()}});
nextBtn.addEventListener('click',()=>{if(validateCurrent()&&current<steps.length-1){current++;updateUI()}});

const checked=name=>[...form.querySelectorAll(`[name="${name}"]:checked`)].map(x=>x.value);
const val=name=>String(form.elements[name]?.value||'').trim();

function buildPayload(){
  const answers = {
    responsavel:val('responsavel'), contato:val('contato'), nomeProjeto:val('nomeProjeto'),
    ideiaCentral:val('ideiaCentral'), estagio:val('estagio'), quantidade:val('quantidade'),
    primeiraVersao:val('primeiraVersao'), objetivo:val('objetivo'), publico:val('publico'),
    tom:val('tom'), classificacao:val('classificacao'), personagens:val('personagens'),
    parlapoeta:val('parlapoeta'), draAli:val('draAli'), inalteraveis:val('inalteraveis'),
    refs:checked('refs'), conflito:val('conflito'), transformacao:val('transformacao'),
    mensagem:val('mensagem'), estrutura:val('estrutura'), recursos:checked('recursos'),
    movimentos:val('movimentos'), impacto:val('impacto'), audio:checked('audio'),
    audioExiste:val('audioExiste'), climaSonoro:val('climaSonoro'), preservarTraco:val('preservarTraco'),
    paleta:val('paleta'), referencias:val('referencias'), materiais:checked('materiais'),
    naoDigitalizado:val('naoDigitalizado'), cenaPiloto:val('cenaPiloto'),
    tresCoisas:val('tresCoisas'), naoQuer:val('naoQuer'), criterioSucesso:val('criterioSucesso')
  };
  const relatorio = `DIAGNÓSTICO — GRAPHIC NOVEL INTERATIVA

PROJETO
Responsável: ${answers.responsavel || 'Não informado'}
Contato: ${answers.contato || 'Não informado'}
Nome: ${answers.nomeProjeto}
Ideia central: ${answers.ideiaCentral}
Estágio: ${answers.estagio}
Volume existente: ${answers.quantidade || 'Não informado'}

OBJETIVO
Primeira versão: ${answers.primeiraVersao}
Objetivo principal: ${answers.objetivo || 'Não informado'}

PÚBLICO E TOM
Público: ${answers.publico || 'Não informado'}
Tom: ${answers.tom || 'Não informado'}
Classificação / temas: ${answers.classificacao || 'Não informado'}

PERSONAGENS
Principais: ${answers.personagens || 'Não informado'}
Parlapoeta: ${answers.parlapoeta || 'Não informado'}
Dra. Ali / Ella Ali: ${answers.draAli || 'Não informado'}
Características preservadas: ${answers.inalteraveis || 'Não informado'}
Referências: ${answers.refs.join(', ') || 'Não informado'}

NARRATIVA
Conflito: ${answers.conflito || 'Não informado'}
Transformação: ${answers.transformacao || 'Não informado'}
Mensagem: ${answers.mensagem || 'Não informado'}
Estrutura: ${answers.estrutura || 'Não informado'}

EXPERIÊNCIA DIGITAL
Recursos: ${answers.recursos.join(', ') || 'Não informado'}
Movimentos: ${answers.movimentos || 'Não informado'}
Cenas de impacto: ${answers.impacto || 'Não informado'}

SOM
Áudio desejado: ${answers.audio.join(', ') || 'Não informado'}
Arquivos existentes: ${answers.audioExiste || 'Não informado'}
Clima sonoro: ${answers.climaSonoro || 'Não informado'}

DIREÇÃO VISUAL
Traço: ${answers.preservarTraco || 'Não informado'}
Paleta: ${answers.paleta || 'Não informado'}
Referências: ${answers.referencias || 'Não informado'}

MATERIAIS
Disponíveis: ${answers.materiais.join(', ') || 'Não informado'}
Não digitalizado: ${answers.naoDigitalizado || 'Não informado'}

PROTÓTIPO
Cena piloto: ${answers.cenaPiloto || 'Não informado'}
3 prioridades: ${answers.tresCoisas || 'Não informado'}
Não fazer: ${answers.naoQuer || 'Não informado'}
Critério de sucesso: ${answers.criterioSucesso || 'Não informado'}

LEITURA TÉCNICA INICIAL
• O projeto é adequado para experiência web narrativa em HTML, CSS e JavaScript.
• Começar com uma cena piloto completa reduz retrabalho e preserva a linguagem artística.
• O Pacacetômetro pode funcionar como eixo visual para transições entre presente, memória e fases do personagem.
• Recomenda-se separar cenário, personagens, objetos, balões, textos e efeitos em camadas.
• Movimento, áudio e narração devem ser adicionados progressivamente, após validação visual.
• A cena piloto deve ser testada em celular e computador antes de expandir a obra.`;
  return {
    responsavel: answers.responsavel,
    contato: answers.contato || null,
    nome_projeto: answers.nomeProjeto,
    status: "novo",
    respostas: answers,
    relatorio
  };
}

form.addEventListener('submit', async e=>{
  e.preventDefault();
  if(!validateCurrent()) return;
  const payload=buildPayload();
  finishBtn.disabled=true;
  finishBtn.textContent="Enviando...";
  if(!sb){
    resultMessage.textContent="O relatório foi gerado localmente, mas o Supabase ainda não está configurado.";
    report.textContent=payload.relatorio;
    form.classList.add('hidden'); result.classList.remove('hidden');
    finishBtn.disabled=false; finishBtn.textContent="Enviar diagnóstico";
    return;
  }
  const {data,error}=await sb.from('diagnosticos').insert(payload).select('id, created_at').single();
  if(error){
    alert("Não foi possível salvar no Supabase: "+error.message);
    finishBtn.disabled=false; finishBtn.textContent="Enviar diagnóstico";
    return;
  }
  resultMessage.textContent=`Registro salvo no banco com ID ${data.id}.`;
  report.textContent=payload.relatorio;
  form.classList.add('hidden'); document.querySelector('.progress-wrap').classList.add('hidden'); result.classList.remove('hidden');
});
updateUI();
