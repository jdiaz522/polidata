/* =============================================================
   PoliData — Comparador de candidatos (comparar.js) · HU-020
   Selección persistida (localStorage, 2–4), modal para agregar,
   contador dinámico, filtro por eje temático y tabla dinámica.
   ============================================================= */
(function (global) {
  "use strict";

  const PD = global.PoliData;
  const PC = global.PoliCommon;

  const root = document.getElementById("compararRoot");
  if (!root) return;

  const md = PD.mostrarDato;
  const esc = PD.esc;

  // Referencias a elementos de la página
  const selWrap = document.getElementById("selectedWrap");
  const counterEl = document.getElementById("compareCounter");
  const addBtn = document.getElementById("addCandidateBtn");
  const tableWrap = document.getElementById("compareTableWrap");
  const ejeSelect = document.getElementById("ejeSelect");
  const liveMsg = document.getElementById("compareLive");
  const exportBtn = document.getElementById("exportCompare");
  const shareBtn = document.getElementById("shareCompare");
  const printBtn = document.getElementById("printCompare");
  const modal = document.getElementById("addModal");
  const modalList = document.getElementById("modalList");
  const modalClose = document.getElementById("modalClose");
  const modalBackdrop = document.getElementById("modalBackdrop");

  /* ---- Selección por defecto si no hay nada guardado ---- */
  let seleccion = PC.getComparacion();
  if (!seleccion.length) {
    seleccion = ["c1", "c2", "c3"]; // demostración del wireframe
    PC.saveComparacion(seleccion);
  }

  function refrescarSeleccion() {
    seleccion = PC.getComparacion();
  }

  /* ---- Definición de ejes (filas) de comparación ---- */
  const EJES = [
    { key: "antecedentes", label: "Semáforo de antecedentes", fuente: "Poder Judicial", recomendado: true,
      render: (c) => {
        const s = PD.semaforoDe(c);
        return `<span class="status-tag ${s.tagCls}"><span class="status-dot" aria-hidden="true"></span>${esc(s.label)}</span>`;
      } },
    { key: "educacion", label: "Posición sobre educación", fuente: "Planes de gobierno", recomendado: true,
      render: (c) => esc(md(c.propuestas && c.propuestas.educacion)) },
    { key: "economia", label: "Posición sobre economía", fuente: "Planes de gobierno", recomendado: true,
      render: (c) => esc(md(c.propuestas && c.propuestas.economia)) },
    { key: "seguridad", label: "Posición sobre seguridad", fuente: "Planes de gobierno", recomendado: true,
      render: (c) => esc(md(c.propuestas && c.propuestas.seguridad)) },
    { key: "ideologia", label: "Orientación ideológica", fuente: "Plan de gobierno", recomendado: true,
      render: (c) => {
        const i = c.ideologia || {};
        const valor = Number(i.valor) || 50;
        return `<div class="ideology-mini">
          <div class="spectrum" aria-label="Ubicación ideológica ${valor} de 100"><span style="left:${valor}%"></span></div>
          <strong>${esc(md(i.etiqueta))}</strong>
          <small>Fuente: ${esc(md(i.fuente))}</small>
        </div>`;
      } },
    { key: "indicadores", label: "Indicadores de análisis", fuente: "PoliData 365", recomendado: true,
      render: (c) => {
        const m = c.indicadores || {};
        return `<ul class="cell-list metric-list">
          <li><strong>Transparencia:</strong> ${esc(md(m.transparencia))}/100</li>
          <li><strong>Riesgo:</strong> ${esc(md(m.riesgo))}/100</li>
          <li><strong>Consistencia:</strong> ${esc(md(m.consistencia))}/100</li>
          <li><strong>Asistencia:</strong> ${esc(md(m.asistencia))}/100</li>
        </ul>`;
      } },
    { key: "financiamiento", label: "Financiamiento de campaña", fuente: "ONPE", recomendado: true,
      render: (c) => {
        const f = c.financiamiento || {};
        const origen = (f.origenes && f.origenes.join(", ")) || null;
        const uso = (f.usos && f.usos.join(", ")) || null;
        return `<ul class="cell-list">
          <li><strong>Origen:</strong> ${esc(md(origen))}</li>
          <li><strong>Gasto total:</strong> ${esc(md(f.gastoTotal))}</li>
          <li><strong>Principal uso:</strong> ${esc(md(uso))}</li>
        </ul>`;
      } },
    { key: "experiencia", label: "Experiencia y trayectoria", fuente: "JNE", recomendado: true,
      render: (c) => {
        const tray = md(c.trayectoria);
        const exp = md(c.experiencia);
        return `<span class="cell-soft">${esc(exp)}.</span> ${esc(tray)}`;
      } },
  ];

  // Opciones del selector de eje (alineadas con EJES + "recomendados")
  const EJE_OPCIONES = [
    { value: "recomendados", label: "Ejes recomendados" },
    { value: "antecedentes", label: "Antecedentes" },
    { value: "educacion", label: "Educación" },
    { value: "economia", label: "Economía" },
    { value: "seguridad", label: "Seguridad" },
    { value: "ideologia", label: "Orientación ideológica" },
    { value: "indicadores", label: "Indicadores de análisis" },
    { value: "financiamiento", label: "Financiamiento" },
    { value: "experiencia", label: "Experiencia y trayectoria" },
  ];

  function initEjeSelect() {
    if (!ejeSelect) return;
    ejeSelect.innerHTML = EJE_OPCIONES.map(
      (o) => `<option value="${o.value}">${esc(o.label)}</option>`
    ).join("");
    ejeSelect.addEventListener("change", renderTabla);
  }

  /* ===========================================================
     Render: contador
  =========================================================== */
  function renderContador() {
    if (counterEl) counterEl.textContent = seleccion.length + " / " + PC.MAX_COMPARE;
    if (addBtn) {
      const full = seleccion.length >= PC.MAX_COMPARE;
      addBtn.disabled = full;
      addBtn.setAttribute("aria-disabled", String(full));
      addBtn.querySelector(".add-card-label").textContent = full ? "Límite alcanzado" : "Agregar candidato";
      addBtn.querySelector(".add-card-sub").textContent = full
        ? "Máximo 4 candidatos"
        : "Selecciona uno más";
    }
  }

  /* ===========================================================
     Render: tarjetas de seleccionados
  =========================================================== */
  function renderSeleccionados() {
    if (!selWrap) return;
    const cards = seleccion
      .map((id) => PD.getCandidato(id))
      .filter(Boolean)
      .map(
        (c) => `
        <article class="sel-card">
          ${PC.avatarHTML(c, "avatar-md")}
          <div class="sel-card-info">
            <strong>${esc(c.nombre)}</strong>
            <small>${esc(md(c.partido))}</small>
            <small>${esc(md(c.cargo))} — ${esc(md(c.region))}</small>
          </div>
          <button type="button" class="sel-remove" data-id="${c.id}" aria-label="Retirar a ${esc(c.nombre)} de la comparación">
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"></path></svg>
          </button>
        </article>`
      )
      .join("");

    selWrap.innerHTML = cards;
  }

  /* ===========================================================
     Render: tabla comparativa (dinámica)
  =========================================================== */
  function renderTabla() {
    if (!tableWrap) return;
    const candidatos = seleccion.map((id) => PD.getCandidato(id)).filter(Boolean);

    if (candidatos.length < 2) {
      tableWrap.innerHTML = `<div class="state-empty state-empty-soft">
        <p>Selecciona al menos <strong>dos candidatos</strong> para comparar.</p>
        <button type="button" class="btn btn-primary btn-sm" data-open-modal>Agregar candidato</button>
      </div>`;
      return;
    }

    const filtro = (ejeSelect && ejeSelect.value) || "recomendados";
    const filas = filtro === "recomendados" ? EJES : EJES.filter((e) => e.key === filtro);

    const headCols = candidatos
      .map(
        (c) => `<th scope="col" class="cmp-cand">
          <a href="candidato.html?id=${encodeURIComponent(c.id)}" class="cmp-cand-link">
            ${PC.avatarHTML(c, "avatar-sm")}
            <span><strong>${esc(c.nombre)}</strong><small>${esc(md(c.partido))}</small></span>
          </a>
        </th>`
      )
      .join("");

    const bodyRows = filas
      .map((eje) => {
        const cells = candidatos.map((c) => `<td>${eje.render(c)}</td>`).join("");
        return `<tr>
          <th scope="row" class="cmp-eje">
            <span class="cmp-eje-label">${esc(eje.label)}</span>
            <span class="cmp-eje-src">Fuente: ${esc(eje.fuente)}</span>
          </th>
          ${cells}
        </tr>`;
      })
      .join("");

    tableWrap.innerHTML = `
      <div class="table-scroll" tabindex="0" role="region" aria-label="Tabla comparativa (desplazable horizontalmente)">
        <table class="compare-table">
          <caption class="visually-hidden">Comparación de candidatos por eje temático. Desplázate horizontalmente para ver todas las columnas.</caption>
          <thead><tr><th scope="col" class="cmp-eje-head">Eje de comparación</th>${headCols}</tr></thead>
          <tbody>${bodyRows}</tbody>
        </table>
      </div>
      <p class="scroll-hint" aria-hidden="true">↔ Desliza horizontalmente para ver todos los candidatos</p>`;
  }

  /* ===========================================================
     Modal "Agregar candidato"
  =========================================================== */
  let lastFocused = null;

  function disponiblesParaAgregar() {
    return PD.getCandidatos().filter((c) => !seleccion.includes(c.id));
  }

  function openModal() {
    if (!modal) return;
    const disponibles = disponiblesParaAgregar();
    modalList.innerHTML = disponibles.length
      ? disponibles
          .map((c) => {
            const s = PD.semaforoDe(c);
            return `<li>
              <button type="button" class="modal-cand" data-id="${c.id}">
                ${PC.avatarHTML(c, "avatar-sm")}
                <span class="modal-cand-info">
                  <strong>${esc(c.nombre)}</strong>
                  <small>${esc(md(c.partido))} — ${esc(md(c.region))}</small>
                </span>
                <span class="status-tag ${s.tagCls} status-tag-mini"><span class="status-dot" aria-hidden="true"></span>${esc(s.label)}</span>
              </button>
            </li>`;
          })
          .join("")
      : `<li class="modal-empty">No hay más candidatos disponibles para agregar.</li>`;

    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.classList.add("modal-open");
    // foco al primer elemento enfocable
    const first = modal.querySelector(".modal-cand, #modalClose");
    if (first) first.focus();
    document.addEventListener("keydown", onModalKeydown);
  }

  function closeModal() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    document.removeEventListener("keydown", onModalKeydown);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function onModalKeydown(e) {
    if (e.key === "Escape") {
      closeModal();
      return;
    }
    if (e.key === "Tab") {
      // foco atrapado dentro del modal
      const focusables = modal.querySelectorAll("button:not([disabled])");
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
  }

  function anunciar(t) { if (liveMsg) liveMsg.textContent = t; }

  function textoPlano(valor) {
    return String(valor === null || valor === undefined ? "" : valor).replace(/\s+/g, " ").trim();
  }

  function descargar(nombre, contenido, tipo) {
    const blob = new Blob([contenido], { type: tipo });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function csvComparacion() {
    const candidatos = seleccion.map((id) => PD.getCandidato(id)).filter(Boolean);
    const filas = [
      ["Campo"].concat(candidatos.map((c) => c.nombre)),
      ["Partido"].concat(candidatos.map((c) => c.partido)),
      ["Región"].concat(candidatos.map((c) => c.region)),
      ["Semáforo"].concat(candidatos.map((c) => PD.semaforoDe(c).label)),
      ["Educación"].concat(candidatos.map((c) => c.propuestas && c.propuestas.educacion)),
      ["Economía"].concat(candidatos.map((c) => c.propuestas && c.propuestas.economia)),
      ["Seguridad"].concat(candidatos.map((c) => c.propuestas && c.propuestas.seguridad)),
      ["Orientación"].concat(candidatos.map((c) => c.ideologia && c.ideologia.etiqueta)),
      ["Gasto total"].concat(candidatos.map((c) => c.financiamiento && c.financiamiento.gastoTotal)),
      ["Última actualización"].concat(candidatos.map((c) => c.ultimaActualizacion)),
    ];
    return filas
      .map((fila) => fila.map((v) => `"${textoPlano(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
  }

  /* ===========================================================
     Re-render general
  =========================================================== */
  function renderTodo() {
    refrescarSeleccion();
    renderContador();
    renderSeleccionados();
    renderTabla();
  }

  /* ===========================================================
     Eventos
  =========================================================== */
  // Retirar candidato
  if (selWrap) {
    selWrap.addEventListener("click", (e) => {
      const btn = e.target.closest(".sel-remove");
      if (!btn) return;
      const c = PD.getCandidato(btn.dataset.id);
      PC.removeComparacion(btn.dataset.id);
      renderTodo();
      anunciar((c ? c.nombre : "Candidato") + " retirado. Ahora hay " + seleccion.length + " de " + PC.MAX_COMPARE + ".");
    });
  }

  // Abrir modal (botón principal + cualquier [data-open-modal])
  if (addBtn) addBtn.addEventListener("click", () => { if (!addBtn.disabled) openModal(); });
  root.addEventListener("click", (e) => {
    if (e.target.closest("[data-open-modal]")) openModal();
  });

  // Agregar desde el modal
  if (modalList) {
    modalList.addEventListener("click", (e) => {
      const btn = e.target.closest(".modal-cand");
      if (!btn) return;
      const r = PC.addComparacion(btn.dataset.id);
      const c = PD.getCandidato(btn.dataset.id);
      if (r === "ok") {
        renderTodo();
        anunciar((c ? c.nombre : "Candidato") + " agregado. Ahora hay " + seleccion.length + " de " + PC.MAX_COMPARE + ".");
        if (seleccion.length >= PC.MAX_COMPARE) {
          closeModal();
        } else {
          openModal(); // refresca lista disponible manteniendo el modal
        }
      } else if (r === "full") {
        anunciar("Máximo " + PC.MAX_COMPARE + " candidatos.");
        closeModal();
      }
    });
  }

  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener("click", closeModal);

  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      descargar("polidata-comparacion.csv", csvComparacion(), "text/csv;charset=utf-8");
      anunciar("Comparación exportada en CSV con fuentes y estructura de columnas.");
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener("click", async () => {
      const url = location.origin + location.pathname + "?ids=" + encodeURIComponent(seleccion.join(","));
      try {
        if (navigator.clipboard) await navigator.clipboard.writeText(url);
        anunciar("Enlace de comparación copiado al portapapeles.");
      } catch (e) {
        prompt("Copia este enlace para compartir la comparación:", url);
      }
    });
  }

  if (printBtn) {
    printBtn.addEventListener("click", () => {
      anunciar("Abriendo el diálogo de impresión para guardar como PDF.");
      window.print();
    });
  }

  /* ---- Inicialización ---- */
  const idsURL = new URLSearchParams(location.search).get("ids");
  if (idsURL) {
    const ids = idsURL.split(",").map((x) => x.trim()).filter((id) => PD.getCandidato(id)).slice(0, PC.MAX_COMPARE);
    if (ids.length) {
      seleccion = ids;
      PC.saveComparacion(ids);
    }
  }
  initEjeSelect();
  renderTodo();
})(window);
