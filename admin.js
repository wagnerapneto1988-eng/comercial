(() => {
  const cfg = window.WAP_SUPABASE;
  const sdk = window.supabase;

  const loginCard = document.getElementById("loginCard");
  const adminPanel = document.getElementById("adminPanel");
  const loginForm = document.getElementById("loginForm");
  const emailInput = document.getElementById("adminEmail");
  const passwordInput = document.getElementById("adminPassword");
  const loginButton = document.getElementById("loginButton");
  const loginMessage = document.getElementById("loginMessage");
  const refreshButton = document.getElementById("refreshButton");
  const logoutButton = document.getElementById("logoutButton");
  const diagnosticsGrid = document.getElementById("diagnosticsGrid");
  const adminStatus = document.getElementById("adminStatus");
  const sessionUser = document.getElementById("sessionUser");

  if (!cfg || !cfg.url || !cfg.key || !sdk?.createClient) {
    loginMessage.textContent = "Configuração do Supabase não carregou. Verifique sua conexão com a internet.";
    return;
  }

  const client = sdk.createClient(cfg.url, cfg.key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  function humanize(key) {
    return String(key)
      .replace(/_/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  function formatValue(value) {
    if (value === null || value === undefined || value === "") return "—";
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    return String(value);
  }


  function firstValue(row, keys) {
    for (const key of keys) {
      const value = row?.[key];
      if (value !== null && value !== undefined && String(value).trim() !== "") {
        return String(value).trim();
      }
    }
    return "";
  }

  function normalizeWhatsApp(value) {
    let number = String(value || "").replace(/\D/g, "");
    if (!number) return "";

    // Remove zeros de prefixo usados em algumas formas de discagem no Brasil.
    number = number.replace(/^0+/, "");

    // Números brasileiros salvos apenas com DDD + telefone recebem o código do país.
    if (!number.startsWith("55") && (number.length === 10 || number.length === 11)) {
      number = `55${number}`;
    }

    return number;
  }

  function buildProposalMessage(row) {
    const nome = firstValue(row, ["nome", "nome_cliente", "cliente", "responsavel"]);
    const empresa = firstValue(row, ["empresa", "nome_empresa", "negocio"]);

    const saudacao = nome ? `Olá, ${nome}! Tudo bem?` : "Olá! Tudo bem?";
    const referencia = empresa ? ` da ${empresa}` : "";

    return `${saudacao}\n\nAnalisamos o diagnóstico${referencia} e preparamos uma proposta com base nas necessidades identificadas.\n\nPodemos conversar sobre as soluções recomendadas para o seu projeto?`;
  }

  function createWhatsAppButton(row) {
    const rawPhone = firstValue(row, ["whatsapp", "telefone", "celular", "phone", "telefone_whatsapp"]);
    const number = normalizeWhatsApp(rawPhone);

    const actions = document.createElement("div");
    actions.className = "diagnostic-card-actions";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "button button-whatsapp admin-whatsapp-button";
    button.textContent = number ? "Enviar proposta no WhatsApp" : "WhatsApp não informado";
    button.disabled = !number;

    if (number) {
      button.addEventListener("click", () => {
        const message = buildProposalMessage(row);
        const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank", "noopener,noreferrer");
      });
    }

    actions.appendChild(button);
    return actions;
  }

  function renderDiagnostics(rows) {
    diagnosticsGrid.innerHTML = "";

    if (!rows.length) {
      adminStatus.textContent = "Nenhum diagnóstico encontrado ainda.";
      return;
    }

    adminStatus.textContent = `${rows.length} diagnóstico(s) encontrado(s).`;

    rows.forEach((row, index) => {
      const card = document.createElement("article");
      card.className = "diagnostic-admin-card";

      const title = document.createElement("h2");
      title.textContent = row.empresa || row.nome_empresa || row.nome || row.cliente || `Diagnóstico ${index + 1}`;
      card.appendChild(title);

      const meta = document.createElement("div");
      meta.className = "diagnostic-fields";

      Object.entries(row).forEach(([key, value]) => {
        const item = document.createElement("div");
        item.className = "diagnostic-field";

        const label = document.createElement("strong");
        label.textContent = humanize(key);

        const content = document.createElement("pre");
        content.textContent = formatValue(value);

        item.append(label, content);
        meta.appendChild(item);
      });

      card.appendChild(meta);
      card.appendChild(createWhatsAppButton(row));
      diagnosticsGrid.appendChild(card);
    });
  }

  async function loadDiagnostics() {
    adminStatus.textContent = "Carregando diagnósticos...";
    diagnosticsGrid.innerHTML = "";

    let response = await client
      .from("diagnosticos")
      .select("*")
      .order("created_at", { ascending: false });

    // Caso a tabela não possua created_at, refaz sem ordenação.
    if (response.error && /created_at/i.test(response.error.message || "")) {
      response = await client.from("diagnosticos").select("*");
    }

    if (response.error) {
      adminStatus.textContent = `Não foi possível ler a tabela: ${response.error.message}`;
      return;
    }

    renderDiagnostics(response.data || []);
  }

  async function showSession(session) {
    if (!session?.user) {
      loginCard.classList.remove("hidden");
      adminPanel.classList.add("hidden");
      sessionUser.textContent = "";
      return;
    }

    loginCard.classList.add("hidden");
    adminPanel.classList.remove("hidden");
    sessionUser.textContent = `Conectado como ${session.user.email || "usuário autenticado"}`;
    await loadDiagnostics();
  }

  loginForm.addEventListener("submit", async event => {
    event.preventDefault();
    loginMessage.textContent = "Entrando...";
    loginButton.disabled = true;

    const { data, error } = await client.auth.signInWithPassword({
      email: emailInput.value.trim(),
      password: passwordInput.value
    });

    loginButton.disabled = false;

    if (error) {
      loginMessage.textContent = `Não foi possível entrar: ${error.message}`;
      return;
    }

    passwordInput.value = "";
    loginMessage.textContent = "";
    await showSession(data.session);
  });

  refreshButton.addEventListener("click", loadDiagnostics);

  logoutButton.addEventListener("click", async () => {
    await client.auth.signOut();
    await showSession(null);
  });

  client.auth.onAuthStateChange((_event, session) => {
    if (!session) showSession(null);
  });

  client.auth.getSession().then(({ data }) => showSession(data.session));
})();
