# PoliData — Sitio web (demostración académica)

Sitio web **multipágina** de **PoliData**, la plataforma de transparencia electoral del Perú de la startup **ElectAnalysis**. Centraliza, simplifica y vuelve verificable la información electoral oficial (JNE, ONPE, Poder Judicial, Ministerio Público, Contraloría, RENIEC y SUNAT) para un voto informado.

Hecho con **HTML5, CSS3 y JavaScript Vanilla**. Sin frameworks, sin build, sin backend. Todos los datos son **ficticios y con fines académicos**.

---

## Cómo abrir

No necesita instalación ni servidor.

1. Descarga o copia esta carpeta.
2. Haz **doble clic** en `index.html`.

> Recomendado servir con un servidor local (para que `localStorage` y la navegación entre archivos funcionen sin restricciones del navegador):
> ```bash
> python -m http.server 8000   # luego visita http://localhost:8000
> ```
> O usa la extensión **Live Server** de VS Code.

---

## Estructura de archivos

```
polidata/
├── index.html            # Landing comercial e informativa
├── candidatos.html       # Directorio de candidatos
├── candidato.html        # Ficha del candidato (HU-010)  ?id=c1
├── comparar.html         # Comparador de candidatos (HU-020 + exportar/compartir)
├── afinidad.html         # Test de afinidad política (HU-026, HU-027, HU-028)
├── reportes.html         # Reportes, comparativos y tendencias IA (HU-062 a HU-066)
├── seguimiento.html      # PoliData 365 / seguimiento ciudadano (HU-029 a HU-037)
├── notificaciones.html   # Configuración e historial de alertas (HU-034 a HU-037)
├── admin.html            # Revisión administrativa de contenido IA (HU-067)
├── cuenta.html           # Registro, login, perfil y preferencias (HU-038, HU-040, HU-041, HU-042, HU-048)
├── antecedentes.html     # Semáforo de antecedentes (HU-022)  ?id=c1
├── css/
│   └── styles.css        # Estilos: landing + páginas de la app
├── js/
│   ├── data.js           # FUENTE ÚNICA de datos + helpers (semáforo, mostrarDato, esc)
│   ├── common.js         # Header/footer compartidos, buscador, comparación (localStorage)
│   ├── main.js           # Lógica solo de la landing
│   ├── candidatos.js     # Directorio
│   ├── candidato.js      # Ficha (HU-010)
│   ├── comparar.js       # Comparador y análisis (HU-020, HU-021, HU-023 a HU-025)
│   ├── afinidad.js       # Test de afinidad
│   ├── reportes.js       # Generación de reportes IA + reportar imprecisión
│   ├── seguimiento.js    # Seguimiento 365 + notificaciones locales
│   ├── notificaciones.js # Centro de alertas configurables
│   ├── admin.js          # Panel administrativo de revisión IA
│   ├── cuenta.js         # Sesión simulada, perfil y preferencias
│   └── antecedentes.js   # Semáforo (HU-022)
└── assets/
    └── images/           # (placeholder para imágenes; los avatares se generan con iniciales)
```

Los datos de candidatos viven **solo en `js/data.js`**. El color del semáforo no se guarda: se **calcula** con `calcularSemaforo()` para que todas las páginas sean consistentes.

---

## Páginas y cómo probarlas

### `index.html` — Landing
Hero, problema con estadísticas (con fuente), 8 funcionalidades, 3 tarjetas-preview con CTA a las herramientas, cómo funciona, metodología del semáforo (explicación estática), modelo de gobernanza propuesto, público objetivo, fuentes oficiales y lista de espera.
- **Lista de espera:** escribe un correo y envía → valida el formato en el navegador. Es una demostración: **no envía ni almacena nada**.

### `candidatos.html` — Directorio
- Busca por nombre/partido/cargo/región y filtra por **Región** y **Cargo**.
- **Ver perfil** → `candidato.html?id=…`.
- **Agregar a comparación** → guarda en `localStorage` (máx. 4, sin duplicados) y muestra la barra "Ir al comparador".

### `candidato.html?id=c1` — Ficha (HU-010)
- Encabezado con semáforo, navegación interna (Resumen / Hoja de vida / Propuestas / Antecedentes / Financiamiento) operable por teclado.
- Plan de gobierno con etiqueta **"Resumen generado por IA"** y aviso de que no reemplaza el documento oficial.
- Tabla resumida de antecedentes + **Ver detalle** → `antecedentes.html?id=…`.
- Columna lateral: datos clave, **Comparar este candidato**, **Seguir — PoliData 365** (cambia a "Siguiendo"), y fuentes.
- Prueba `?id=c4` para ver **"Información no disponible"** (trayectoria nula) y el caso sin antecedentes.
- Prueba `?id=zzz` para ver el estado de error **"Candidato no encontrado"**.

### `comparar.html` — Comparador (HU-020 y análisis)
- Carga 3 candidatos por defecto si no hay selección previa.
- Contador dinámico **2/4 · 3/4 · 4/4**; al llegar a 4 se deshabilita "Agregar candidato" → "Límite alcanzado".
- **Agregar candidato** abre un modal accesible (cierra con botón, Escape o clic exterior) que solo muestra candidatos no seleccionados.
- Retira candidatos con la **✕**.
- **Comparar por eje temático** filtra las filas visibles.
- Incluye orientación ideológica, indicadores de análisis, exportación CSV, enlace compartible y reporte imprimible/PDF.
- Tabla generada dinámicamente; en móvil se desplaza horizontalmente.

### `afinidad.html` — Test de afinidad (HU-026, HU-027, HU-028)
- Preguntas neutrales por educación, economía, seguridad y gobernanza.
- Valida que el test esté completo antes de calcular.
- Muestra porcentaje de afinidad por candidato, coincidencias y propuestas no coincidentes.

### `reportes.html` — Reportes IA (HU-062, HU-063, HU-064, HU-065, HU-066)
- Genera reportes de candidato, análisis comparativo y tendencias/estadísticas con datos de demostración.
- Cada reporte incluye aviso de contenido IA, confianza estimada, hallazgos, riesgos y trazabilidad de fuentes.
- Permite descargar JSON, copiar resumen y reportar una posible imprecisión al panel administrativo.

### `admin.html` — Administración IA (HU-067)
- Crea una cuenta administradora demo si no hay sesión con rol admin.
- Muestra cola de revisión, métricas por estado, fuentes usadas, contenido reportado y motivo de revisión.
- Permite validar, corregir, rechazar o reabrir contenido IA, guardando la bitácora en `localStorage`.

### `seguimiento.html` — PoliData 365 (HU-029 a HU-037)
- Usa los candidatos seguidos desde la ficha y guarda el estado en `localStorage`.
- Muestra asistencia, votaciones, avance de promesas, acciones/proyectos e historial filtrado por preferencias de notificación.

### `notificaciones.html` — Centro de notificaciones (HU-034 a HU-037)
- Requiere una cuenta simulada para configurar alertas.
- Permite activar/desactivar actualizaciones, candidatos seguidos, promesas, votaciones, resumen semanal y canales app/correo.
- Incluye historial, contador de no leídas, marcar como leídas y simulación de nueva alerta.

### `cuenta.html` — Cuenta y preferencias (HU-038, HU-040, HU-041, HU-042, HU-048)
- Registro de usuario lector, inicio de sesión, cierre de sesión y recuperación simulada.
- Perfil editable con rol de uso, región principal, temas de interés y preferencias de notificación.
- Todo se guarda en `localStorage`; no usar contraseñas reales porque es una demostración sin backend.

### `antecedentes.html?id=c1` — Semáforo (HU-022)
- Volver a la ficha, resumen del candidato, semáforo con el **estado calculado** resaltado.
- Significado de los tres colores y tabla de detalle (cada estado con **color + texto**, nunca solo color) con su fuente.
- **Ver metodología completa** → sección de metodología de la landing.

---

## Regla del semáforo (única para todo el sitio)

```
Prioridad: Rojo > Ámbar > Verde
```
- **Rojo:** existe una sentencia firme o inhabilitación.
- **Ámbar:** existe un proceso/investigación en curso (no implica condena; presunción de inocencia).
- **Verde:** no hay procesos activos ni firmes (incluye archivados o sin antecedentes).

La misma función (`calcularSemaforo` en `data.js`) se usa en el directorio, la ficha, el comparador y la página de antecedentes.

---

## Accesibilidad y responsive

- HTML semántico, un solo `<h1>` por página, jerarquía de títulos, `<th>` en tablas.
- `aria-label` en botones de ícono, `aria-current` en navegación activa, `aria-expanded` en menús/modal, `aria-live` en avisos.
- El color nunca es la única señal: el semáforo siempre lleva texto.
- Foco visible, navegación por teclado, foco atrapado en el modal, respeto a `prefers-reduced-motion`.
- Mobile-first; probado en 360 / 768 / 1024 / 1440 px. Tablas con `overflow-x: auto` y sin desbordamiento horizontal de página.

---

## Limitaciones (por no existir backend)

- No hay base de datos, backend, pagos reales, IA real ni envío de correos: todo se simula en el cliente.
- Los "resúmenes con IA" y reportes IA son textos de ejemplo, no generados por un modelo.
- La selección de comparación y el "seguir" se guardan solo en `localStorage` del navegador.
- No se incluyen números de expediente ni URLs específicas: cuando no hay URL real, se muestra el nombre de la institución sin enlace.

---

ElectAnalysis © 2026 · PoliData. Cada dato cita su fuente oficial. Demostración académica con datos ficticios.
