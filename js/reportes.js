/* =============================================================
   PoliData — Reportes y análisis con IA (HU-062 a HU-066)
   Genera contenido determinístico de demo con trazabilidad.
   ============================================================= */
(function (global) {
  "use strict";

  const PD = global.PoliData;
  const PC = global.PoliCommon;
  const root = document.getElementById("reportesRoot");
  if (!root) return;

  const esc = PD.esc;
  const REPORTS_KEY = "polidata_ai_reports";
  const REVIEW_KEY = "polidata_ai_review";

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

  function fuenteLabel(abbr) {
    const f = PD.getFuente(abbr);
    return f ? `${f.abbr} — ${f.name}` : abbr;
  }

  function candidateOptions() {
    return PD.getCandidatos()
      .map((c) => `<option value="${esc(c.id)}">${esc(c.nombre)} · ${esc(c.region)}</option>`)
      .join("");
  }

  function selectedComparison() {
    const ids = PC.getComparacion();
    return (ids.length ? ids : ["c1", "c2", "c3"]).map((id) => PD.getCandidato(id)).filter(Boolean);
  }

  function scoreLabel(value) {
    if (value >= 80) return "alto";
    if (value >= 60) return "medio";
    return "bajo";
  }

  function buildCandidateReport(c) {
    const sem = PD.semaforoDe(c);
    const ind = c.indicadores || {};
    return {
      title: "Reporte electoral de " + c.nombre,
      type: "Reporte de candidato",
      candidateId: c.id,
      confidence: 86,
      summary:
        `${c.nombre} postula por ${c.region} con una agenda centrada en ${c.resumenIA}. ` +
        `El semáforo registra estado "${sem.label}" y su transparencia de datos es ${ind.transparencia}/100 (${scoreLabel(ind.transparencia || 0)}).`,
      findings: [
        `Propuesta educativa: ${PD.mostrarDato(c.propuestas && c.propuestas.educacion)}`,
        `Propuesta económica: ${PD.mostrarDato(c.propuestas && c.propuestas.economia)}`,
        `Propuesta de seguridad: ${PD.mostrarDato(c.propuestas && c.propuestas.seguridad)}`,
        `Financiamiento declarado: ${PD.mostrarDato(c.financiamiento && c.financiamiento.gastoTotal)}.`,
      ],
      risks: [
        sem.key === "red" ? "Registra sentencia firme o inhabilitación según las fuentes consultadas." : "No se detecta sentencia firme en el resumen del semáforo.",
        sem.key === "amber" ? "Tiene procesos en curso; no implica condena y debe respetarse la presunción de inocencia." : "No se detectan procesos activos que eleven el estado a ámbar.",
      ],
      sources: ["JNE", "ONPE"].concat(c.fuentes || []).filter((v, i, arr) => arr.indexOf(v) === i),
    };
  }

  function buildCompareReport(candidates) {
    const names = candidates.map((c) => c.nombre).join(", ");
    const bestTransparency = candidates.slice().sort((a, b) => ((b.indicadores || {}).transparencia || 0) - ((a.indicadores || {}).transparencia || 0))[0];
    const highestRisk = candidates.slice().sort((a, b) => ((b.indicadores || {}).riesgo || 0) - ((a.indicadores || {}).riesgo || 0))[0];
    return {
      title: "Análisis comparativo de candidatos",
      type: "Análisis comparativo",
      candidateId: candidates[0] && candidates[0].id,
      confidence: 82,
      summary:
        `Comparación generada para ${names}. El perfil con mayor transparencia es ${bestTransparency.nombre}, ` +
        `mientras que el mayor riesgo de antecedentes aparece en ${highestRisk.nombre}.`,
      findings: candidates.map((c) => {
        const sem = PD.semaforoDe(c);
        return `${c.nombre}: ${sem.label}; ${PD.mostrarDato(c.ideologia && c.ideologia.etiqueta)}; gasto ${PD.mostrarDato(c.financiamiento && c.financiamiento.gastoTotal)}.`;
      }),
      risks: [
        "La comparación resume ejes declarados; no reemplaza la revisión del plan oficial completo.",
        "Los indicadores son de demostración y deben validarse con fuentes oficiales antes de una publicación real.",
      ],
      sources: ["JNE", "ONPE", "Poder Judicial", "Ministerio Público", "Contraloría"],
    };
  }

  function buildTrendReport() {
    const candidates = PD.getCandidatos();
    const byRegion = candidates.reduce((acc, c) => {
      acc[c.region] = (acc[c.region] || 0) + 1;
      return acc;
    }, {});
    const amberRed = candidates.filter((c) => ["amber", "red"].includes(PD.semaforoDe(c).key)).length;
    const avgTransparency = Math.round(candidates.reduce((sum, c) => sum + ((c.indicadores || {}).transparencia || 0), 0) / candidates.length);
    return {
      title: "Tendencias electorales de demostración",
      type: "Tendencias y estadísticas",
      candidateId: null,
      confidence: 78,
      summary:
        `El dataset de demostración contiene ${candidates.length} candidaturas en ${Object.keys(byRegion).length} regiones. ` +
        `${amberRed} perfiles presentan observaciones o antecedentes y la transparencia promedio es ${avgTransparency}/100.`,
      findings: Object.keys(byRegion).map((region) => `${region}: ${byRegion[region]} candidatura(s) registradas.`),
      risks: [
        "La muestra es ficticia y pequeña; las tendencias solo ilustran el comportamiento esperado del producto.",
        "Una versión productiva requeriría sincronización oficial y auditoría de consistencia.",
      ],
      sources: ["JNE", "ONPE", "Poder Judicial", "Ministerio Público", "Contraloría", "RENIEC"],
    };
  }

  function persistReport(report) {
    const reports = getJSON(REPORTS_KEY, []);
    const stored = Object.assign({
      id: "air-" + Date.now(),
      createdAt: new Date().toISOString(),
      status: "Generado",
    }, report);
    reports.unshift(stored);
    setJSON(REPORTS_KEY, reports.slice(0, 12));
    return stored;
  }

  function renderReport(report) {
    const sources = report.sources.map((s) => `<li>${esc(fuenteLabel(s))}</li>`).join("");
    const findings = report.findings.map((x) => `<li>${esc(x)}</li>`).join("");
    const risks = report.risks.map((x) => `<li>${esc(x)}</li>`).join("");
    return `
      <article class="ai-report card" data-report-id="${esc(report.id)}">
        <header class="ai-report-head">
          <div>
            <span class="ia-badge">Contenido generado por IA</span>
            <h2>${esc(report.title)}</h2>
            <p>${esc(report.type)} · Confianza estimada: ${esc(report.confidence)}%</p>
          </div>
          <div class="ai-score" aria-label="Confianza estimada ${esc(report.confidence)} por ciento">${esc(report.confidence)}%</div>
        </header>
        <section>
          <h3 class="subhead">Síntesis</h3>
          <p>${esc(report.summary)}</p>
        </section>
        <div class="ai-report-grid">
          <section>
            <h3 class="subhead">Hallazgos</h3>
            <ul class="bullet-list">${findings}</ul>
          </section>
          <section>
            <h3 class="subhead">Riesgos o límites</h3>
            <ul class="bullet-list">${risks}</ul>
          </section>
          <section>
            <h3 class="subhead">Trazabilidad de fuentes</h3>
            <ul class="bullet-list">${sources}</ul>
          </section>
        </div>
        <footer class="ai-report-actions">
          <button type="button" class="btn btn-secondary btn-sm" data-export="${esc(report.id)}">Descargar JSON</button>
          <button type="button" class="btn btn-secondary btn-sm" data-copy="${esc(report.id)}">Copiar resumen</button>
          <button type="button" class="btn btn-secondary btn-sm" data-report="${esc(report.id)}">Reportar imprecisión</button>
        </footer>
      </article>`;
  }

  function renderHistory() {
    const reports = getJSON(REPORTS_KEY, []);
    if (!reports.length) return `<p class="td-empty">Aún no hay reportes generados en esta sesión.</p>`;
    return reports.map((r) => `
      <li class="report-history-item">
        <span>${esc(r.type)}</span>
        <strong>${esc(r.title)}</strong>
        <small>${esc(new Date(r.createdAt).toLocaleString("es-PE"))}</small>
      </li>`).join("");
  }

  root.innerHTML = `
    <section class="ai-workbench">
      <form class="card ai-generator" id="reportForm" novalidate>
        <h2 class="card-title-sm">Generador de reportes</h2>
        <label>Tipo de análisis
          <select name="tipo" id="reportType">
            <option value="candidato">Reporte de candidato</option>
            <option value="comparativo">Análisis comparativo</option>
            <option value="tendencias">Tendencias y estadísticas</option>
          </select>
        </label>
        <label id="candidatePick">Candidato
          <select name="candidato">${candidateOptions()}</select>
        </label>
        <fieldset class="source-checks">
          <legend>Fuentes incluidas</legend>
          <label class="check-row"><input type="checkbox" checked disabled /><span>JNE</span></label>
          <label class="check-row"><input type="checkbox" checked disabled /><span>ONPE</span></label>
          <label class="check-row"><input type="checkbox" checked disabled /><span>Poder Judicial / Ministerio Público</span></label>
        </fieldset>
        <button type="submit" class="btn btn-primary">Generar reporte IA</button>
        <p class="form-msg" id="reportMsg" role="status" aria-live="polite"></p>
      </form>

      <aside class="card">
        <h2 class="card-title-sm">Historial local</h2>
        <ul class="report-history" id="reportHistory">${renderHistory()}</ul>
      </aside>
    </section>

    <section id="reportOutput" aria-live="polite"></section>`;

  const form = document.getElementById("reportForm");
  const output = document.getElementById("reportOutput");
  const history = document.getElementById("reportHistory");
  const msg = document.getElementById("reportMsg");
  const typeSelect = document.getElementById("reportType");
  const candidatePick = document.getElementById("candidatePick");

  function announce(text, ok) {
    msg.textContent = text;
    msg.classList.toggle("success", !!ok);
    msg.classList.toggle("error", !ok);
  }

  function currentReport(id) {
    return getJSON(REPORTS_KEY, []).find((r) => r.id === id) || null;
  }

  function download(name, content) {
    const blob = new Blob([content], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  typeSelect.addEventListener("change", () => {
    candidatePick.hidden = typeSelect.value !== "candidato";
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    let report;
    if (data.tipo === "comparativo") report = buildCompareReport(selectedComparison());
    else if (data.tipo === "tendencias") report = buildTrendReport();
    else report = buildCandidateReport(PD.getCandidato(data.candidato) || PD.getCandidatos()[0]);

    const stored = persistReport(report);
    output.innerHTML = renderReport(stored);
    history.innerHTML = renderHistory();
    announce("Reporte generado con trazabilidad de fuentes.", true);
  });

  output.addEventListener("click", async (e) => {
    const exportBtn = e.target.closest("[data-export]");
    const copyBtn = e.target.closest("[data-copy]");
    const reportBtn = e.target.closest("[data-report]");
    let id = null;
    if (exportBtn) id = exportBtn.dataset.export;
    else if (copyBtn) id = copyBtn.dataset.copy;
    else if (reportBtn) id = reportBtn.dataset.report;
    const report = id ? currentReport(id) : null;
    if (!report) return;

    if (exportBtn) {
      download("polidata-reporte-ia.json", JSON.stringify(report, null, 2));
      announce("Reporte descargado en JSON.", true);
      return;
    }
    if (copyBtn) {
      try {
        await navigator.clipboard.writeText(report.summary);
        announce("Resumen copiado al portapapeles.", true);
      } catch (err) {
        announce("No se pudo copiar automáticamente.", false);
      }
      return;
    }
    if (reportBtn) {
      const queue = getJSON(REVIEW_KEY, []);
      queue.unshift({
        id: "rev-" + Date.now(),
        reportId: report.id,
        title: report.title,
        type: report.type,
        candidateId: report.candidateId,
        content: report.summary,
        sources: report.sources,
        reason: "Usuario marcó posible imprecisión desde Reportes IA.",
        status: "Pendiente",
        correction: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setJSON(REVIEW_KEY, queue);
      announce("Reporte enviado al panel administrativo para revisión.", true);
    }
  });
})(window);
