(() => {
  const cfg = window.WAP_SUPABASE;
  const sdk = window.supabase;

  if (!cfg?.url || !cfg?.key || !sdk?.createClient) {
    console.warn("[WAP Jornada] Supabase indisponível; rastreamento remoto desativado.");
    return;
  }

  const client = sdk.createClient(cfg.url, cfg.key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const SESSION_KEY = "wap_migo_session_id";
  const STARTED_KEY = "wap_migo_session_started";

  function getSessionId() {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = (crypto.randomUUID ? crypto.randomUUID() :
        "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
          const r = Math.random() * 16 | 0;
          const v = c === "x" ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        }));
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  }

  const sessionId = getSessionId();

  async function track(evento, dados = {}) {
    try {
      await client.from("jornada_eventos").insert({
        session_id: sessionId,
        evento,
        pagina: location.pathname + location.search + location.hash,
        dados: {
          ...dados,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
          viewport: `${window.innerWidth}x${window.innerHeight}`
        }
      });
    } catch (error) {
      console.warn("[WAP Jornada]", error);
    }
  }

  window.WAPTrack = track;
  window.WAPSessionId = sessionId;

  if (!sessionStorage.getItem(STARTED_KEY)) {
    sessionStorage.setItem(STARTED_KEY, "1");
    track("sessao_iniciada", {
      origem: document.referrer || "acesso_direto",
      url: location.href
    });
  }

  // Cliques relevantes
  document.addEventListener("click", event => {
    const el = event.target.closest("a, button");
    if (!el) return;

    const href = el.getAttribute("href") || "";
    const label = (el.innerText || el.getAttribute("aria-label") || "").trim().slice(0, 120);

    if (/wa\.me|whatsapp/i.test(href + " " + label)) {
      track("whatsapp_click", { label, href });
      return;
    }

    if (href.startsWith("#")) {
      track("navegacao_click", { destino: href, label });
    } else if (label) {
      track("acao_click", { label, href: href || null });
    }
  });

  // Seções realmente visualizadas
  const seen = new Set();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.45) {
        const id = entry.target.id || entry.target.className || "secao";
        if (!seen.has(id)) {
          seen.add(id);
          track("secao_visualizada", { secao: id });
        }
      }
    });
  }, { threshold: [0.45] });

  document.querySelectorAll("main section[id]").forEach(section => observer.observe(section));

  // Tempo de permanência aproximado ao sair/ocultar
  const startedAt = Date.now();
  let sentExit = false;
  function sendExit(reason) {
    if (sentExit) return;
    sentExit = true;
    track("sessao_encerrada", {
      motivo: reason,
      duracao_segundos: Math.round((Date.now() - startedAt) / 1000)
    });
  }
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") sendExit("pagina_oculta");
  });
})();