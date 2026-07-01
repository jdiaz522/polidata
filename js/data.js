/* =============================================================
   PoliData — Capa de datos compartida (data.js)
   -------------------------------------------------------------
   Fuente ÚNICA de datos ficticios de candidatos y helpers comunes.
   Se expone en window.PoliData para que el resto de scripts la reutilicen.
   Todos los datos son ficticios y con fines académicos.
   ============================================================= */
(function (global) {
  "use strict";

  /* -----------------------------------------------------------
     Catálogo de fuentes oficiales (para el footer / bloques)
  ----------------------------------------------------------- */
  const FUENTES_OFICIALES = [
    { abbr: "JNE", name: "Jurado Nacional de Elecciones", url: "https://jne.gob.pe/" },
    { abbr: "ONPE", name: "Oficina Nacional de Procesos Electorales", url: "https://www.onpe.gob.pe/" },
    { abbr: "Poder Judicial", name: "Poder Judicial del Perú", url: "https://www.pj.gob.pe/" },
    { abbr: "Ministerio Público", name: "Ministerio Público — Fiscalía de la Nación", url: "https://www.gob.pe/mpfn" },
    { abbr: "Contraloría", name: "Contraloría General de la República", url: "https://www.gob.pe/contraloria" },
    { abbr: "RENIEC", name: "Registro Nacional de Identificación y Estado Civil", url: "https://www.reniec.gob.pe/" },
    { abbr: "SUNAT", name: "Superintendencia Nacional de Aduanas y de Administración Tributaria", url: "https://www.sunat.gob.pe/" },
  ];

  const PREGUNTAS_AFINIDAD = [
    {
      id: "educacion",
      eje: "Educación",
      texto: "¿Qué enfoque educativo se acerca más a tus prioridades?",
      opciones: [
        { valor: "infraestructura", texto: "Mejorar infraestructura, conectividad y capacitación docente." },
        { valor: "becas", texto: "Impulsar becas, evaluación docente y alianzas público-privadas." },
        { valor: "tecnica", texto: "Priorizar educación técnica, digital y orientada al empleo." },
        { valor: "regional", texto: "Modernizar la educación con foco regional en ciencia y tecnología." },
      ],
    },
    {
      id: "economia",
      eje: "Economía",
      texto: "¿Qué medida económica te parece más relevante?",
      opciones: [
        { valor: "mypes", texto: "Formalización de MYPES, créditos y menos trámites." },
        { valor: "inversion", texto: "Estabilidad fiscal y atracción de inversión privada." },
        { valor: "empleo", texto: "Gasto público eficiente y reactivación con empleo juvenil." },
        { valor: "infraestructura", texto: "Infraestructura de agua, saneamiento y agroindustria regional." },
      ],
    },
    {
      id: "seguridad",
      eje: "Seguridad",
      texto: "¿Qué estrategia de seguridad apoyarías primero?",
      opciones: [
        { valor: "inteligencia", texto: "Inteligencia policial, videovigilancia y prevención comunitaria." },
        { valor: "prevencion", texto: "Prevención social del delito para jóvenes en riesgo." },
        { valor: "control", texto: "Endurecimiento de penas, control migratorio y fronteras." },
        { valor: "municipal", texto: "Prevención articulada con gobiernos locales y serenazgo." },
      ],
    },
    {
      id: "gobernanza",
      eje: "Gobernanza",
      texto: "¿Qué valor debería pesar más al evaluar una candidatura?",
      opciones: [
        { valor: "digitalizacion", texto: "Digitalización del Estado y reducción de burocracia." },
        { valor: "gestion", texto: "Experiencia de gestión y estabilidad administrativa." },
        { valor: "orden", texto: "Orden, cumplimiento de reglas y capacidad sancionadora." },
        { valor: "territorio", texto: "Gestión territorial y ejecución de proyectos locales." },
      ],
    },
  ];

  /* -----------------------------------------------------------
     Metadatos del semáforo de antecedentes
     (texto SIEMPRE acompaña al color: nunca solo color)
  ----------------------------------------------------------- */
  const SEMAFORO = {
    green: {
      key: "green",
      label: "Sin antecedentes",
      estado: "Sin antecedentes registrados",
      resumen: "No se registran procesos activos ni sentencias firmes en las fuentes consultadas.",
      detalle:
        "No se registran procesos judiciales, investigaciones fiscales ni sanciones firmes que inhabiliten o afecten el ejercicio del cargo público.",
      cls: "is-green",
      tagCls: "tag-green",
    },
    amber: {
      key: "amber",
      label: "Con observaciones",
      estado: "Procesos o investigaciones en curso",
      resumen: "Existen procesos en trámite. No implica responsabilidad ni condena.",
      detalle:
        "Existen procesos judiciales, investigaciones fiscales o administrativas en trámite. No implica responsabilidad ni condena: debe respetarse la presunción de inocencia.",
      cls: "is-amber",
      tagCls: "tag-amber",
    },
    red: {
      key: "red",
      label: "Con antecedentes",
      estado: "Sentencias firmes registradas",
      resumen: "Existen sentencias condenatorias firmes o impedimentos oficialmente registrados.",
      detalle:
        "Existen sentencias condenatorias firmes que generan inhabilitación o impedimento para ejercer cargo público.",
      cls: "is-red",
      tagCls: "tag-red",
    },
  };

  /* -----------------------------------------------------------
     Datos de candidatos (ficticios, académicos)
     -----------------------------------------------------------
     El color del semáforo NO se guarda: se calcula con
     calcularSemaforo(antecedentes) para mantener consistencia.
  ----------------------------------------------------------- */
  const CANDIDATOS = [
    {
      id: "c1",
      nombre: "Juan Pérez Gómez",
      iniciales: "JP",
      foto: null,
      partido: "Partido Democrático",
      cargo: "Candidato al Congreso de la República",
      region: "Lima Metropolitana",
      edad: 52,
      profesion: "Abogado",
      experiencia: "18 años en gestión pública",
      trayectoria:
        "Congresista de la República (2016–2021). Docente universitario en temas de derecho constitucional.",
      formacionAcademica: [
        "Bachiller en Derecho — Universidad Nacional Mayor de San Marcos.",
        "Maestría en Gestión Pública — Pontificia Universidad Católica del Perú.",
      ],
      planGobierno:
        "Propone fortalecer la seguridad ciudadana mediante mayor inversión en inteligencia policial y prevención comunitaria. Plantea mejorar la infraestructura educativa priorizando conectividad y formación docente. Además, impulsa la digitalización de servicios públicos para reducir la burocracia y promover la transparencia.",
      resumenIA:
        "El candidato prioriza seguridad ciudadana, educación con conectividad y digitalización del Estado para reducir trámites y aumentar la transparencia.",
      propuestas: {
        educacion:
          "Propone ampliar la inversión en educación pública, mejorar la infraestructura escolar y capacitar a docentes.",
        economia:
          "Impulsa la formalización de MYPES, el acceso a créditos y la reducción de trámites burocráticos.",
        seguridad:
          "Más policías en las calles, tecnología de videovigilancia y persecución efectiva del delito.",
      },
      financiamiento: {
        origenes: ["Donaciones privadas", "Aportes propios"],
        usos: ["Publicidad y propaganda", "Eventos y actividades", "Material gráfico y digital"],
        gastoTotal: "S/ 125,000",
      },
      antecedentes: [
        {
          tipo: "Proceso judicial",
          organo: "Poder Judicial",
          estado: "Archivado",
          fecha: "22/06/2021",
          descripcion: "Archivo definitivo por falta de elementos de convicción.",
          fuente: "Poder Judicial",
        },
        {
          tipo: "Sanción administrativa",
          organo: "Contraloría General",
          estado: "Sin sanciones",
          fecha: null,
          descripcion: "No registra sanciones firmes.",
          fuente: "Contraloría",
        },
      ],
      fuentes: ["JNE", "ONPE", "Poder Judicial", "RENIEC", "SUNAT"],
      ultimaActualizacion: "18/06/2026",
      lecturaSimple: {
        plan:
          "Su plan se concentra en tres ideas: más seguridad con tecnología e inteligencia policial, mejores colegios conectados a internet y un Estado con trámites más simples.",
        propuestas: {
          educacion: "Mejorar colegios públicos, conectividad y capacitación docente.",
          economia: "Ayudar a MYPES con créditos y menos burocracia.",
          seguridad: "Usar más inteligencia policial, cámaras y prevención en barrios.",
        },
      },
      afinidad: {
        educacion: "infraestructura",
        economia: "mypes",
        seguridad: "inteligencia",
        gobernanza: "digitalizacion",
      },
      ideologia: { valor: 42, etiqueta: "Centro reformista", fuente: "Plan de gobierno" },
      indicadores: { transparencia: 82, riesgo: 28, consistencia: 76, asistencia: 88 },
      autoridad365: {
        cargoElecto: "Congresista electo (simulación)",
        asistencia: "88%",
        votaciones: [
          { fecha: "05/06/2026", tema: "Reforma de seguridad ciudadana", voto: "A favor" },
          { fecha: "19/06/2026", tema: "Simplificación administrativa", voto: "A favor" },
        ],
        promesas: [
          { titulo: "Digitalizar trámites públicos", avance: 35, estado: "En progreso" },
          { titulo: "Programa de conectividad escolar", avance: 20, estado: "En diseño" },
        ],
        proyectos: ["Proyecto de ley de interoperabilidad estatal", "Mesa de seguridad barrial"],
      },
    },

    {
      id: "c2",
      nombre: "María López Rojas",
      iniciales: "ML",
      foto: null,
      partido: "Alianza Progreso",
      cargo: "Candidata al Congreso de la República",
      region: "Lima Metropolitana",
      edad: 45,
      profesion: "Economista",
      experiencia: "12 años en gestión pública y proyectos sociales",
      trayectoria:
        "Alcaldesa distrital (2019–2022). Economista con experiencia en proyectos sociales y desarrollo local.",
      formacionAcademica: [
        "Licenciada en Economía — Universidad del Pacífico.",
        "Diplomado en Gestión de Políticas Públicas — Universidad de Lima.",
      ],
      planGobierno:
        "Centra su propuesta en la estabilidad fiscal y la atracción de inversión privada. Promueve becas por mérito y alianzas público-privadas en educación, junto con programas sociales de prevención del delito orientados a jóvenes en riesgo.",
      resumenIA:
        "La candidata propone estabilidad fiscal, becas por mérito con alianzas público-privadas y prevención social del delito enfocada en jóvenes.",
      propuestas: {
        educacion:
          "Enfoca su propuesta en becas por mérito, alianzas público-privadas y evaluación de desempeño docente.",
        economia:
          "Promueve estabilidad fiscal, atracción de inversión privada y alivio tributario para empresas.",
        seguridad:
          "Inteligencia policial, prevención del delito y programas sociales para jóvenes en riesgo.",
      },
      financiamiento: {
        origenes: ["Aportes privados"],
        usos: ["Publicidad"],
        gastoTotal: "S/ 98,500",
      },
      antecedentes: [
        {
          tipo: "Investigación fiscal",
          organo: "Ministerio Público",
          estado: "En curso",
          fecha: "15/01/2024",
          descripcion: "Investigación preliminar por presunto delito contra la administración pública.",
          fuente: "Ministerio Público",
        },
      ],
      fuentes: ["JNE", "ONPE", "Ministerio Público", "RENIEC"],
      ultimaActualizacion: "17/06/2026",
      lecturaSimple: {
        plan:
          "Su propuesta se enfoca en cuidar las cuentas públicas, atraer inversión privada y usar becas para premiar el mérito estudiantil.",
        propuestas: {
          educacion: "Becas por mérito, alianzas con privados y evaluación docente.",
          economia: "Estabilidad fiscal, inversión privada y alivio tributario.",
          seguridad: "Prevención del delito con programas sociales para jóvenes.",
        },
      },
      afinidad: {
        educacion: "becas",
        economia: "inversion",
        seguridad: "prevencion",
        gobernanza: "gestion",
      },
      ideologia: { valor: 58, etiqueta: "Centro liberal", fuente: "Plan de gobierno" },
      indicadores: { transparencia: 74, riesgo: 52, consistencia: 70, asistencia: 81 },
      autoridad365: {
        cargoElecto: "Congresista electa (simulación)",
        asistencia: "81%",
        votaciones: [
          { fecha: "07/06/2026", tema: "Incentivos a inversión privada", voto: "A favor" },
          { fecha: "20/06/2026", tema: "Programa de becas regionales", voto: "A favor" },
        ],
        promesas: [
          { titulo: "Becas por mérito", avance: 45, estado: "En progreso" },
          { titulo: "Alivio tributario para empresas", avance: 18, estado: "En evaluación" },
        ],
        proyectos: ["Paquete de inversión privada", "Programa joven seguro"],
      },
    },

    {
      id: "c3",
      nombre: "Carlos Ramírez Silva",
      iniciales: "CR",
      foto: null,
      partido: "Frente Ciudadano",
      cargo: "Candidato al Congreso de la República",
      region: "Lima Metropolitana",
      edad: 49,
      profesion: "Empresario y dirigente social",
      experiencia: "Sin experiencia en cargos públicos de elección popular",
      trayectoria:
        "Empresario y dirigente social. Sin experiencia previa en cargos públicos de elección popular.",
      formacionAcademica: [
        "Bachiller en Administración de Empresas — Universidad de San Martín de Porres.",
      ],
      planGobierno:
        "Prioriza la educación técnica y digital vinculada al mercado laboral y al emprendimiento juvenil. Apuesta por el gasto público eficiente y la reactivación de sectores productivos, con énfasis en el endurecimiento de penas y el fortalecimiento de fronteras.",
      resumenIA:
        "El candidato propone educación técnica orientada al empleo, gasto público eficiente y una política de seguridad basada en mayor sanción y control fronterizo.",
      propuestas: {
        educacion:
          "Prioriza educación técnica y digital, vinculada al mercado laboral y al emprendimiento juvenil.",
        economia:
          "Apuesta por gasto público eficiente, reactivación de sectores productivos y empleo juvenil.",
        seguridad:
          "Endurecimiento de penas, control migratorio y fortalecimiento de fronteras.",
      },
      financiamiento: {
        origenes: ["Aportes propios"],
        usos: ["Movilización"],
        gastoTotal: "S/ 72,300",
      },
      antecedentes: [
        {
          tipo: "Proceso penal",
          organo: "Poder Judicial",
          estado: "Sentencia firme",
          fecha: "10/03/2020",
          descripcion: "Sentencia condenatoria firme por delito doloso con inhabilitación temporal.",
          fuente: "Poder Judicial",
        },
        {
          tipo: "Investigación fiscal",
          organo: "Ministerio Público",
          estado: "En curso",
          fecha: "03/09/2023",
          descripcion: "Investigación en trámite por presunto delito patrimonial.",
          fuente: "Ministerio Público",
        },
      ],
      fuentes: ["JNE", "ONPE", "Poder Judicial", "Ministerio Público"],
      ultimaActualizacion: "16/06/2026",
      lecturaSimple: {
        plan:
          "Su plan prioriza empleo juvenil, educación técnica y una respuesta de seguridad más dura frente al delito y el control fronterizo.",
        propuestas: {
          educacion: "Más formación técnica y digital vinculada al trabajo.",
          economia: "Reactivar sectores productivos y crear empleo juvenil.",
          seguridad: "Penas más duras, control migratorio y fronteras fortalecidas.",
        },
      },
      afinidad: {
        educacion: "tecnica",
        economia: "empleo",
        seguridad: "control",
        gobernanza: "orden",
      },
      ideologia: { valor: 72, etiqueta: "Derecha conservadora", fuente: "Plan de gobierno" },
      indicadores: { transparencia: 55, riesgo: 86, consistencia: 66, asistencia: 73 },
      autoridad365: {
        cargoElecto: "Congresista electo (simulación)",
        asistencia: "73%",
        votaciones: [
          { fecha: "03/06/2026", tema: "Control migratorio", voto: "A favor" },
          { fecha: "18/06/2026", tema: "Programa de empleo juvenil", voto: "Abstención" },
        ],
        promesas: [
          { titulo: "Fortalecer fronteras", avance: 28, estado: "En progreso" },
          { titulo: "Educación técnica digital", avance: 12, estado: "Pendiente" },
        ],
        proyectos: ["Ley de control fronterizo", "Plan de empleo juvenil"],
      },
    },

    {
      id: "c4",
      nombre: "Ana Torres Mendoza",
      iniciales: "AT",
      foto: null,
      partido: "Movimiento Regional Unido",
      cargo: "Candidata al Congreso de la República",
      region: "Arequipa",
      edad: 39,
      profesion: "Ingeniera civil",
      experiencia: "9 años en gestión de proyectos de infraestructura",
      // Campo intencionalmente nulo para demostrar "Información no disponible"
      trayectoria: null,
      formacionAcademica: [
        "Ingeniera Civil — Universidad Nacional de San Agustín de Arequipa.",
      ],
      planGobierno:
        "Propone un plan de infraestructura sostenible con énfasis en agua y saneamiento para zonas rurales, modernización educativa con foco en ciencias y tecnología, y seguridad basada en prevención y articulación con gobiernos locales.",
      resumenIA:
        "La candidata propone infraestructura sostenible (agua y saneamiento), educación con foco en ciencia y tecnología, y seguridad preventiva articulada con municipios.",
      propuestas: {
        educacion:
          "Modernización educativa con énfasis en ciencias, tecnología y formación técnica regional.",
        economia:
          "Inversión en infraestructura de agua y saneamiento y apoyo a la agroindustria regional.",
        seguridad:
          "Seguridad preventiva articulada con gobiernos locales y serenazgo coordinado.",
      },
      financiamiento: {
        origenes: ["Aportes propios", "Donaciones privadas"],
        usos: ["Material gráfico y digital", "Eventos y actividades"],
        gastoTotal: "S/ 54,000",
      },
      // Sin antecedentes registrados (lista vacía) → semáforo verde
      antecedentes: [],
      fuentes: ["JNE", "ONPE", "RENIEC"],
      ultimaActualizacion: "19/06/2026",
      lecturaSimple: {
        plan:
          "Su propuesta busca resolver problemas regionales: agua y saneamiento, educación con ciencia y tecnología, y seguridad preventiva con municipios.",
        propuestas: {
          educacion: "Educación moderna con ciencia, tecnología y formación técnica regional.",
          economia: "Inversión en agua, saneamiento y agroindustria de la región.",
          seguridad: "Prevención coordinada con municipios y serenazgo.",
        },
      },
      afinidad: {
        educacion: "regional",
        economia: "infraestructura",
        seguridad: "municipal",
        gobernanza: "territorio",
      },
      ideologia: { valor: 36, etiqueta: "Centro regionalista", fuente: "Plan de gobierno" },
      indicadores: { transparencia: 79, riesgo: 20, consistencia: 72, asistencia: 90 },
      autoridad365: {
        cargoElecto: "Congresista electa (simulación)",
        asistencia: "90%",
        votaciones: [
          { fecha: "06/06/2026", tema: "Agua y saneamiento rural", voto: "A favor" },
          { fecha: "22/06/2026", tema: "Fondo de infraestructura regional", voto: "A favor" },
        ],
        promesas: [
          { titulo: "Agua y saneamiento rural", avance: 38, estado: "En progreso" },
          { titulo: "Serenazgo coordinado", avance: 25, estado: "En diseño" },
        ],
        proyectos: ["Fondo regional de infraestructura", "Mesa municipal de seguridad"],
      },
    },
  ];

  /* -----------------------------------------------------------
     Helper: valor ausente → "Información no disponible"
  ----------------------------------------------------------- */
  function mostrarDato(valor) {
    if (valor === null || valor === undefined || valor === "") {
      return "Información no disponible";
    }
    return valor;
  }

  /* -----------------------------------------------------------
     Helper: escapado HTML para insertar texto de forma segura
  ----------------------------------------------------------- */
  function esc(valor) {
    const s = valor === null || valor === undefined ? "" : String(valor);
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /* -----------------------------------------------------------
     Regla del semáforo (única para todo el sitio)
     Prioridad: Rojo > Ámbar > Verde
  ----------------------------------------------------------- */
  function calcularSemaforo(antecedentes) {
    const lista = Array.isArray(antecedentes) ? antecedentes : [];

    // Rojo: sentencia firme / inhabilitación vigente
    const hayFirme = lista.some((a) => {
      const e = (a.estado || "").toLowerCase();
      return e.includes("sentencia firme") || e.includes("inhabilitaci");
    });
    if (hayFirme) return SEMAFORO.red;

    // Ámbar: proceso / investigación en curso
    const hayEnCurso = lista.some((a) => {
      const e = (a.estado || "").toLowerCase();
      return e.includes("en curso") || e.includes("trámite") || e.includes("tramite");
    });
    if (hayEnCurso) return SEMAFORO.amber;

    // Verde: ni firmes ni en curso (incluye lista vacía o solo archivados)
    return SEMAFORO.green;
  }

  /* -----------------------------------------------------------
     Helpers de acceso a candidatos
  ----------------------------------------------------------- */
  function getCandidatos() {
    return CANDIDATOS;
  }

  function getCandidato(id) {
    return CANDIDATOS.find((c) => c.id === id) || null;
  }

  function getFuente(abbr) {
    return FUENTES_OFICIALES.find((f) => f.abbr === abbr) || null;
  }

  function getPreguntasAfinidad() {
    return PREGUNTAS_AFINIDAD;
  }

  // Devuelve el objeto SEMAFORO correspondiente a un candidato
  function semaforoDe(candidato) {
    return calcularSemaforo(candidato ? candidato.antecedentes : []);
  }

  /* -----------------------------------------------------------
     Exposición global
  ----------------------------------------------------------- */
  global.PoliData = {
    CANDIDATOS,
    FUENTES_OFICIALES,
    PREGUNTAS_AFINIDAD,
    SEMAFORO,
    mostrarDato,
    esc,
    calcularSemaforo,
    getCandidatos,
    getCandidato,
    getFuente,
    getPreguntasAfinidad,
    semaforoDe,
  };
})(window);
