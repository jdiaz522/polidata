/* =============================================================
   PoliData — Cuenta, perfil y preferencias (HU-038, HU-040,
   HU-041, HU-042, HU-048 + base para notificaciones)
   ============================================================= */
(function (global) {
  "use strict";

  const PD = global.PoliData;
  const PC = global.PoliCommon;
  const root = document.getElementById("cuentaRoot");
  if (!root) return;

  const esc = PD.esc;
  const REGIONES = ["Lima Metropolitana", "Arequipa", "La Libertad", "Cusco", "Piura"];
  const INTERESES = ["Educación", "Economía", "Seguridad", "Gobernanza", "Financiamiento", "Antecedentes"];
  const DEFAULT_NOTIF = {
    actualizaciones: true,
    candidatosSeguidos: true,
    promesas: true,
    votaciones: true,
    resumenSemanal: false,
    canalApp: true,
    canalEmail: false,
  };

  function defaultUser(data) {
    return {
      nombre: data.nombre || "",
      email: data.email || "",
      password: data.password || "",
      rol: data.rol || "Votante",
      region: data.region || "",
      intereses: data.intereses || ["Educación", "Seguridad"],
      notificaciones: Object.assign({}, DEFAULT_NOTIF, data.notificaciones || {}),
      creado: data.creado || new Date().toISOString(),
    };
  }

  function findUser(email) {
    return PC.getUsers().find((u) => u.email.toLowerCase() === String(email).toLowerCase()) || null;
  }

  function upsertUser(next) {
    const users = PC.getUsers();
    const idx = users.findIndex((u) => u.email === next.email);
    if (idx >= 0) users[idx] = next;
    else users.push(next);
    PC.saveUsers(users);
  }

  function checked(value) {
    return value ? "checked" : "";
  }

  function options(values, selected, placeholder) {
    return `<option value="">${esc(placeholder)}</option>` +
      values.map((v) => `<option value="${esc(v)}"${v === selected ? " selected" : ""}>${esc(v)}</option>`).join("");
  }

  function checkboxList(name, values, selected) {
    return values.map((v) => `
      <label class="check-row">
        <input type="checkbox" name="${esc(name)}" value="${esc(v)}" ${checked((selected || []).includes(v))} />
        <span>${esc(v)}</span>
      </label>`).join("");
  }

  function renderGuest() {
    root.innerHTML = `
      <div class="account-grid">
        <section class="card account-card" aria-labelledby="login-title">
          <h2 id="login-title" class="card-title-sm">Iniciar sesión</h2>
          <form id="loginForm" class="account-form" novalidate>
            <label>Correo electrónico
              <input type="email" name="email" autocomplete="email" required placeholder="tu@correo.com" />
            </label>
            <label>Contraseña
              <input type="password" name="password" autocomplete="current-password" required placeholder="Mínimo 6 caracteres" />
            </label>
            <button type="submit" class="btn btn-primary">Ingresar</button>
            <button type="button" class="link-button" id="recoverBtn">Recuperar contraseña</button>
          </form>
        </section>

        <section class="card account-card" aria-labelledby="register-title">
          <h2 id="register-title" class="card-title-sm">Registro de usuario lector</h2>
          <form id="registerForm" class="account-form" novalidate>
            <label>Nombre
              <input type="text" name="nombre" autocomplete="name" required placeholder="Nombre y apellido" />
            </label>
            <label>Correo electrónico
              <input type="email" name="email" autocomplete="email" required placeholder="tu@correo.com" />
            </label>
            <label>Contraseña
              <input type="password" name="password" autocomplete="new-password" required placeholder="Mínimo 6 caracteres" />
            </label>
            <label>Región principal
              <select name="region">${options(REGIONES, "", "Selecciona una región")}</select>
            </label>
            <button type="submit" class="btn btn-primary">Crear cuenta</button>
          </form>
        </section>
      </div>

      <section class="card account-note">
        <h2 class="card-title-sm">Seguridad de la demo</h2>
        <p>Esta autenticación es simulada y se guarda solo en tu navegador con <code>localStorage</code>. No uses contraseñas reales.</p>
        <button type="button" class="btn btn-secondary btn-sm" id="demoAccount">Crear cuenta demo</button>
      </section>

      <p class="form-msg account-msg" id="accountMsg" role="status" aria-live="polite"></p>`;
  }

  function renderUser(user) {
    const notif = Object.assign({}, DEFAULT_NOTIF, user.notificaciones || {});
    root.innerHTML = `
      <section class="account-summary card">
        <div class="account-avatar" aria-hidden="true">${esc((user.nombre || user.email).split(/\s+/).slice(0, 2).map((p) => p.charAt(0)).join("").toUpperCase() || "U")}</div>
        <div>
          <h2>${esc(user.nombre || "Usuario PoliData")}</h2>
          <p>${esc(user.email)} · ${esc(user.rol || "Votante")}</p>
          <span class="status-tag tag-green"><span class="status-dot" aria-hidden="true"></span>Sesión activa</span>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" id="logoutBtn">Cerrar sesión</button>
      </section>

      <form id="profileForm" class="account-layout" novalidate>
        <section class="card">
          <h2 class="card-title-sm">Perfil y preferencias</h2>
          <div class="account-form">
            <label>Nombre
              <input type="text" name="nombre" value="${esc(user.nombre)}" required />
            </label>
            <label>Correo
              <input type="email" name="email" value="${esc(user.email)}" disabled />
            </label>
            <label>Rol de uso
              <select name="rol">
                ${options(["Votante", "Docente", "Periodista", "Investigador", "ONG"], user.rol, "Selecciona un rol")}
              </select>
            </label>
            <label>Región principal
              <select name="region">${options(REGIONES, user.region, "Selecciona una región")}</select>
            </label>
          </div>
          <h3 class="subhead">Temas de interés</h3>
          <div class="check-grid">${checkboxList("intereses", INTERESES, user.intereses)}</div>
        </section>

        <section class="card">
          <h2 class="card-title-sm">Preferencias de notificación</h2>
          <div class="check-grid">
            <label class="check-row"><input type="checkbox" name="actualizaciones" ${checked(notif.actualizaciones)} /><span>Actualizaciones de fichas y fuentes</span></label>
            <label class="check-row"><input type="checkbox" name="candidatosSeguidos" ${checked(notif.candidatosSeguidos)} /><span>Novedades de candidatos seguidos</span></label>
            <label class="check-row"><input type="checkbox" name="promesas" ${checked(notif.promesas)} /><span>Avance de promesas de campaña</span></label>
            <label class="check-row"><input type="checkbox" name="votaciones" ${checked(notif.votaciones)} /><span>Votaciones relevantes</span></label>
            <label class="check-row"><input type="checkbox" name="resumenSemanal" ${checked(notif.resumenSemanal)} /><span>Resumen semanal</span></label>
            <label class="check-row"><input type="checkbox" name="canalApp" ${checked(notif.canalApp)} /><span>Canal app</span></label>
            <label class="check-row"><input type="checkbox" name="canalEmail" ${checked(notif.canalEmail)} /><span>Canal correo</span></label>
          </div>
          <div class="account-actions">
            <button type="submit" class="btn btn-primary">Guardar cambios</button>
            <a class="btn btn-secondary" href="notificaciones.html">Ir a notificaciones</a>
          </div>
        </section>
      </form>

      <p class="form-msg account-msg" id="accountMsg" role="status" aria-live="polite"></p>`;
  }

  function setMsg(text, ok) {
    const msg = document.getElementById("accountMsg");
    if (!msg) return;
    msg.textContent = text;
    msg.classList.toggle("success", !!ok);
    msg.classList.toggle("error", !ok);
  }

  function readForm(form) {
    return Object.fromEntries(new FormData(form).entries());
  }

  function initGuestEvents() {
    const login = document.getElementById("loginForm");
    const register = document.getElementById("registerForm");
    const recover = document.getElementById("recoverBtn");
    const demo = document.getElementById("demoAccount");

    login.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = readForm(login);
      const user = findUser(data.email);
      if (!user || user.password !== data.password) {
        setMsg("Correo o contraseña incorrectos.", false);
        return;
      }
      PC.setSession({ email: user.email, startedAt: new Date().toISOString() });
      rerenderAll();
    });

    register.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = readForm(register);
      if (!data.nombre || !data.email || !data.password || data.password.length < 6) {
        setMsg("Completa nombre, correo y una contraseña de al menos 6 caracteres.", false);
        return;
      }
      if (findUser(data.email)) {
        setMsg("Ese correo ya tiene una cuenta registrada.", false);
        return;
      }
      const user = defaultUser(data);
      upsertUser(user);
      PC.setSession({ email: user.email, startedAt: new Date().toISOString() });
      rerenderAll();
    });

    recover.addEventListener("click", () => {
      const email = login.elements.email.value.trim();
      if (!email) {
        setMsg("Escribe tu correo para simular la recuperación.", false);
        login.elements.email.focus();
        return;
      }
      setMsg("Se generó una recuperación simulada. En una versión real recibirías un enlace seguro.", true);
    });

    demo.addEventListener("click", () => {
      const user = defaultUser({
        nombre: "Usuario Demo",
        email: "demo@polidata.pe",
        password: "demo123",
        region: "Lima Metropolitana",
        rol: "Votante",
      });
      upsertUser(user);
      PC.setSession({ email: user.email, startedAt: new Date().toISOString() });
      rerenderAll();
    });
  }

  function initUserEvents(user) {
    const logout = document.getElementById("logoutBtn");
    const form = document.getElementById("profileForm");

    logout.addEventListener("click", () => {
      PC.setSession(null);
      rerenderAll();
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = readForm(form);
      const intereses = Array.from(form.querySelectorAll('input[name="intereses"]:checked')).map((x) => x.value);
      const next = defaultUser(Object.assign({}, user, {
        nombre: data.nombre,
        rol: data.rol,
        region: data.region,
        intereses,
        notificaciones: {
          actualizaciones: !!form.elements.actualizaciones.checked,
          candidatosSeguidos: !!form.elements.candidatosSeguidos.checked,
          promesas: !!form.elements.promesas.checked,
          votaciones: !!form.elements.votaciones.checked,
          resumenSemanal: !!form.elements.resumenSemanal.checked,
          canalApp: !!form.elements.canalApp.checked,
          canalEmail: !!form.elements.canalEmail.checked,
        },
      }));
      upsertUser(next);
      setMsg("Perfil y preferencias guardados.", true);
      setTimeout(rerenderAll, 450);
    });
  }

  function render() {
    const user = PC.getCurrentUser();
    if (user) {
      renderUser(user);
      initUserEvents(user);
    } else {
      renderGuest();
      initGuestEvents();
    }
  }

  function rerenderAll() {
    render();
    if (PC.refreshShell) PC.refreshShell();
  }

  render();
})(window);
