/* =============================================================
   PoliData — Seguimiento ciudadano 365 (HU-029 a HU-037)
   Usa candidatos seguidos en localStorage y muestra desempeño.
   ============================================================= */
(function (global) {
  "use strict";

  const PD = global.PoliData;
  const PC = global.PoliCommon;
  const root = document.getElementById("seguimientoRoot");
  if (!root) return;

  const FOLLOW_KEY = "polidata_follow";
  const esc = PD.esc;

  function getFollows() {
    try {
      const arr = JSON.parse(localStorage.getItem(FOLLOW_KEY) || "[]");
      return Array.isArray(arr) ? arr.filter((id) => PD.getCandidato(id)) : [];
    } catch (e) {
      return [];
    }
  }

  function setFollows(ids) {
    try { localStorage.setItem(FOLLOW_KEY, JSON.stringify(ids)); } catch (e) { /* noop */ }
  }

  function defaultFollows() {
    const current = getFollows();
    if (current.length) return current;
    const ids = ["c1", "c2"];
    setFollows(ids);
    return ids;
  }

  let follows = defaultFollows();

  function progressItem(p) {
    return `
      <li class="promise-item">
        <div class="promise-top">
          <strong>${esc(p.titulo)}</strong>
          <span>${esc(p.estado)} · ${Number(p.avance) || 0}%</span>
        </div>
        <div class="progress"><span style="width:${Number(p.avance) || 0}%"></span></div>
      </li>`;
  }

  function autoridadCard(c) {
    const d = c.autoridad365 || {};
    const votos = (d.votaciones || [])
      .map((v) => `<li><strong>${esc(v.fecha)}:</strong> ${esc(v.tema)} · ${esc(v.voto)}</li>`)
      .join("");
    const promesas = (d.promesas || []).map(progressItem).join("");
    const proyectos = (d.proyectos || []).map((p) => `<li>${esc(p)}</li>`).join("");

    return `
      <article class="track-card">
        <header class="track-head">
          ${PC.avatarHTML(c, "avatar-lg")}
          <div>
            <h2>${esc(c.nombre)}</h2>
            <p>${esc(d.cargoElecto || c.cargo)} · ${esc(c.region)}</p>
            <span class="status-tag tag-green"><span class="status-dot" aria-hidden="true"></span>Siguiendo</span>
          </div>
          <button type="button" class="sel-remove track-remove" data-remove="${esc(c.id)}" aria-label="Dejar de seguir a ${esc(c.nombre)}">
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"></path></svg>
          </button>
        </header>
        <div class="track-metrics">
          <div><span class="metric-number">${esc(d.asistencia || "No disponible")}</span><span>Asistencia</span></div>
          <div><span class="metric-number">${(d.votaciones || []).length}</span><span>Votaciones registradas</span></div>
          <div><span class="metric-number">${(d.promesas || []).length}</span><span>Promesas monitoreadas</span></div>
        </div>
        <div class="track-grid">
          <section>
            <h3>Últimas votaciones</h3>
            <ul class="bullet-list">${votos || "<li>Sin votaciones registradas.</li>"}</ul>
          </section>
          <section>
            <h3>Avance de promesas</h3>
            <ul class="promise-list">${promesas || "<li>Sin promesas registradas.</li>"}</ul>
          </section>
          <section>
            <h3>Acciones y proyectos</h3>
            <ul class="bullet-list">${proyectos || "<li>Sin acciones registradas.</li>"}</ul>
          </section>
        </div>
      </article>`;
  }

  function notificationHTML(candidatos) {
    const user = PC.getCurrentUser && PC.getCurrentUser();
    const prefs = Object.assign({ actualizaciones: true, votaciones: true, promesas: true }, (user && user.notificaciones) || {});
    const items = candidatos.flatMap((c) => {
      const d = c.autoridad365 || {};
      const eventos = [];
      if (prefs.actualizaciones) {
        eventos.push({ fecha: c.ultimaActualizacion, texto: "Actualización de ficha y fuentes", cand: c.nombre });
      }
      if (prefs.votaciones) {
        eventos.push({ fecha: (d.votaciones && d.votaciones[0] && d.votaciones[0].fecha) || c.ultimaActualizacion, texto: "Nueva votación registrada", cand: c.nombre });
      }
      if (prefs.promesas) {
        eventos.push({ fecha: c.ultimaActualizacion, texto: "Avance de promesa monitoreada", cand: c.nombre });
      }
      return eventos;
    });

    return items
      .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)))
      .slice(0, 6)
      .map((n) => `<li><strong>${esc(n.fecha)}:</strong> ${esc(n.texto)} · ${esc(n.cand)}</li>`)
      .join("");
  }

  function render() {
    const candidatos = follows.map((id) => PD.getCandidato(id)).filter(Boolean);
    const user = PC.getCurrentUser && PC.getCurrentUser();
    const prefs = Object.assign({ canalApp: true, canalEmail: false }, (user && user.notificaciones) || {});
    const channels = [
      prefs.canalApp ? "App" : null,
      prefs.canalEmail ? "Correo" : null,
    ].filter(Boolean).join(" + ") || "Sin canales activos";

    if (!candidatos.length) {
      root.innerHTML = `
        <section class="state-empty">
          <h2>No sigues a ningún candidato</h2>
          <p>Desde una ficha puedes activar “Seguir — PoliData 365” para monitorear asistencia, votaciones y promesas.</p>
          <a class="btn btn-primary" href="candidatos.html">Explorar candidatos</a>
        </section>`;
      return;
    }

    root.innerHTML = `
      <section class="track-toolbar card">
        <div>
          <h2 class="card-title-sm">Alertas configuradas</h2>
          <p>${user ? `Sesión: ${esc(user.nombre || user.email)} · Canales: ${esc(channels)}.` : "Inicia sesión para personalizar canales, temas y frecuencia de alertas."} En esta demo se almacenan en tu navegador.</p>
        </div>
        <div class="track-toolbar-actions">
          <a class="btn btn-secondary btn-sm" href="${user ? "notificaciones.html" : "cuenta.html"}">${user ? "Configurar alertas" : "Iniciar sesión"}</a>
          <button type="button" class="btn btn-secondary btn-sm" id="clearTrack">Limpiar seguimiento</button>
        </div>
      </section>

      <section class="card" aria-labelledby="history-title">
        <h2 id="history-title" class="card-title-sm">Historial de notificaciones</h2>
        <ul class="bullet-list">${notificationHTML(candidatos)}</ul>
      </section>

      <section class="track-list" aria-label="Autoridades seguidas">
        ${candidatos.map(autoridadCard).join("")}
      </section>`;
  }

  root.addEventListener("click", (e) => {
    const remove = e.target.closest("[data-remove]");
    if (remove) {
      follows = follows.filter((id) => id !== remove.dataset.remove);
      setFollows(follows);
      render();
      return;
    }
    if (e.target.closest("#clearTrack")) {
      follows = [];
      setFollows(follows);
      render();
    }
  });

  render();
})(window);
