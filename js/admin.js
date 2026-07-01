/* =============================================================
   PoliData — Panel administrativo IA (HU-066, HU-067)
   Revisión, corrección y validación de contenido generado por IA.
   ============================================================= */
(function (global) {
  "use strict";

  const PD = global.PoliData;
  const PC = global.PoliCommon;
  const root = document.getElementById("adminRoot");
  if (!root) return;

  const esc = PD.esc;
  const REVIEW_KEY = "polidata_ai_review";
  const USERS_KEY = "polidata_users";

  function getJSON(key, fallback) {
    try {
      const raw = JSON.parse(localStorage.getItem(key) || "null");
      return raw || fallback;
    } catch (e) {
      return fallback;
    }
  }

  function setJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* noop */ }
  }

  function seedQueue() {
    const current = getJSON(REVIEW_KEY, []);
    if (current.length) return current;
    const c = PD.getCandidato("c2");
    const seeded = [
      {
        id: "rev-seed-1",
        reportId: "seed-c2",
        title: "Resumen IA de " + c.nombre,
        type: "Resumen de propuestas",
        candidateId: c.id,
        content: c.resumenIA,
        sources: ["JNE", "ONPE", "Ministerio Público"],
        reason: "Control preventivo de neutralidad y precisión antes de publicación.",
        status: "Pendiente",
        correction: "",
        createdAt: "2026-06-24T10:30:00.000Z",
        updatedAt: "2026-06-24T10:30:00.000Z",
      },
      {
        id: "rev-seed-2",
        reportId: "seed-trends",
        title: "Tendencias electorales de demostración",
        type: "Tendencias y estadísticas",
        candidateId: null,
        content: "El dataset de demostración contiene perfiles en Lima Metropolitana y Arequipa con indicadores de transparencia y riesgo.",
        sources: ["JNE", "ONPE", "Poder Judicial"],
        reason: "Verificar que se indique claramente que la muestra es ficticia.",
        status: "En revisión",
        correction: "Agregar advertencia visible sobre datos académicos simulados.",
        createdAt: "2026-06-23T15:20:00.000Z",
        updatedAt: "2026-06-25T09:00:00.000Z",
      },
    ];
    setJSON(REVIEW_KEY, seeded);
    return seeded;
  }

  function isAdmin(user) {
    return user && String(user.rol || "").toLowerCase().includes("admin");
  }

  function createAdminDemo() {
    const users = PC.getUsers ? PC.getUsers() : getJSON(USERS_KEY, []);
    const user = {
      nombre: "Administradora Demo",
      email: "admin@polidata.pe",
      password: "admin123",
      rol: "Administrador",
      region: "Lima Metropolitana",
      intereses: ["Gobernanza", "Fuentes", "IA"],
      notificaciones: {
        actualizaciones: true,
        candidatosSeguidos: true,
        promesas: true,
        votaciones: true,
        resumenSemanal: true,
        canalApp: true,
        canalEmail: false,
      },
      creado: new Date().toISOString(),
    };
    const idx = users.findIndex((u) => u.email === user.email);
    if (idx >= 0) users[idx] = user;
    else users.push(user);
    if (PC.saveUsers) PC.saveUsers(users);
    else setJSON(USERS_KEY, users);
    PC.setSession({ email: user.email, startedAt: new Date().toISOString() });
    if (PC.refreshShell) PC.refreshShell();
  }

  function statusClass(status) {
    if (status === "Validado") return "tag-green";
    if (status === "Corregido") return "tag-amber";
    if (status === "Rechazado") return "tag-red";
    return "tag-neutral";
  }

  function sourceList(item) {
    return (item.sources || []).map((s) => {
      const f = PD.getFuente(s);
      const label = f ? `${f.abbr} — ${f.name}` : s;
      return `<li>${esc(label)}</li>`;
    }).join("");
  }

  function queueItem(item, activeId) {
    return `
      <button type="button" class="admin-ticket ${item.id === activeId ? "active" : ""}" data-ticket="${esc(item.id)}">
        <span class="status-tag ${statusClass(item.status)}"><span class="status-dot" aria-hidden="true"></span>${esc(item.status)}</span>
        <strong>${esc(item.title)}</strong>
        <small>${esc(item.type)} · ${esc(new Date(item.updatedAt).toLocaleDateString("es-PE"))}</small>
      </button>`;
  }

  function detailHTML(item) {
    if (!item) {
      return `
        <section class="card admin-detail">
          <h2 class="card-title-sm">Selecciona una revisión</h2>
          <p class="td-empty">No hay elementos para revisar con el filtro actual.</p>
        </section>`;
    }

    const candidate = item.candidateId ? PD.getCandidato(item.candidateId) : null;
    return `
      <section class="card admin-detail" data-active-ticket="${esc(item.id)}">
        <div class="admin-detail-head">
          <div>
            <h2>${esc(item.title)}</h2>
            <p>${esc(item.type)}${candidate ? " · " + esc(candidate.nombre) : ""}</p>
          </div>
          <span class="status-tag ${statusClass(item.status)}"><span class="status-dot" aria-hidden="true"></span>${esc(item.status)}</span>
        </div>
        <div class="admin-review-grid">
          <section>
            <h3 class="subhead">Contenido IA reportado</h3>
            <p class="admin-content-box">${esc(item.content)}</p>
            <h3 class="subhead">Motivo de revisión</h3>
            <p>${esc(item.reason)}</p>
          </section>
          <section>
            <h3 class="subhead">Trazabilidad</h3>
            <ul class="bullet-list">${sourceList(item)}</ul>
            <h3 class="subhead">Bitácora</h3>
            <p class="source-note">Creado: ${esc(new Date(item.createdAt).toLocaleString("es-PE"))}</p>
            <p class="source-note">Actualizado: ${esc(new Date(item.updatedAt).toLocaleString("es-PE"))}</p>
          </section>
        </div>
        <form id="reviewForm" class="admin-form">
          <label>Corrección o nota editorial
            <textarea name="correction" rows="5" placeholder="Describe la corrección, decisión editorial o validación aplicada.">${esc(item.correction || "")}</textarea>
          </label>
          <div class="admin-actions">
            <button type="submit" class="btn btn-primary" data-action="Corregido">Guardar corrección</button>
            <button type="button" class="btn btn-secondary" data-action="Validado">Validar contenido</button>
            <button type="button" class="btn btn-secondary" data-action="Rechazado">Rechazar contenido</button>
            <button type="button" class="btn btn-secondary" data-action="En revisión">Reabrir revisión</button>
          </div>
        </form>
      </section>`;
  }

  function metrics(queue) {
    const pending = queue.filter((x) => x.status === "Pendiente").length;
    const reviewing = queue.filter((x) => x.status === "En revisión").length;
    const closed = queue.filter((x) => ["Validado", "Corregido", "Rechazado"].includes(x.status)).length;
    return { pending, reviewing, closed };
  }

  let filter = "Todos";
  let activeId = null;

  function renderGate() {
    root.innerHTML = `
      <section class="state-empty">
        <h2>Acceso administrativo requerido</h2>
        <p>Para esta demostración puedes crear una cuenta administradora local y entrar al panel de revisión IA.</p>
        <button type="button" class="btn btn-primary" id="createAdmin">Crear cuenta admin demo</button>
        <a class="btn btn-secondary" href="cuenta.html">Ir a cuenta</a>
      </section>`;
    document.getElementById("createAdmin").addEventListener("click", () => {
      createAdminDemo();
      render();
    });
  }

  function render() {
    const user = PC.getCurrentUser && PC.getCurrentUser();
    if (!isAdmin(user)) {
      renderGate();
      return;
    }

    const queue = seedQueue();
    const filtered = filter === "Todos" ? queue : queue.filter((x) => x.status === filter);
    if (!activeId || !filtered.find((x) => x.id === activeId)) activeId = filtered[0] && filtered[0].id;
    const active = filtered.find((x) => x.id === activeId);
    const m = metrics(queue);

    root.innerHTML = `
      <section class="admin-metrics">
        <article class="card"><span class="metric-number">${m.pending}</span><p>Pendientes</p></article>
        <article class="card"><span class="metric-number">${m.reviewing}</span><p>En revisión</p></article>
        <article class="card"><span class="metric-number">${m.closed}</span><p>Cerrados</p></article>
      </section>

      <section class="admin-layout">
        <aside class="card admin-queue">
          <div class="admin-filter">
            <label>Estado
              <select id="adminFilter">
                ${["Todos", "Pendiente", "En revisión", "Validado", "Corregido", "Rechazado"].map((s) => `<option value="${esc(s)}"${s === filter ? " selected" : ""}>${esc(s)}</option>`).join("")}
              </select>
            </label>
          </div>
          <div class="admin-ticket-list">
            ${filtered.length ? filtered.map((item) => queueItem(item, activeId)).join("") : `<p class="td-empty">Sin tickets en este estado.</p>`}
          </div>
        </aside>
        <div id="adminDetail">${detailHTML(active)}</div>
      </section>
      <p class="form-msg account-msg" id="adminMsg" role="status" aria-live="polite"></p>`;

    wireEvents();
  }

  function updateTicket(id, status, correction) {
    const queue = seedQueue();
    const idx = queue.findIndex((x) => x.id === id);
    if (idx < 0) return;
    queue[idx] = Object.assign({}, queue[idx], {
      status,
      correction: correction || queue[idx].correction || "",
      updatedAt: new Date().toISOString(),
    });
    setJSON(REVIEW_KEY, queue);
  }

  function wireEvents() {
    const filterEl = document.getElementById("adminFilter");
    filterEl.addEventListener("change", () => {
      filter = filterEl.value;
      activeId = null;
      render();
    });

    document.querySelectorAll("[data-ticket]").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeId = btn.dataset.ticket;
        render();
      });
    });

    const detail = document.querySelector("[data-active-ticket]");
    if (!detail) return;

    const form = document.getElementById("reviewForm");
    const id = detail.dataset.activeTicket;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      updateTicket(id, "Corregido", form.elements.correction.value.trim());
      render();
    });
    form.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("click", () => {
        updateTicket(id, btn.dataset.action, form.elements.correction.value.trim());
        render();
      });
    });
  }

  render();
})(window);
