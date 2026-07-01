/* =============================================================
   PoliData — Detalle del semáforo de antecedentes (antecedentes.js) · HU-022
   Lee ?id=, calcula el estado con la regla única, pinta el
   semáforo (color + texto), el significado de colores y la tabla.
   ============================================================= */
(function (global) {
  "use strict";

  const PD = global.PoliData;

  const root = document.getElementById("antecedentesRoot");
  if (!root) return;

  const md = PD.mostrarDato;
  const esc = PD.esc;

  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const c = PD.getCandidato(id);

  /* ---- Estado de error ---- */
  if (!c) {
    root.innerHTML = `
      <section class="state-empty" role="alert">
        <h1>Candidato no encontrado</h1>
        <p>No pudimos encontrar el candidato solicitado para mostrar sus antecedentes.</p>
        <a class="btn btn-primary" href="candidatos.html">Volver a Explorar candidatos</a>
      </section>`;
    document.title = "Antecedentes no disponibles · PoliData";
    return;
  }

  const sem = PD.semaforoDe(c); // regla única
  document.title = "Antecedentes de " + c.nombre + " · PoliData";

  /* ---- Mapear estado individual a color (con texto siempre) ---- */
  function estadoToSem(estado) {
    const e = (estado || "").toLowerCase();
    if (e.includes("sentencia firme") || e.includes("inhabilitaci")) return PD.SEMAFORO.red;
    if (e.includes("en curso") || e.includes("trámite") || e.includes("tramite")) return PD.SEMAFORO.amber;
    if (e.includes("archivado") || e.includes("sin sanciones")) return PD.SEMAFORO.green;
    return null; // estado neutro / no disponible
  }

  /* ---- Tres luces del semáforo (resalta la activa) ---- */
  function lucesHTML() {
    const niveles = [
      { key: "green", titulo: "Sin antecedentes" },
      { key: "amber", titulo: "En observación" },
      { key: "red", titulo: "Con antecedentes" },
    ];
    return niveles
      .map((n) => {
        const activo = sem.key === n.key;
        return `<div class="sem-light sem-${n.key} ${activo ? "active" : ""}" ${activo ? 'aria-current="true"' : ""}>
            <span class="sem-light-dot" aria-hidden="true"></span>
            <span class="sem-light-label">${esc(n.titulo)}</span>
          </div>`;
      })
      .join("");
  }

  /* ---- Significado de cada color ---- */
  function significadoHTML() {
    const filas = [
      { sem: PD.SEMAFORO.green, nombre: "Verde", corto: "Sin antecedentes registrados" },
      { sem: PD.SEMAFORO.amber, nombre: "Ámbar", corto: "Procesos o investigaciones en curso" },
      { sem: PD.SEMAFORO.red, nombre: "Rojo", corto: "Sentencias firmes" },
    ];
    return filas
      .map(
        (f) => `<li class="meaning-row">
          <span class="meaning-dot ${f.sem.tagCls}" aria-hidden="true"></span>
          <span class="meaning-name">${esc(f.nombre)}</span>
          <span class="meaning-short">${esc(f.corto)}</span>
          <span class="meaning-desc">${esc(f.sem.detalle)}</span>
        </li>`
      )
      .join("");
  }

  /* ---- Tabla de detalle ---- */
  function tablaHTML() {
    const lista = c.antecedentes || [];
    if (!lista.length) {
      return `<tr><td colspan="6" class="td-empty">No se registran antecedentes en las fuentes consultadas.</td></tr>`;
    }
    return lista
      .map((a) => {
        const s = estadoToSem(a.estado);
        const estadoCell = s
          ? `<span class="status-tag ${s.tagCls}"><span class="status-dot" aria-hidden="true"></span>${esc(md(a.estado))}</span>`
          : `<span class="status-tag tag-neutral">${esc(md(a.estado))}</span>`;
        return `<tr>
          <td>${esc(md(a.tipo))}</td>
          <td>${esc(md(a.organo))}</td>
          <td>${estadoCell}</td>
          <td>${esc(md(a.fecha))}</td>
          <td>${esc(md(a.descripcion))}</td>
          <td>${esc(md(a.fuente))}</td>
        </tr>`;
      })
      .join("");
  }

  /* ---- Render principal ---- */
  root.innerHTML = `
    <nav class="breadcrumb" aria-label="Ruta de navegación">
      <a href="candidato.html?id=${encodeURIComponent(c.id)}">← Volver a la ficha del candidato</a>
    </nav>

    <!-- Resumen + semáforo -->
    <header class="card ant-head">
      <div class="ant-head-profile">
        <span class="avatar avatar-xl" aria-hidden="true">${esc(c.iniciales || "")}</span>
        <div>
          <h1>${esc(c.nombre)}</h1>
          <p class="profile-line">${esc(md(c.partido))}</p>
          <p class="profile-line">${esc(md(c.cargo))}</p>
          <p class="profile-line">${esc(md(c.region))}</p>
        </div>
      </div>

      <div class="ant-head-sem">
        <h2 class="sem-title">Semáforo de antecedentes</h2>
        <div class="sem-lights" role="img" aria-label="Semáforo de antecedentes: estado ${esc(sem.estado)}">
          ${lucesHTML()}
        </div>
        <p class="sem-estado">Estado: <strong class="sem-estado-text ${sem.cls}">${esc(sem.estado)}</strong></p>
      </div>
    </header>

    <!-- Significado de los colores -->
    <section class="card ant-meaning" aria-labelledby="h-significado">
      <h2 id="h-significado" class="card-title">¿Qué significa cada color?</h2>
      <ul class="meaning-list">${significadoHTML()}</ul>
      <p class="ant-note" role="note">El ámbar informa, no condena: debe respetarse la presunción de inocencia. Un proceso archivado no genera por sí solo estado ámbar ni rojo.</p>
    </section>

    <!-- Detalle de antecedentes -->
    <section class="card ant-detail" aria-labelledby="h-detalle">
      <h2 id="h-detalle" class="card-title">Detalle de antecedentes</h2>
      <div class="table-scroll" tabindex="0" role="region" aria-label="Tabla de detalle de antecedentes (desplazable horizontalmente)">
        <table class="data-table">
          <thead>
            <tr>
              <th scope="col">Tipo de proceso</th>
              <th scope="col">Órgano / Entidad</th>
              <th scope="col">Estado</th>
              <th scope="col">Fecha</th>
              <th scope="col">Descripción breve</th>
              <th scope="col">Fuente oficial</th>
            </tr>
          </thead>
          <tbody>${tablaHTML()}</tbody>
        </table>
      </div>
      <p class="scroll-hint" aria-hidden="true">↔ Desliza horizontalmente para ver toda la tabla</p>
      <div class="ant-method">
        <a class="btn btn-secondary" href="index.html#metodologia">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4h11l5 5v11H4Z"></path><path d="M14 4v5h5"></path></svg>
          Ver metodología completa
        </a>
        <p class="ant-method-note">Conoce los criterios, fuentes y ponderaciones usadas para el semáforo.</p>
      </div>
    </section>`;
})(window);
