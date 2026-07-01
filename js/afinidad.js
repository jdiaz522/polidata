/* =============================================================
   PoliData — Test de afinidad política (HU-026, HU-027, HU-028)
   Calcula coincidencias por eje y muestra acuerdos/desacuerdos.
   ============================================================= */
(function (global) {
  "use strict";

  const PD = global.PoliData;
  const PC = global.PoliCommon;
  const root = document.getElementById("afinidadRoot");
  if (!root) return;

  const esc = PD.esc;
  const preguntas = PD.getPreguntasAfinidad();

  function preguntaHTML(q, idx) {
    const opciones = q.opciones
      .map(
        (op) => `
          <label class="quiz-option">
            <input type="radio" name="${esc(q.id)}" value="${esc(op.valor)}" />
            <span>${esc(op.texto)}</span>
          </label>`
      )
      .join("");

    return `
      <fieldset class="quiz-q">
        <legend>${idx + 1}. ${esc(q.texto)}</legend>
        <p class="q-axis">${esc(q.eje)}</p>
        <div class="quiz-options">${opciones}</div>
      </fieldset>`;
  }

  root.innerHTML = `
    <section class="card affinity-intro" aria-labelledby="affinity-title">
      <h2 id="affinity-title" class="card-title">Afinidad por propuestas</h2>
      <p>El cálculo compara tus respuestas con las posiciones declaradas de cada candidato en los ejes de educación, economía, seguridad y gobernanza. Es una guía de análisis, no una recomendación de voto.</p>
    </section>

    <form class="quiz" id="affinityForm" novalidate>
      ${preguntas.map(preguntaHTML).join("")}
      <div class="quiz-actions">
        <button type="submit" class="btn btn-primary">Calcular afinidad</button>
        <button type="button" class="btn btn-secondary" id="resetAffinity">Limpiar respuestas</button>
      </div>
      <p class="form-msg" id="affinityMsg" role="status" aria-live="polite"></p>
    </form>

    <section class="affinity-results" id="affinityResults" aria-live="polite" hidden></section>`;

  const form = root.querySelector("#affinityForm");
  const msg = root.querySelector("#affinityMsg");
  const results = root.querySelector("#affinityResults");
  const reset = root.querySelector("#resetAffinity");

  function respuestas() {
    const out = {};
    preguntas.forEach((q) => {
      const checked = form.querySelector(`input[name="${q.id}"]:checked`);
      if (checked) out[q.id] = checked.value;
    });
    return out;
  }

  function propuestaPorEje(c, eje) {
    if (eje === "gobernanza") return c.ideologia && c.ideologia.etiqueta;
    return c.propuestas && c.propuestas[eje];
  }

  function calcular(res) {
    return PD.getCandidatos()
      .map((c) => {
        const coincidencias = preguntas.filter((q) => c.afinidad && c.afinidad[q.id] === res[q.id]);
        const noCoinciden = preguntas.filter((q) => c.afinidad && c.afinidad[q.id] !== res[q.id]);
        const porcentaje = Math.round((coincidencias.length / preguntas.length) * 100);
        return { candidato: c, coincidencias, noCoinciden, porcentaje };
      })
      .sort((a, b) => b.porcentaje - a.porcentaje || a.candidato.nombre.localeCompare(b.candidato.nombre, "es"));
  }

  function resultCard(r, index) {
    const c = r.candidato;
    const matches = r.coincidencias.length
      ? r.coincidencias.map((q) => `<li><strong>${esc(q.eje)}:</strong> ${esc(propuestaPorEje(c, q.id))}</li>`).join("")
      : `<li>No hay coincidencias directas en los ejes respondidos.</li>`;
    const gaps = r.noCoinciden.length
      ? r.noCoinciden.map((q) => `<li><strong>${esc(q.eje)}:</strong> ${esc(propuestaPorEje(c, q.id))}</li>`).join("")
      : `<li>No se detectaron propuestas no coincidentes.</li>`;
    const sem = PD.semaforoDe(c);

    return `
      <article class="affinity-card ${index === 0 ? "is-top" : ""}">
        <div class="affinity-card-head">
          ${PC.avatarHTML(c, "avatar-md")}
          <div>
            <h3>${esc(c.nombre)}</h3>
            <p>${esc(c.partido)} · ${esc(c.region)}</p>
          </div>
          <strong class="affinity-score">${r.porcentaje}%</strong>
        </div>
        <div class="progress" aria-label="Afinidad ${r.porcentaje}%"><span style="width:${r.porcentaje}%"></span></div>
        <p><span class="status-tag ${sem.tagCls}"><span class="status-dot" aria-hidden="true"></span>${esc(sem.label)}</span></p>
        <div class="affinity-detail-grid">
          <div>
            <h4>Coincidencias</h4>
            <ul class="bullet-list">${matches}</ul>
          </div>
          <div>
            <h4>Para revisar críticamente</h4>
            <ul class="bullet-list">${gaps}</ul>
          </div>
        </div>
        <div class="dir-card-actions">
          <a class="btn btn-primary btn-sm" href="candidato.html?id=${encodeURIComponent(c.id)}">Ver ficha</a>
          <button type="button" class="btn btn-secondary btn-sm" data-compare="${esc(c.id)}">Agregar a comparación</button>
        </div>
      </article>`;
  }

  function renderResultados(lista) {
    results.hidden = false;
    results.innerHTML = `
      <header class="section-subhead">
        <h2>Resultados de afinidad</h2>
        <p>Ordenados de mayor a menor coincidencia con tus respuestas.</p>
      </header>
      <div class="affinity-grid">${lista.map(resultCard).join("")}</div>`;
    results.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const res = respuestas();
    const faltantes = preguntas.filter((q) => !res[q.id]);
    msg.classList.remove("error", "success");

    if (faltantes.length) {
      msg.textContent = "Completa las " + faltantes.length + " pregunta(s) pendiente(s) antes de ver resultados.";
      msg.classList.add("error");
      const first = form.querySelector(`input[name="${faltantes[0].id}"]`);
      if (first) first.focus();
      return;
    }

    msg.textContent = "Resultados calculados con datos de demostración.";
    msg.classList.add("success");
    renderResultados(calcular(res));
  });

  reset.addEventListener("click", () => {
    form.reset();
    msg.textContent = "";
    msg.classList.remove("error", "success");
    results.hidden = true;
    results.innerHTML = "";
  });

  results.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-compare]");
    if (!btn) return;
    const r = PC.addComparacion(btn.dataset.compare);
    msg.classList.remove("error", "success");
    if (r === "full") {
      msg.textContent = "Ya tienes el máximo de candidatos en comparación.";
      msg.classList.add("error");
    } else {
      msg.textContent = r === "dup" ? "Ese candidato ya estaba en comparación." : "Candidato agregado a comparación.";
      msg.classList.add("success");
    }
  });
})(window);
