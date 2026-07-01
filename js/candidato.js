/* =============================================================
   PoliData — Ficha del candidato (candidato.js) · HU-010
   Lee ?id=, pinta perfil completo, navegación interna por anclas,
   acciones de comparar/seguir y estado de error si no existe.
   ============================================================= */
(function (global) {
  "use strict";

  const PD = global.PoliData;
  const PC = global.PoliCommon;

  const root = document.getElementById("candidatoRoot");
  if (!root) return;

  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const c = PD.getCandidato(id);

  /* ---- Estado de error: candidato no encontrado ---- */
  if (!c) {
    root.innerHTML = `
      <section class="state-empty" role="alert">
        <h1>Candidato no encontrado</h1>
        <p>No pudimos encontrar el candidato solicitado. Es posible que el enlace sea incorrecto.</p>
        <a class="btn btn-primary" href="candidatos.html">Volver a Explorar candidatos</a>
      </section>`;
    document.title = "Candidato no encontrado · PoliData";
    return;
  }

  const sem = PD.semaforoDe(c);
  const md = PD.mostrarDato;
  const esc = PD.esc;
  document.title = c.nombre + " · PoliData";

  /* ---- Construcción de bloques ---- */
  function listaHoja() {
    const items = [];
    (c.formacionAcademica || []).forEach((f) => items.push(esc(f)));
    if (!items.length) items.push(esc("Información no disponible"));
    return items.map((t) => `<li>${t}</li>`).join("");
  }

  function fuentesHTML() {
    const fuentes = (c.fuentes || []).map((abbr) => {
      const f = PD.FUENTES_OFICIALES.find((x) => x.abbr === abbr);
      const nombre = f ? f.name : abbr;
      const label = `<strong>${esc(abbr)}</strong> — ${esc(nombre)}`;
      const ref = f && f.url
        ? `<a href="${esc(f.url)}" target="_blank" rel="noopener">${label}</a>`
        : `<span>${label}</span>`;
      return `<li class="fuente-item">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 21h18M5 21V9l7-4 7 4v12"></path><path d="M9 21v-6h6v6"></path></svg>
          ${ref}
        </li>`;
    });
    if (!fuentes.length) fuentes.push(`<li class="fuente-item">${esc("Información no disponible")}</li>`);
    return fuentes.join("");
  }

  function indicadoresHTML() {
    const m = c.indicadores || {};
    const rows = [
      ["Transparencia", m.transparencia],
      ["Riesgo de antecedentes", m.riesgo],
      ["Consistencia programática", m.consistencia],
      ["Asistencia estimada", m.asistencia],
    ];
    return rows.map(([label, value]) => {
      const n = Number(value) || 0;
      return `<li>
        <div class="metric-row"><span>${esc(label)}</span><strong>${n}/100</strong></div>
        <div class="progress"><span style="width:${n}%"></span></div>
      </li>`;
    }).join("");
  }

  function antecedentesTablaHTML() {
    const lista = c.antecedentes || [];
    if (!lista.length) {
      return `<tr><td colspan="3" class="td-empty">No se registran antecedentes en las fuentes consultadas.</td></tr>`;
    }
    return lista
      .map((a) => {
        const estadoSem = estadoToSem(a.estado);
        return `<tr>
          <td>${esc(md(a.tipo))}</td>
          <td><span class="status-tag ${estadoSem.tagCls}"><span class="status-dot" aria-hidden="true"></span>${esc(md(a.estado))}</span></td>
          <td>${esc(md(a.fuente))}</td>
        </tr>`;
      })
      .join("");
  }

  // Mapea el estado de un antecedente individual a un color de etiqueta
  function estadoToSem(estado) {
    const e = (estado || "").toLowerCase();
    if (e.includes("sentencia firme") || e.includes("inhabilitaci")) return PD.SEMAFORO.red;
    if (e.includes("en curso") || e.includes("trámite") || e.includes("tramite")) return PD.SEMAFORO.amber;
    return PD.SEMAFORO.green;
  }

  function origenesHTML() {
    const o = (c.financiamiento && c.financiamiento.origenes) || [];
    if (!o.length) return `<li>${esc("Información no disponible")}</li>`;
    return o.map((x) => `<li>${esc(x)}</li>`).join("");
  }
  function usosHTML() {
    const u = (c.financiamiento && c.financiamiento.usos) || [];
    if (!u.length) return `<li>${esc("Información no disponible")}</li>`;
    return u.map((x) => `<li>${esc(x)}</li>`).join("");
  }

  /* ---- Render principal ---- */
  root.innerHTML = `
    <nav class="breadcrumb" aria-label="Ruta de navegación">
      <a href="candidatos.html">← Volver a Explorar candidatos</a>
    </nav>

    <div class="profile-tools card" aria-label="Acciones de la ficha">
      <div>
        <strong>Ficha verificable</strong>
        <span>Última actualización: ${esc(md(c.ultimaActualizacion))}</span>
      </div>
      <div class="profile-tools-actions">
        <button type="button" class="btn btn-secondary btn-sm" id="btnSimple">Modo lectura simple</button>
        <button type="button" class="btn btn-secondary btn-sm" id="btnExport">Exportar CSV</button>
        <button type="button" class="btn btn-secondary btn-sm" id="btnShare">Compartir</button>
        <button type="button" class="btn btn-secondary btn-sm" id="btnPrint">Reporte PDF</button>
      </div>
    </div>

    <!-- Encabezado de la ficha -->
    <header class="profile-head card">
      <div class="profile-head-main">
        ${PC.avatarHTML(c, "avatar-xl")}
        <div class="profile-head-info">
          <h1>${esc(c.nombre)}</h1>
          <p class="profile-line"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 21h18M5 21V9l7-4 7 4v12"></path></svg> ${esc(md(c.partido))}</p>
          <p class="profile-line"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 3v18M7 8h10M7 13h10"></path></svg> ${esc(md(c.cargo))}</p>
          <p class="profile-line"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 21s-6-5.5-6-10a6 6 0 1 1 12 0c0 4.5-6 10-6 10Z"></path><circle cx="12" cy="11" r="2.2"></circle></svg> ${esc(md(c.region))}</p>
        </div>
      </div>
      <div class="profile-head-status">
        <span class="status-tag status-tag-lg ${sem.tagCls}">
          <span class="status-dot" aria-hidden="true"></span>${esc(sem.label)}
        </span>
        <span class="profile-status-cap">Semáforo de antecedentes</span>
        <a class="link-quiet" href="antecedentes.html?id=${encodeURIComponent(c.id)}">Ver detalle del semáforo →</a>
      </div>
    </header>

    <!-- Navegación interna -->
    <nav class="profile-tabs" id="profileTabs" aria-label="Secciones del perfil">
      <a href="#resumen" class="profile-tab" aria-current="true">Resumen</a>
      <a href="#hoja-vida" class="profile-tab">Hoja de vida</a>
      <a href="#propuestas" class="profile-tab">Propuestas</a>
      <a href="#antecedentes" class="profile-tab">Antecedentes</a>
      <a href="#financiamiento" class="profile-tab">Financiamiento</a>
      <a href="#analisis" class="profile-tab">Análisis</a>
    </nav>

    <div class="profile-grid">
      <!-- Columna principal -->
      <div class="profile-main">

        <section id="resumen" class="card profile-section" aria-labelledby="h-resumen">
          <h2 id="h-resumen" class="card-title">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4h11l5 5v11H4Z"></path><path d="M14 4v5h5"></path></svg>
            Resumen
          </h2>
          <p>${esc(md(c.planGobierno))}</p>
          <p class="source-note">Fuente: JNE</p>
        </section>

        <section id="hoja-vida" class="card profile-section" aria-labelledby="h-hoja">
          <h2 id="h-hoja" class="card-title">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"></circle><path d="M5 21a7 7 0 0 1 14 0"></path></svg>
            Hoja de vida
          </h2>
          <h3 class="subhead">Formación académica</h3>
          <ul class="bullet-list">${listaHoja()}</ul>
          <h3 class="subhead">Experiencia</h3>
          <p>${esc(md(c.experiencia))}</p>
          <h3 class="subhead">Trayectoria</h3>
          <p>${esc(md(c.trayectoria))}</p>
          <p class="source-note">Fuente: JNE</p>
        </section>

        <section id="propuestas" class="card profile-section" aria-labelledby="h-prop">
          <h2 id="h-prop" class="card-title">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4h11l5 5v11H4Z"></path><path d="M14 4v5h5"></path><path d="M8 13h8M8 16h6"></path></svg>
            Plan de gobierno
            <span class="ia-badge"><svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v4M12 17v4M3 12h4M17 12h4"></path><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"></path></svg> Resumen generado por IA</span>
          </h2>
          <p class="ia-disclaimer" role="note">Es una <strong>síntesis de demostración</strong> en lenguaje simple y <strong>no reemplaza el documento oficial</strong> del plan de gobierno.</p>
          <p data-full-text="${esc(md(c.resumenIA))}" data-simple-text="${esc(md(c.lecturaSimple && c.lecturaSimple.plan))}">${esc(md(c.resumenIA))}</p>
          <h3 class="subhead">Posiciones por eje</h3>
          <ul class="prop-list">
            <li><strong>Educación:</strong> <span data-full-text="${esc(md(c.propuestas && c.propuestas.educacion))}" data-simple-text="${esc(md(c.lecturaSimple && c.lecturaSimple.propuestas && c.lecturaSimple.propuestas.educacion))}">${esc(md(c.propuestas && c.propuestas.educacion))}</span></li>
            <li><strong>Economía:</strong> <span data-full-text="${esc(md(c.propuestas && c.propuestas.economia))}" data-simple-text="${esc(md(c.lecturaSimple && c.lecturaSimple.propuestas && c.lecturaSimple.propuestas.economia))}">${esc(md(c.propuestas && c.propuestas.economia))}</span></li>
            <li><strong>Seguridad:</strong> <span data-full-text="${esc(md(c.propuestas && c.propuestas.seguridad))}" data-simple-text="${esc(md(c.lecturaSimple && c.lecturaSimple.propuestas && c.lecturaSimple.propuestas.seguridad))}">${esc(md(c.propuestas && c.propuestas.seguridad))}</span></li>
          </ul>
          <p class="profile-doc-link"><span class="doc-pill" role="note">Documento oficial no enlazado en esta demostración.</span></p>
          <div class="ia-actions">
            <a class="btn btn-secondary btn-sm" href="reportes.html">Generar reporte IA</a>
            <button type="button" class="btn btn-secondary btn-sm" id="btnReportIA">Reportar imprecisión</button>
          </div>
          <p class="source-note">Fuente: JNE</p>
        </section>

        <section id="antecedentes" class="card profile-section" aria-labelledby="h-ant">
          <h2 id="h-ant" class="card-title">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="8" y="2" width="8" height="20" rx="4"></rect></svg>
            Antecedentes
          </h2>
          <div class="table-scroll" tabindex="0" role="region" aria-label="Tabla de antecedentes (desplazable horizontalmente)">
            <table class="data-table">
              <thead><tr><th scope="col">Tipo de proceso</th><th scope="col">Estado</th><th scope="col">Fuente</th></tr></thead>
              <tbody>${antecedentesTablaHTML()}</tbody>
            </table>
          </div>
          <a class="btn btn-secondary btn-sm" href="antecedentes.html?id=${encodeURIComponent(c.id)}">Ver detalle de antecedentes</a>
        </section>

        <section id="financiamiento" class="card profile-section" aria-labelledby="h-fin">
          <h2 id="h-fin" class="card-title">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><ellipse cx="12" cy="6" rx="8" ry="3"></ellipse><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"></path></svg>
            Financiamiento de campaña
          </h2>
          <div class="fin-grid">
            <div><h3 class="subhead">Origen de los recursos</h3><ul class="bullet-list">${origenesHTML()}</ul></div>
            <div><h3 class="subhead">Uso de los recursos</h3><ul class="bullet-list">${usosHTML()}</ul></div>
          </div>
          <p class="fin-total">Gasto total declarado: <strong>${esc(md(c.financiamiento && c.financiamiento.gastoTotal))}</strong></p>
          <p class="source-note">Fuente: ONPE</p>
        </section>

        <section id="analisis" class="card profile-section" aria-labelledby="h-ana">
          <h2 id="h-ana" class="card-title">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19V5M4 19h16"></path><path d="M8 15l3-4 3 2 5-7"></path></svg>
            Análisis electoral
          </h2>
          <h3 class="subhead">Orientación ideológica</h3>
          <div class="ideology-block">
            <div class="spectrum" aria-label="Ubicación ideológica ${esc(md(c.ideologia && c.ideologia.valor))} de 100"><span style="left:${Number(c.ideologia && c.ideologia.valor) || 50}%"></span></div>
            <p><strong>${esc(md(c.ideologia && c.ideologia.etiqueta))}</strong> · Fuente: ${esc(md(c.ideologia && c.ideologia.fuente))}</p>
          </div>
          <h3 class="subhead">Indicadores comparables</h3>
          <ul class="metric-list profile-metrics">${indicadoresHTML()}</ul>
          <p class="source-note">Fuentes: JNE, ONPE, Poder Judicial y PoliData 365 (datos de demostración).</p>
        </section>
      </div>

      <!-- Columna lateral -->
      <aside class="profile-aside">
        <section class="card" aria-labelledby="h-datos">
          <h2 id="h-datos" class="card-title-sm">Datos clave</h2>
          <dl class="key-data">
            <div><dt>Edad</dt><dd>${esc(md(c.edad ? c.edad + " años" : null))}</dd></div>
            <div><dt>Profesión</dt><dd>${esc(md(c.profesion))}</dd></div>
            <div><dt>Experiencia</dt><dd>${esc(md(c.experiencia))}</dd></div>
          </dl>
          <p class="source-note">Fuente: JNE</p>
        </section>

        <section class="card profile-actions" aria-labelledby="h-acc">
          <h2 id="h-acc" class="visually-hidden">Acciones</h2>
          <button type="button" class="btn btn-primary btn-block" id="btnCompare">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 4v16M17 4v16M3 8h8M13 8h8"></path></svg>
            Comparar este candidato
          </button>
          <button type="button" class="btn btn-secondary btn-block" id="btnFollow" aria-pressed="false">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3h12v18l-6-4-6 4Z"></path></svg>
            <span class="follow-label">Seguir — PoliData 365</span>
          </button>
          <a class="btn btn-secondary btn-block" href="seguimiento.html">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 3"></path></svg>
            Ver seguimiento 365
          </a>
          <p class="action-msg" id="actionMsg" role="status" aria-live="polite"></p>
        </section>

        <section class="card" aria-labelledby="h-fuentes">
          <h2 id="h-fuentes" class="card-title-sm">Fuentes</h2>
          <ul class="fuentes-list">${fuentesHTML()}</ul>
        </section>
      </aside>
    </div>`;

  /* ---- Navegación interna (tabs por anclas, accesible) ---- */
  const tabs = Array.from(root.querySelectorAll(".profile-tab"));
  const sections = tabs
    .map((t) => document.getElementById(t.getAttribute("href").slice(1)))
    .filter(Boolean);

  function setActive(hash) {
    tabs.forEach((t) => {
      const on = t.getAttribute("href") === hash;
      if (on) t.setAttribute("aria-current", "true");
      else t.removeAttribute("aria-current");
    });
  }
  tabs.forEach((t) => {
    t.addEventListener("click", () => setActive(t.getAttribute("href")));
  });

  // Resaltar la sección visible al hacer scroll
  if ("IntersectionObserver" in global && sections.length) {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) setActive("#" + en.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach((s) => obs.observe(s));
  }

  /* ---- Acción: comparar este candidato ---- */
  const msg = root.querySelector("#actionMsg");
  function anunciar(t) { if (msg) msg.textContent = t; }

  const btnCompare = root.querySelector("#btnCompare");
  if (btnCompare) {
    btnCompare.addEventListener("click", () => {
      const r = PC.addComparacion(c.id);
      if (r === "dup") {
        anunciar("Este candidato ya está en tu comparación.");
      } else if (r === "full") {
        anunciar("Ya tienes " + PC.MAX_COMPARE + " candidatos en la comparación.");
      } else {
        anunciar("Agregado. Abriendo el comparador…");
        setTimeout(() => { location.href = "comparar.html"; }, 700);
      }
    });
  }

  /* ---- Acción: seguir (demostración con localStorage) ---- */
  const FOLLOW_KEY = "polidata_follow";
  function getFollows() {
    try { return JSON.parse(localStorage.getItem(FOLLOW_KEY) || "[]"); } catch (e) { return []; }
  }
  function setFollows(arr) {
    try { localStorage.setItem(FOLLOW_KEY, JSON.stringify(arr)); } catch (e) { /* noop */ }
  }
  const btnFollow = root.querySelector("#btnFollow");
  const followLabel = root.querySelector(".follow-label");
  function paintFollow() {
    const following = getFollows().includes(c.id);
    btnFollow.setAttribute("aria-pressed", String(following));
    btnFollow.classList.toggle("is-following", following);
    if (followLabel) followLabel.textContent = following ? "Siguiendo — PoliData 365" : "Seguir — PoliData 365";
  }
  if (btnFollow) {
    paintFollow();
    btnFollow.addEventListener("click", () => {
      let arr = getFollows();
      if (arr.includes(c.id)) {
        arr = arr.filter((x) => x !== c.id);
        anunciar("Dejaste de seguir a este candidato (demostración).");
      } else {
        arr.push(c.id);
        anunciar("Ahora sigues a este candidato (demostración local).");
      }
      setFollows(arr);
      paintFollow();
    });
  }

  /* ---- Acciones de trazabilidad: lectura simple, exportar, compartir, reporte ---- */
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

  function csvFicha() {
    const filas = [
      ["Campo", "Valor", "Fuente"],
      ["Nombre", c.nombre, "JNE"],
      ["Partido", c.partido, "JNE"],
      ["Cargo", c.cargo, "JNE"],
      ["Región", c.region, "JNE"],
      ["Semáforo", sem.label, "Poder Judicial / Ministerio Público / Contraloría"],
      ["Educación", c.propuestas && c.propuestas.educacion, "Plan de gobierno"],
      ["Economía", c.propuestas && c.propuestas.economia, "Plan de gobierno"],
      ["Seguridad", c.propuestas && c.propuestas.seguridad, "Plan de gobierno"],
      ["Gasto total", c.financiamiento && c.financiamiento.gastoTotal, "ONPE"],
      ["Orientación ideológica", c.ideologia && c.ideologia.etiqueta, c.ideologia && c.ideologia.fuente],
      ["Última actualización", c.ultimaActualizacion, "PoliData"],
    ];
    return filas
      .map((fila) => fila.map((v) => `"${String(v || "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
  }

  const btnSimple = root.querySelector("#btnSimple");
  const btnExport = root.querySelector("#btnExport");
  const btnShare = root.querySelector("#btnShare");
  const btnPrint = root.querySelector("#btnPrint");
  const btnReportIA = root.querySelector("#btnReportIA");

  if (btnSimple) {
    btnSimple.addEventListener("click", () => {
      const simple = !root.classList.contains("is-simple-mode");
      root.classList.toggle("is-simple-mode", simple);
      root.querySelectorAll("[data-full-text][data-simple-text]").forEach((el) => {
        const next = simple ? el.dataset.simpleText : el.dataset.fullText;
        if (next) el.textContent = next;
      });
      btnSimple.textContent = simple ? "Ver texto completo" : "Modo lectura simple";
      anunciar(simple ? "Modo de lectura simplificada activado." : "Texto completo restaurado.");
    });
  }

  if (btnExport) {
    btnExport.addEventListener("click", () => {
      descargar("polidata-" + c.id + ".csv", csvFicha(), "text/csv;charset=utf-8");
      anunciar("Ficha exportada en CSV con fuentes.");
    });
  }

  if (btnShare) {
    btnShare.addEventListener("click", async () => {
      const url = location.href;
      try {
        if (navigator.share) {
          await navigator.share({ title: c.nombre + " · PoliData", url });
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(url);
          anunciar("Enlace de la ficha copiado al portapapeles.");
        } else {
          prompt("Copia este enlace para compartir la ficha:", url);
        }
      } catch (e) {
        anunciar("No se pudo completar la acción de compartir.");
      }
    });
  }

  if (btnPrint) {
    btnPrint.addEventListener("click", () => {
      anunciar("Abriendo el diálogo de impresión para guardar como PDF.");
      window.print();
    });
  }

  if (btnReportIA) {
    btnReportIA.addEventListener("click", () => {
      const REVIEW_KEY = "polidata_ai_review";
      let queue = [];
      try { queue = JSON.parse(localStorage.getItem(REVIEW_KEY) || "[]"); } catch (e) { queue = []; }
      queue.unshift({
        id: "rev-" + Date.now(),
        reportId: "profile-" + c.id,
        title: "Resumen IA de " + c.nombre,
        type: "Resumen de propuestas",
        candidateId: c.id,
        content: c.resumenIA,
        sources: ["JNE"].concat(c.fuentes || []).filter((v, i, arr) => arr.indexOf(v) === i),
        reason: "Usuario marcó posible imprecisión desde la ficha del candidato.",
        status: "Pendiente",
        correction: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      try { localStorage.setItem(REVIEW_KEY, JSON.stringify(queue)); } catch (e) { /* noop */ }
      anunciar("Reporte enviado a Administración IA para revisión.");
    });
  }
})(window);
