/* =============================================================
   PoliData — Lógica de la landing (main.js)
   Solo comportamiento propio de la landing:
   header dinámico, navegación móvil, formulario de lista de
   espera (validación en cliente) y animaciones de aparición.
   Las herramientas (comparador, semáforo, fichas) viven en sus
   propias páginas; aquí ya no hay datos de candidatos.
   ============================================================= */
(function () {
  "use strict";

  /* -----------------------------------------------------------
     1. Header: cambia de estilo al hacer scroll
  ----------------------------------------------------------- */
  const header = document.getElementById("header");
  if (header) {
    const onScroll = () => {
      if (window.scrollY > 40) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* -----------------------------------------------------------
     2. Navegación móvil (hamburguesa)
  ----------------------------------------------------------- */
  const navToggle = document.getElementById("navToggle");
  const primaryNav = document.getElementById("primary-nav");

  if (navToggle && primaryNav) {
    navToggle.addEventListener("click", () => {
      const open = primaryNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute(
        "aria-label",
        open ? "Cerrar menú de navegación" : "Abrir menú de navegación"
      );
    });

    // Cerrar el menú al hacer clic en un enlace (móvil)
    primaryNav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        primaryNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* -----------------------------------------------------------
     3. Formulario de lista de espera (validación en cliente)
        Demostración: NO se envía a ningún servidor.
  ----------------------------------------------------------- */
  const waitForm = document.getElementById("waitlistForm");
  const emailInput = document.getElementById("email");
  const emailMsg = document.getElementById("emailMsg");
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (waitForm && emailInput && emailMsg) {
    waitForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const value = emailInput.value.trim();
      emailMsg.classList.remove("error", "success");

      if (value === "") {
        emailInput.setAttribute("aria-invalid", "true");
        emailMsg.textContent = "Por favor, ingresa tu correo electrónico.";
        emailMsg.classList.add("error");
        emailInput.focus();
        return;
      }
      if (!EMAIL_RE.test(value)) {
        emailInput.setAttribute("aria-invalid", "true");
        emailMsg.textContent = "Ese correo no parece válido. Revisa el formato.";
        emailMsg.classList.add("error");
        emailInput.focus();
        return;
      }

      // Validación correcta. Es una demostración: no guardamos nada en
      // ningún servidor y por eso conservamos el correo en el campo.
      emailInput.setAttribute("aria-invalid", "false");
      emailMsg.textContent =
        "✓ Correo válido. Esta es una demostración: no se almacena ni se enviarán mensajes reales.";
      emailMsg.classList.add("success");
    });

    // Limpia el mensaje de error mientras el usuario escribe
    emailInput.addEventListener("input", () => {
      if (emailMsg.classList.contains("error")) {
        emailMsg.textContent = "";
        emailMsg.classList.remove("error");
        emailInput.setAttribute("aria-invalid", "false");
      }
    });
  }

  /* -----------------------------------------------------------
     4. Animaciones de aparición (IntersectionObserver)
        Respeta prefers-reduced-motion.
  ----------------------------------------------------------- */
  const reveals = document.querySelectorAll(".reveal");
  const reduce =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("visible"));
  } else {
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
})();
