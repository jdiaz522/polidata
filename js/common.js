/* =============================================================
   PoliData — Lógica común (common.js)
   -------------------------------------------------------------
   - Inyecta el header y footer compartidos (páginas de la app).
   - Buscador global de candidatos.
   - Selector de Región / Circunscripción.
   - Estado de comparación persistido en localStorage (máx. 4).
   - Animaciones de aparición (IntersectionObserver).
   Se expone en window.PoliCommon.
   ============================================================= */
(function (global) {
  "use strict";

  const PD = global.PoliData;
  const COMPARE_KEY = "polidata_comparacion";
  const SESSION_KEY = "polidata_session";
  const USERS_KEY = "polidata_users";
  const MAX_COMPARE = 4;

  /* ===========================================================
     1. Estado de comparación (localStorage)
  =========================================================== */
  function getComparacion() {
    try {
      const raw = localStorage.getItem(COMPARE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      // Filtra ids válidos y respeta el máximo
      return Array.isArray(arr)
        ? arr.filter((id) => PD.getCandidato(id)).slice(0, MAX_COMPARE)
        : [];
    } catch (e) {
      return [];
    }
  }

  function saveComparacion(ids) {
    try {
      localStorage.setItem(COMPARE_KEY, JSON.stringify(ids.slice(0, MAX_COMPARE)));
    } catch (e) {
      /* almacenamiento no disponible: la app sigue funcionando en memoria */
    }
  }

  // Devuelve un código: "ok" | "dup" | "full"
  function addComparacion(id) {
    if (!PD.getCandidato(id)) return "invalid";
    const ids = getComparacion();
    if (ids.includes(id)) return "dup";
    if (ids.length >= MAX_COMPARE) return "full";
    ids.push(id);
    saveComparacion(ids);
    return "ok";
  }

  function removeComparacion(id) {
    const ids = getComparacion().filter((x) => x !== id);
    saveComparacion(ids);
    return ids;
  }

  function isInComparacion(id) {
    return getComparacion().includes(id);
  }

  /* ===========================================================
     2. Sesión simulada (localStorage)
  =========================================================== */
  function getUsers() {
    try {
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
      return Array.isArray(users) ? users : [];
    } catch (e) {
      return [];
    }
  }

  function saveUsers(users) {
    try { localStorage.setItem(USERS_KEY, JSON.stringify(users)); } catch (e) { /* noop */ }
  }

  function getSession() {
    try {
      const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
      return session && session.email ? session : null;
    } catch (e) {
      return null;
    }
  }

  function setSession(session) {
    try {
      if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      else localStorage.removeItem(SESSION_KEY);
    } catch (e) { /* noop */ }
  }

  function getCurrentUser() {
    const session = getSession();
    if (!session) return null;
    return getUsers().find((u) => u.email === session.email) || null;
  }

  /* ===========================================================
     3. Header compartido (inyección)
     Se inserta en un <div id="appHeader"></div>
  =========================================================== */
  const LOGO_SVG =
    '<svg class="logo-mark" width="30" height="30" viewBox="0 0 32 32" aria-hidden="true" focusable="false">' +
    '<rect x="3" y="16" width="6" height="13" rx="1.5" fill="#1FA2FF"></rect>' +
    '<rect x="13" y="9" width="6" height="20" rx="1.5" fill="#0A2540"></rect>' +
    '<rect x="23" y="4" width="6" height="25" rx="1.5" fill="#1FA2FF"></rect>' +
    '<circle cx="16" cy="4.5" r="3" fill="#F2A900"></circle></svg>';

  const REGIONES = [
    "Lima Metropolitana",
    "Arequipa",
    "La Libertad",
    "Cusco",
    "Piura",
  ];

  function buildHeader(host) {
    // current page para marcar navegación activa
    const page = (location.pathname.split("/").pop() || "index.html").toLowerCase();

    const regionOptions = REGIONES.map(
      (r) => `<option value="${PD.esc(r)}">${PD.esc(r)}</option>`
    ).join("");
    const currentUser = getCurrentUser();
    const userLabel = currentUser ? (currentUser.nombre || currentUser.email) : "Ingresar";
    const userInitials = currentUser
      ? String(currentUser.nombre || currentUser.email).trim().split(/\s+/).slice(0, 2).map((p) => p.charAt(0)).join("").toUpperCase()
      : "";

    host.innerHTML = `
      <header class="app-header">
        <div class="container app-header-inner">
          <a href="index.html" class="logo" aria-label="PoliData, ir al inicio">
            ${LOGO_SVG}<span class="logo-text">PoliData</span>
          </a>

          <button class="app-search-toggle" id="searchToggle" aria-expanded="false" aria-controls="appSearchWrap" aria-label="Mostrar buscador">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><path d="m21 21-4-4"></path></svg>
          </button>

          <div class="app-search-wrap" id="appSearchWrap">
            <div class="app-search" role="search">
              <svg class="app-search-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><path d="m21 21-4-4"></path></svg>
              <input type="search" id="globalSearch" autocomplete="off"
                placeholder="Buscar candidato, partido, cargo, tema…"
                aria-label="Buscar candidato, partido, cargo o tema"
                aria-expanded="false" aria-controls="searchResults" role="combobox" />
              <ul class="search-results" id="searchResults" role="listbox" hidden></ul>
            </div>
          </div>

          <div class="app-header-controls">
            <label class="region-select">
              <span class="visually-hidden">Región o circunscripción</span>
              <select id="regionSelect" aria-label="Región o circunscripción">
                <option value="">Región / Circunscripción</option>
                ${regionOptions}
              </select>
            </label>

            <a class="user-btn ${currentUser ? "is-authenticated" : ""}" href="cuenta.html" aria-label="Cuenta de usuario: ${PD.esc(userLabel)}">
              ${currentUser ? `<span class="user-initials" aria-hidden="true">${PD.esc(userInitials || "U")}</span>` : `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"></circle><path d="M4 21a8 8 0 0 1 16 0"></path></svg>`}
            </a>
          </div>
        </div>

        <nav class="app-nav" aria-label="Navegación principal">
          <div class="container app-nav-inner">
            <a href="candidatos.html"${page === "candidatos.html" ? ' aria-current="page"' : ""}>Candidatos</a>
            <a href="comparar.html"${page === "comparar.html" ? ' aria-current="page"' : ""}>Comparador</a>
            <a href="afinidad.html"${page === "afinidad.html" ? ' aria-current="page"' : ""}>Afinidad</a>
            <a href="reportes.html"${page === "reportes.html" ? ' aria-current="page"' : ""}>Reportes IA</a>
            <a href="seguimiento.html"${page === "seguimiento.html" ? ' aria-current="page"' : ""}>PoliData 365</a>
            <a href="notificaciones.html"${page === "notificaciones.html" ? ' aria-current="page"' : ""}>Notificaciones</a>
            <a href="antecedentes.html?id=c1"${page === "antecedentes.html" ? ' aria-current="page"' : ""}>Semáforo</a>
            <a href="admin.html"${page === "admin.html" ? ' aria-current="page"' : ""}>Admin IA</a>
            <a href="cuenta.html"${page === "cuenta.html" ? ' aria-current="page"' : ""}>Cuenta</a>
            <a href="index.html#metodologia">Metodología</a>
          </div>
        </nav>
      </header>`;

    wireSearch(host);
    wireSearchToggle(host);
    wireRegion(host);
  }

  /* ---- Buscador global ---- */
  function candidatoCoincide(c, q) {
    const hay = (q || "").trim().toLowerCase();
    if (!hay) return false;
    return [c.nombre, c.partido, c.cargo, c.region]
      .filter(Boolean)
      .some((campo) => campo.toLowerCase().includes(hay));
  }

  function wireSearch(host) {
    const input = host.querySelector("#globalSearch");
    const list = host.querySelector("#searchResults");
    if (!input || !list) return;

    let activeIndex = -1;

    function close() {
      list.hidden = true;
      list.innerHTML = "";
      input.setAttribute("aria-expanded", "false");
      activeIndex = -1;
    }

    function render(q) {
      const matches = PD.getCandidatos().filter((c) => candidatoCoincide(c, q)).slice(0, 6);
      if (!matches.length) {
        list.innerHTML = `<li class="search-empty" role="option" aria-disabled="true">Sin coincidencias para “${PD.esc(q)}”.</li>`;
        list.hidden = false;
        input.setAttribute("aria-expanded", "true");
        return;
      }
      list.innerHTML = matches
        .map((c, i) => {
          const sem = PD.semaforoDe(c);
          return `<li class="search-item" role="option" id="sres-${i}" data-id="${c.id}" tabindex="-1">
              <span class="dot-sm ${sem.tagCls}" aria-hidden="true"></span>
              <span class="search-item-main">
                <strong>${PD.esc(c.nombre)}</strong>
                <small>${PD.esc(c.partido)} · ${PD.esc(c.region)}</small>
              </span>
            </li>`;
        })
        .join("");
      list.hidden = false;
      input.setAttribute("aria-expanded", "true");
      activeIndex = -1;
    }

    function go(id) {
      if (id) location.href = "candidato.html?id=" + encodeURIComponent(id);
    }

    input.addEventListener("input", () => {
      const q = input.value.trim();
      if (q.length < 1) { close(); return; }
      render(q);
    });

    input.addEventListener("keydown", (e) => {
      const items = Array.from(list.querySelectorAll(".search-item"));
      if (e.key === "ArrowDown" && items.length) {
        e.preventDefault();
        activeIndex = Math.min(activeIndex + 1, items.length - 1);
      } else if (e.key === "ArrowUp" && items.length) {
        e.preventDefault();
        activeIndex = Math.max(activeIndex - 1, 0);
      } else if (e.key === "Enter") {
        if (activeIndex >= 0 && items[activeIndex]) {
          e.preventDefault();
          go(items[activeIndex].dataset.id);
        } else if (items.length === 1) {
          e.preventDefault();
          go(items[0].dataset.id);
        }
        return;
      } else if (e.key === "Escape") {
        close();
        return;
      } else {
        return;
      }
      items.forEach((it, i) => it.classList.toggle("active", i === activeIndex));
      if (items[activeIndex]) {
        input.setAttribute("aria-activedescendant", items[activeIndex].id);
      }
    });

    list.addEventListener("click", (e) => {
      const li = e.target.closest(".search-item");
      if (li) go(li.dataset.id);
    });

    // Cerrar al hacer clic fuera
    document.addEventListener("click", (e) => {
      if (!host.querySelector(".app-search").contains(e.target)) close();
    });
  }

  /* ---- Botón de buscador en móvil ---- */
  function wireSearchToggle(host) {
    const toggle = host.querySelector("#searchToggle");
    const wrap = host.querySelector("#appSearchWrap");
    if (!toggle || !wrap) return;
    toggle.addEventListener("click", () => {
      const open = wrap.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      if (open) {
        const input = wrap.querySelector("#globalSearch");
        if (input) input.focus();
      }
    });
  }

  /* ---- Selector de región: filtra el directorio si estamos en él ---- */
  function wireRegion(host) {
    const select = host.querySelector("#regionSelect");
    if (!select) return;
    select.addEventListener("change", () => {
      // Si hay un manejador de página registrado, lo usamos
      if (typeof global.PoliOnRegionChange === "function") {
        global.PoliOnRegionChange(select.value);
      } else if (select.value) {
        // Si no estamos en el directorio, vamos a él con el filtro aplicado
        location.href = "candidatos.html?region=" + encodeURIComponent(select.value);
      }
    });
  }

  /* ===========================================================
     3. Footer compartido (inyección)
  =========================================================== */
  function buildFooter(host) {
    host.innerHTML = `
      <footer class="app-footer">
        <div class="container app-footer-inner">
          <nav class="app-footer-links" aria-label="Enlaces institucionales">
            <a href="index.html#metodologia">Metodología</a>
            <span aria-hidden="true">|</span>
            <a href="afinidad.html">Test de afinidad</a>
            <span aria-hidden="true">|</span>
            <a href="reportes.html">Reportes IA</a>
            <span aria-hidden="true">|</span>
            <a href="seguimiento.html">PoliData 365</a>
            <span aria-hidden="true">|</span>
            <a href="notificaciones.html">Notificaciones</a>
            <span aria-hidden="true">|</span>
            <a href="admin.html">Admin IA</a>
            <span aria-hidden="true">|</span>
            <a href="cuenta.html">Cuenta</a>
            <span aria-hidden="true">|</span>
            <a href="index.html#confianza">Fuentes oficiales</a>
            <span aria-hidden="true">|</span>
            <a href="index.html#consejo">Gobernanza propuesta</a>
          </nav>
          <p class="app-footer-tag">Cada dato cita su fuente oficial.</p>
          <p class="app-footer-legal">ElectAnalysis © 2026 · PoliData. Demostración académica con datos ficticios.</p>
        </div>
      </footer>`;
  }

  /* ===========================================================
     4. Animaciones de aparición (IntersectionObserver)
  =========================================================== */
  function initReveal() {
    const reveals = document.querySelectorAll(".reveal");
    if (!reveals.length) return;
    const reduce = global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in global)) {
      reveals.forEach((el) => el.classList.add("visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  }

  /* ===========================================================
     5. Utilidad: avatar placeholder con iniciales
  =========================================================== */
  function avatarHTML(candidato, extraClass) {
    const cls = "avatar" + (extraClass ? " " + extraClass : "");
    return `<span class="${cls}" aria-hidden="true">${PD.esc(candidato.iniciales || "")}</span>`;
  }

  /* ===========================================================
     6. Inicialización automática
  =========================================================== */
  function init() {
    const headerHost = document.getElementById("appHeader");
    if (headerHost) buildHeader(headerHost);
    const footerHost = document.getElementById("appFooter");
    if (footerHost) buildFooter(footerHost);
    initReveal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  /* ---- Exposición ---- */
  global.PoliCommon = {
    MAX_COMPARE,
    getComparacion,
    addComparacion,
    removeComparacion,
    isInComparacion,
    saveComparacion,
    getUsers,
    saveUsers,
    getSession,
    setSession,
    getCurrentUser,
    refreshShell: init,
    avatarHTML,
    initReveal,
  };
})(window);
