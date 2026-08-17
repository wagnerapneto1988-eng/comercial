const questions = [
  {
    text: "Qual é o principal objetivo do seu negócio hoje?",
    options: [
      { label: "Conseguir mais clientes", category: "clientes" },
      { label: "Vender pela internet", category: "clientes" },
      { label: "Organizar melhor os processos", category: "processos" },
      { label: "Treinar melhor a equipe", category: "treinamento" }
    ]
  },
  {
    text: "Como seus clientes encontram sua empresa atualmente?",
    options: [
      { label: "Indicação e boca a boca", category: "clientes" },
      { label: "Redes sociais", category: "clientes" },
      { label: "Google ou site", category: "tecnologia" },
      { label: "Ainda não tenho presença digital", category: "tecnologia" }
    ]
  },
  {
    text: "Hoje, qual situação mais atrapalha seu crescimento?",
    options: [
      { label: "Poucos contatos novos", category: "clientes" },
      { label: "Falta de organização", category: "processos" },
      { label: "Equipe sem padrão de atendimento", category: "treinamento" },
      { label: "Falta de ferramentas digitais", category: "tecnologia" }
    ]
  },
  {
    text: "Como você costuma apresentar seus produtos ou serviços?",
    options: [
      { label: "WhatsApp", category: "clientes" },
      { label: "Instagram ou Facebook", category: "clientes" },
      { label: "Catálogo ou site", category: "tecnologia" },
      { label: "Ainda faço tudo manualmente", category: "processos" }
    ]
  },
  {
    text: "Se pudesse melhorar uma coisa agora, qual seria?",
    options: [
      { label: "Atrair mais clientes", category: "clientes" },
      { label: "Ganhar tempo", category: "processos" },
      { label: "Treinar e padronizar a equipe", category: "treinamento" },
      { label: "Modernizar o negócio", category: "tecnologia" }
    ]
  }
];

const diagnosticMap = {
  clientes: {
    title: "Sua prioridade é conquistar mais clientes.",
    text: "O melhor primeiro passo é fortalecer sua presença digital e criar caminhos simples para transformar visitas em conversas e oportunidades."
  },
  processos: {
    title: "Seu negócio pode ganhar tempo e organização.",
    text: "Ferramentas simples e automações podem reduzir tarefas repetitivas, melhorar o controle e deixar a operação mais clara."
  },
  treinamento: {
    title: "Sua equipe precisa de mais padrão e conhecimento.",
    text: "Treinamentos digitais, materiais interativos e processos claros ajudam a manter qualidade e segurança no atendimento."
  },
  tecnologia: {
    title: "Existe espaço para uma evolução digital.",
    text: "Seu negócio pode começar com uma solução leve e prática, sem complicação: site, catálogo, formulário inteligente ou ferramenta sob medida."
  }
};

let currentQuestion = 0;
let scores = {
  clientes: 0,
  processos: 0,
  treinamento: 0,
  tecnologia: 0
};

const questionText = document.getElementById("questionText");
const options = document.getElementById("options");
const questionCounter = document.getElementById("questionCounter");
const progressPercent = document.getElementById("progressPercent");
const progressBar = document.getElementById("progressBar");
const result = document.getElementById("result");
const resultTitle = document.getElementById("resultTitle");
const resultText = document.getElementById("resultText");
const menuButton = document.getElementById("menuButton");
const nav = document.getElementById("nav");

function renderQuestion() {
  const question = questions[currentQuestion];
  const percent = Math.round(((currentQuestion + 1) / questions.length) * 100);

  questionText.textContent = question.text;
  questionCounter.textContent = `Pergunta ${currentQuestion + 1} de ${questions.length}`;
  progressPercent.textContent = `${percent}%`;
  progressBar.style.width = `${percent}%`;
  options.innerHTML = "";

  question.options.forEach(option => {
    const button = document.createElement("button");
    button.className = "option-button";
    button.type = "button";
    button.textContent = option.label;
    button.addEventListener("click", () => selectOption(option.category, option.label));
    options.appendChild(button);
  });
}

function selectOption(category, answerLabel) {
  if (window.WAPTrack) {
    window.WAPTrack(currentQuestion === 0 ? "diagnostico_iniciado" : "diagnostico_resposta", {
      pergunta_numero: currentQuestion + 1,
      pergunta: questions[currentQuestion]?.text,
      resposta: answerLabel,
      categoria: category
    });
  }
  scores[category] += 1;
  currentQuestion += 1;

  if (currentQuestion < questions.length) {
    renderQuestion();
  } else {
    showResult();
  }
}

function showResult() {
  const bestCategory = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])[0][0];

  const diagnostic = diagnosticMap[bestCategory];

  if (window.WAPTrack) {
    window.WAPTrack("diagnostico_concluido", {
      categoria_principal: bestCategory,
      pontuacao: scores,
      recomendacao: diagnostic.title
    });
  }

  questionText.textContent = "Pronto! Já conseguimos enxergar um bom ponto de partida.";
  questionCounter.textContent = "Diagnóstico concluído";
  progressPercent.textContent = "100%";
  progressBar.style.width = "100%";
  options.innerHTML = "";

  resultTitle.textContent = diagnostic.title;
  resultText.textContent = diagnostic.text;
  result.classList.remove("hidden");
}

menuButton.addEventListener("click", () => {
  nav.classList.toggle("open");
});

nav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => nav.classList.remove("open"));
});

document.getElementById("year").textContent = new Date().getFullYear();

renderQuestion();
