/* =============================================================
   PoliData — Notificaciones configurables (HU-034 a HU-037)
   Historial local y preferencias vinculadas a la cuenta simulada.
   ============================================================= */
(function (global) {
  "use strict";

  const PD = global.PoliData;
  const PC = global.PoliCommon;
  const root = document.getElementById("notificacionesRoot");
  if (!root) return;

  const esc = PD.esc;
  const FOLLOW_KEY = "polidata_follow";
  const CUSTOM_KEY = "polidata_notifications_custom";
  const READ_KEY = "polidata_notifications_read";

  function getFollows() {
    try {
      const ids = JSON.parse(localStorage.getItem(FOLLOW_KEY) || "[]");
      return Array.isArray(ids) ? ids.filter((id) => PD.getCandidato(id)) : [];
    } catch (e) {
      return [];
    }
  }

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

  function updateUser(user) {
    const users = PC.getUsers();
    const idx = users.findIndex((u) => u.email === user.email);
    if (idx >= 0) users[idx] = user;
    PC.saveUsers(users);
  }

  function defaults(user) {
    return Object.assign({
      actualizaciones: true,
      candidatosSeguidos: true,
      promesas: true,
      votaciones: true,
      resumenSemanal: false,
      canalApp: true,
      canalEmail: false,
    }, user.notificaciones || {});
  }

  function baseEvents(user) {
    const follows = getFollows();
    const candidates = follows.length ? follows.map((id) => PD.getCandidato(id)).filter(Boolean) : PD.getCandidatos().slice(0, 2);
    const events = [];

    candidates.forEach((c) => {
      const d = c.autoridad365 || {};
      events.push({
        id: "upd-" + c.id,
        tipo: "actualizaciones",
        fecha: c.ultimaActualizacion || "20/06/2026",
        titulo: "Ficha actualizada",
        detalle: "Se actualizó información y trazabilidad de fuentes.",
        candidato: c.nombre,
      });
      (d.votaciones || []).slice(0, 1).forEach((v, i) => {
        events.push({
          id: "vote-" + c.id + "-" + i,
          tipo: "votaciones",
          fecha: v.fecha,
          titulo: "Nueva votación registrada",
          detalle: v.tema + " · Voto: " + v.voto,
          candidato: c.nombre,
        });
      });
      (d.promesas || []).slice(0, 1).forEach((p, i) => {
        events.push({
          id: "promise-" + c.id + "-" + i,
          tipo: "promesas",
          fecha: c.ultimaActualizacion || "20/06/2026",
          titulo: "Avance de promesa",
          detalle: p.titulo + " · " + p.estado + " · " + p.avance + "%",
          candidato: c.nombre,
        });
      });
    });

    if (user.notificaciones && user.notificaciones.resumenSemanal) {
      events.push({
        id: "weekly-" + user.email,
        tipo: "resumenSemanal",
        fecha: "24/06/2026",
        titulo: "Resumen semanal listo",
        detalle: "Compilado de candidatos seguidos, promesas y cambios recientes.",
        candidato: "PoliData",
      });
    }

    return events.concat(getJSON(CUSTOM_KEY, []));
  }

  function filteredEvents(user) {
    const prefs = defaults(user);
    return baseEvents(user)
      .filter((ev) => prefs[ev.tipo] !== false)
      .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
  }

  function renderLogin() {
    root.innerHTML = `
      <section class="state-empty">
        <h2>Inicia sesión para configurar alertas</h2>
        <p>Las notificaciones personalizadas requieren una cuenta local de demostración.</p>
        <a class="btn btn-primary" href="cuenta.html">Ir a cuenta</a>
      </section>`;
  }

  function renderPrefs(user) {
    const prefs = defaults(user);
    return `
      <section class="card">
        <h2 class="card-title-sm">Configuración de alertas</h2>
        <form id="notifForm" class="notif-form">
          <div class="check-grid">
            <label class="check-row"><input type="checkbox" name="actualizaciones" ${prefs.actualizaciones ? "checked" : ""} /><span>Actualizaciones de ficha</span></label>
            <label class="check-row"><input type="checkbox" name="candidatosSeguidos" ${prefs.candidatosSeguidos ? "checked" : ""} /><span>Candidatos seguidos</span></label>
            <label class="check-row"><input type="checkbox" name="promesas" ${prefs.promesas ? "checked" : ""} /><span>Avance de promesas</span></label>
            <label class="check-row"><input type="checkbox" name="votaciones" ${prefs.votaciones ? "checked" : ""} /><span>Votaciones relevantes</span></label>
            <label class="check-row"><input type="checkbox" name="resumenSemanal" ${prefs.resumenSemanal ? "checked" : ""} /><span>Resumen semanal</span></label>
            <label class="check-row"><input type="checkbox" name="canalApp" ${prefs.canalApp ? "checked" : ""} /><span>Canal app</span></label>
            <label class="check-row"><input type="checkbox" name="canalEmail" ${prefs.canalEmail ? "checked" : ""} /><span>Canal correo</span></label>
          </div>
          <div class="account-actions">
            <button type="submit" class="btn btn-primary">Guardar configuración</button>
            <button type="button" class="btn btn-secondary" id="simulateAlert">Simular nueva alerta</button>
          </div>
        </form>
      </section>`;
  }

  function eventHTML(ev, readIds) {
    const read = readIds.includes(ev.id);
    return `
      <article class="notif-item ${read ? "is-read" : ""}">
        <div class="notif-icon" aria-hidden="true">${read ? "✓" : "!"}</div>
        <div>
          <h3>${esc(ev.titulo)}</h3>
          <p>${esc(ev.detalle)}</p>
          <small>${esc(ev.fecha)} · ${esc(ev.candidato)} · ${esc(tipoLabel(ev.tipo))}</small>
        </div>
      </article>`;
  }

  function tipoLabel(tipo) {
    const labels = {
      actualizaciones: "Actualización",
      candidatosSeguidos: "Candidato seguido",
      promesas: "Promesa",
      votaciones: "Votación",
      resumenSemanal: "Resumen",
    };
    return labels[tipo] || tipo;
  }

  function render() {
    const user = PC.getCurrentUser();
    if (!user) {
      renderLogin();
      return;
    }

    const readIds = getJSON(READ_KEY, []);
    const events = filteredEvents(user);
    const unread = events.filter((ev) => !readIds.includes(ev.id)).length;
    const follows = getFollows();

    root.innerHTML = `
      <section class="notif-summary">
        <article class="card">
          <span class="metric-number">${events.length}</span>
          <p>Alertas en historial</p>
        </article>
        <article class="card">
          <span class="metric-number">${unread}</span>
          <p>No leídas</p>
        </article>
        <article class="card">
          <span class="metric-number">${follows.length}</span>
          <p>Candidatos seguidos</p>
        </article>
      </section>

      ${renderPrefs(user)}

      <section class="card">
        <div class="notif-head">
          <div>
            <h2 class="card-title-sm">Historial de notificaciones</h2>
            <p>Eventos filtrados según tus preferencias actuales.</p>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" id="markRead">Marcar como leídas</button>
        </div>
        <div class="notif-list">
          ${events.length ? events.map((ev) => eventHTML(ev, readIds)).join("") : `<p class="td-empty">No hay alertas con la configuración actual.</p>`}
        </div>
      </section>

      <p class="form-msg account-msg" id="notifMsg" role="status" aria-live="polite"></p>`;

    initEvents(user, events);
  }

  function msg(text, ok) {
    const el = document.getElementById("notifMsg");
    if (!el) return;
    el.textContent = text;
    el.classList.toggle("success", !!ok);
    el.classList.toggle("error", !ok);
  }

  function initEvents(user, events) {
    const form = document.getElementById("notifForm");
    const markRead = document.getElementById("markRead");
    const simulate = document.getElementById("simulateAlert");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      user.notificaciones = {
        actualizaciones: !!form.elements.actualizaciones.checked,
        candidatosSeguidos: !!form.elements.candidatosSeguidos.checked,
        promesas: !!form.elements.promesas.checked,
        votaciones: !!form.elements.votaciones.checked,
        resumenSemanal: !!form.elements.resumenSemanal.checked,
        canalApp: !!form.elements.canalApp.checked,
        canalEmail: !!form.elements.canalEmail.checked,
      };
      updateUser(user);
      msg("Configuración de notificaciones guardada.", true);
      setTimeout(render, 350);
    });

    markRead.addEventListener("click", () => {
      const ids = Array.from(new Set(getJSON(READ_KEY, []).concat(events.map((ev) => ev.id))));
      setJSON(READ_KEY, ids);
      render();
    });

    simulate.addEventListener("click", () => {
      const followed = getFollows().map((id) => PD.getCandidato(id)).filter(Boolean);
      const c = followed[0] || PD.getCandidatos()[0];
      const custom = getJSON(CUSTOM_KEY, []);
      custom.unshift({
        id: "sim-" + Date.now(),
        tipo: "actualizaciones",
        fecha: "30/06/2026",
        titulo: "Alerta simulada",
        detalle: "Se detectó una actualización relevante en la ficha.",
        candidato: c.nombre,
      });
      setJSON(CUSTOM_KEY, custom.slice(0, 8));
      render();
    });
  }

  render();
})(window);
