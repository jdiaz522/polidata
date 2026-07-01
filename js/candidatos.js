/* =============================================================
   PoliData — Directorio de candidatos (candidatos.js)
   Tarjetas, búsqueda local, filtros por región y cargo,
   y "Agregar a comparación" (localStorage, máx. 4).
   ============================================================= */
(function (global) {
  "use strict";

  const PD = global.PoliData;
  const PC = global.PoliCommon;

  const grid = document.getElementById("candGrid");
  const empty = document.getElementById("candEmpty");
  const filterText = document.getElementById("filterText");
  const filterRegion = document.getElementById("filterRegion");
  const filterCargo = document.getElementById("filterCargo");
  const compareBar = document.getElementById("compareBar");
  const liveMsg = document.getElementById("dirLive");

  if (!grid) return;

  /* ---- Poblar filtros con valores únicos ---- */
  function unique(values) {
    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, "es"));
  }

  function fillSelect(select, values, placeholder) {
    if (!select) return;
    select.innerHTML =
      `<option value="">${PD.esc(placeholder)}</option>` +
      values.map((v) => `<option value="${PD.esc(v)}">${PD.esc(v)}</option>`).join("");
  }

  fillSelect(filterRegion, unique(PD.getCandidatos().map((c) => c.region)), "Todas las regiones");
  fillSelect(filterCargo, unique(PD.getCandidatos().map((c) => c.cargo)), "Todos los cargos");

  // Aplicar filtro de región desde la URL (?region=) o el selector del header
  const params = new URLSearchParams(location.search);
  const regionURL = params.get("region");
  if (regionURL && filterRegion) filterRegion.value = regionURL;

  // Permitir que el selector de región del header controle este directorio
  global.PoliOnRegionChange = function (region) {
    if (filterRegion) filterRegion.value = region || "";
    render();
  };

  /* ---- Tarjeta de candidato ---- */
  function tarjeta(c) {
    const sem = PD.semaforoDe(c);
    const enComp = PC.isInComparacion(c.id);
    return `
      <article class="dir-card reveal">
        <div class="dir-card-top">
          ${PC.avatarHTML(c, "avatar-lg")}
          <span class="status-tag ${sem.tagCls}">
            <span class="status-dot" aria-hidden="true"></span>${PD.esc(sem.label)}
          </span>
        </div>
        <h3 class="dir-card-name">${PD.esc(c.nombre)}</h3>
        <dl class="dir-card-meta">
          <div><dt>Partido</dt><dd>${PD.esc(PD.mostrarDato(c.partido))}</dd></div>
          <div><dt>Cargo</dt><dd>${PD.esc(PD.mostrarDato(c.cargo))}</dd></div>
          <div><dt>Región</dt><dd>${PD.esc(PD.mostrarDato(c.region))}</dd></div>
        </dl>
        <div class="dir-card-actions">
          <a class="btn btn-primary btn-sm" href="candidato.html?id=${encodeURIComponent(c.id)}">Ver perfil</a>
          <button type="button" class="btn btn-secondary btn-sm btn-compare" data-id="${c.id}" aria-pressed="${enComp}">
            ${enComp ? "En comparación ✓" : "Agregar a comparación"}
          </button>
        </div>
      </article>`;
  }

  /* ---- Render según filtros ---- */
  function getFiltrados() {
    const q = (filterText && filterText.value.trim().toLowerCase()) || "";
    const region = (filterRegion && filterRegion.value) || "";
    const cargo = (filterCargo && filterCargo.value) || "";
    return PD.getCandidatos().filter((c) => {
      const matchQ =
        !q ||
        [c.nombre, c.partido, c.cargo, c.region]
          .filter(Boolean)
          .some((v) => v.toLowerCase().includes(q));
      const matchR = !region || c.region === region;
      const matchC = !cargo || c.cargo === cargo;
      return matchQ && matchR && matchC;
    });
  }

  function render() {
    const lista = getFiltrados();
    if (!lista.length) {
      grid.innerHTML = "";
      if (empty) empty.hidden = false;
    } else {
      if (empty) empty.hidden = true;
      grid.innerHTML = lista.map(tarjeta).join("");
      // las tarjetas nuevas usan .reveal: mostrarlas de inmediato
      grid.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
    }
    updateCompareBar();
  }

  /* ---- Barra de comparación ---- */
  function updateCompareBar() {
    if (!compareBar) return;
    const ids = PC.getComparacion();
    if (!ids.length) {
      compareBar.hidden = true;
      return;
    }
    compareBar.hidden = false;
    compareBar.querySelector("[data-count]").textContent = ids.length + " / " + PC.MAX_COMPARE;
  }

  /* ---- Eventos ---- */
  if (filterText) filterText.addEventListener("input", render);
  if (filterRegion) filterRegion.addEventListener("change", render);
  if (filterCargo) filterCargo.addEventListener("change", render);

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-compare");
    if (!btn) return;
    const id = btn.dataset.id;
    if (PC.isInComparacion(id)) {
      PC.removeComparacion(id);
      anunciar("Candidato retirado de la comparación.");
    } else {
      const r = PC.addComparacion(id);
      if (r === "full") {
        anunciar("Solo puedes comparar hasta " + PC.MAX_COMPARE + " candidatos.");
        return;
      }
      if (r === "ok") anunciar("Candidato agregado a la comparación.");
    }
    render();
  });

  function anunciar(msg) {
    if (liveMsg) liveMsg.textContent = msg;
  }

  render();
})(window);
