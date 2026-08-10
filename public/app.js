(() => {
  const cfg = window.YAAVS_BRIEF_CONFIG || {};
  const app = document.getElementById("app");
  const toast = document.getElementById("toast");

  const AREAS = [
    "Dirección General",
    "Subdirección Comercial Centro",
    "Subdirección Comercial Foráneo",
    "Pospago AT&T",
    "Pospago BAIT",
    "SILEMI",
    "Implementación y Capacitación",
    "Atención a Clientes",
    "Recursos Humanos",
    "Compras",
    "Finanzas",
    "Tecnologías de la Información",
    "Business Intelligence",
    "Otra",
  ];

  const MARCAS = [
    "YAAVS Prepago",
    "YAAVS Pospago",
    "SILEMI",
    "YAAVSTA",
    "Comunicación corporativa o interna",
    "Proyecto especial",
    "Otra",
  ];

  const SERVICIOS = [
    "Diseño gráfico",
    "Campaña publicitaria o difusión",
    "Estrategia de mercadotecnia",
    "Contenido o copywriting",
    "Producción audiovisual",
    "Formulario, landing page o apoyo digital",
    "Material POP o producción impresa",
    "Actualización o adaptación de un material existente",
    "Otro servicio de Mercadotecnia",
  ];

  const OBJETIVOS = [
    "Informar",
    "Lanzar un producto, servicio o proyecto",
    "Promocionar una oferta",
    "Incrementar ventas",
    "Generar registros o prospectos",
    "Aumentar visitas a un punto de venta",
    "Capacitar",
    "Comunicar un proceso interno",
    "Fortalecer el posicionamiento de marca",
    "Analizar o desarrollar una estrategia",
    "Convocar a un evento",
    "Oferta comercial",
    "Otro",
  ];

  const PUBLICOS = [
    "YAAVSERS",
    "YAAVSTARS o fuerza comercial",
    "Gerentes",
    "Colaboradores internos",
    "Clientes finales",
    "Prospectos",
    "Público general",
  ];

  const COBERTURAS = [
    "Nacional",
    "Zona Centro",
    "Zona Foránea",
    "Región específica",
    "Estado o ciudad",
    "Punto de venta específico",
    "Comunicación interna",
  ];

  const COBERTURA_DETALLE = new Set([
    "Región específica",
    "Estado o ciudad",
    "Punto de venta específico",
  ]);

  const ENTREGABLES = [
    "Post para redes sociales",
    "Historia vertical",
    "Carrusel",
    "Banner",
    "Flyer",
    "Cartel",
    "Lona",
    "Vinil o microperforado",
    "Ayudaventas",
    "Infografía",
    "Presentación",
    "Comunicado interno",
    "Copy publicitario",
    "Guion",
    "Reel o video",
    "Animación",
    "Landing page",
    "Formulario",
    "Material POP",
    "Campaña publicitaria",
    "Estrategia o plan de trabajo",
    "Otro",
  ];

  const CANALES = [
    "Facebook",
    "Instagram",
    "TikTok",
    "WhatsApp",
    "Sitio web",
    "Landing page",
    "Pauta digital",
    "Punto de venta",
    "Evento",
    "Comunicación interna",
    "Material impreso",
    "Otro",
  ];

  const TEXTO_LISTO = [
    "Sí.",
    "No, necesito apoyo para desarrollarlo.",
    "Está pendiente de validación.",
  ];

  const LINEAS_GRAFICAS = [
    "Yaavs",
    "Bait",
    "Unefon",
    "At&t",
    "Movistar",
    "Telcel",
    "Silemi",
    "Yaavs Pospago",
  ];

  const CONFIRMACIONES = [
    "Confirmo que la información proporcionada es correcta y está actualizada.",
    "Confirmo que la solicitud cuenta con autorización.",
    "Entiendo que los cambios posteriores al presente brief pueden modificar fecha de entrega.",
    "Entiendo que Mercadotecnia confirmará la viabilidad y programación de la solicitud.",
  ];

  const DISEÑO_SERVICIOS = new Set([
    "Diseño gráfico",
    "Actualización o adaptación de un material existente",
  ]);

  const state = {
    done: false,
    submitting: false,
    formError: "",
    fieldErrors: {},
    answers: {
      area: "",
      areaOtra: "",
      nombre: "",
      puesto: "",
      correo: "",
      telefono: "",
      proyecto: "",
      marca: "",
      marcaOtra: "",
      servicio: "",
      servicioOtro: "",
      resumen: "",
      antecedentes: "",
      problema: "",
      objetivo: "",
      objetivoOtro: "",
      resultado: "",
      publico: [],
      cobertura: [],
      coberturaDetalle: "",
      mensaje: "",
      callToAction: "",
      tieneOferta: null,
      ofertaDetalle: "",
      ofertaVigencia: "",
      entregables: [],
      entregableOtro: "",
      canales: [],
      canalOtro: "",
      textoListo: "",
      lineaGrafica: "",
      fechaPropuesta: "",
      fechaFinal: "",
      fechaPublicacion: "",
      comentarios: "",
      confirmaciones: [],
      website: "",
    },
  };

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function showToast(msg) {
    toast.hidden = false;
    toast.textContent = msg;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      toast.hidden = true;
    }, 2800);
  }

  function needsCoberturaDetalle() {
    return state.answers.cobertura.some((c) => COBERTURA_DETALLE.has(c));
  }

  function needsDiseñoBlock() {
    return DISEÑO_SERVICIOS.has(state.answers.servicio);
  }

  function isEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());
  }

  function isPhone(v) {
    const digits = String(v).replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 15;
  }

  function choiceGroup(options, selected, key, multi = false) {
    const err = state.fieldErrors[key] ? " has-error" : "";
    return `
      <div class="choices${options.length > 8 ? " dense" : ""}${err}" data-key="${key}" data-multi="${multi ? "1" : "0"}" role="${multi ? "group" : "radiogroup"}">
        ${options
          .map((opt) => {
            const on = multi ? selected.includes(opt) : selected === opt;
            const cls = multi ? "check" : "choice";
            return `<button type="button" class="${cls}${on ? " is-selected" : ""}" data-value="${escapeHtml(opt)}">
              <span class="mark" aria-hidden="true"></span>
              <span>${escapeHtml(opt)}</span>
            </button>`;
          })
          .join("")}
      </div>
    `;
  }

  function fieldBlock({ id, label, required = false, help = "", body, hidden = false }) {
    return `
      <div class="field-block${hidden ? " is-hidden" : ""}" data-block="${id}">
        <label class="field-label" for="${id}">${escapeHtml(label)}${required ? '<span class="req">*</span>' : ""}</label>
        ${help ? `<p class="field-help">${help}</p>` : ""}
        ${body}
      </div>
    `;
  }

  function textInput(id, type = "text", placeholder = "", attrs = "") {
    const err = state.fieldErrors[id] ? " has-error" : "";
    const val = state.answers[id] ?? "";
    return `<input class="field${err}" id="${id}" name="${id}" type="${type}" value="${escapeHtml(val)}" placeholder="${escapeHtml(placeholder)}" ${attrs} />`;
  }

  function textArea(id, placeholder = "") {
    const err = state.fieldErrors[id] ? " has-error" : "";
    return `<textarea class="field${err}" id="${id}" name="${id}" rows="4" placeholder="${escapeHtml(placeholder)}">${escapeHtml(state.answers[id] || "")}</textarea>`;
  }

  function selectInput(id, options, placeholder = "Selecciona una opción") {
    const err = state.fieldErrors[id] ? " has-error" : "";
    const val = state.answers[id] || "";
    return `
      <div class="select-wrap">
        <select class="select${err}" id="${id}" name="${id}">
          <option value="" ${!val ? "selected" : ""} disabled>${escapeHtml(placeholder)}</option>
          ${options
            .map(
              (o) =>
                `<option value="${escapeHtml(o)}" ${val === o ? "selected" : ""}>${escapeHtml(o)}</option>`
            )
            .join("")}
        </select>
      </div>
    `;
  }

  function validateAll() {
    const a = state.answers;
    const e = {};

    if (!a.area) e.area = true;
    if (a.area === "Otra" && a.areaOtra.trim().length < 2) e.areaOtra = true;
    if (a.nombre.trim().length < 3) e.nombre = true;
    if (a.puesto.trim().length < 2) e.puesto = true;
    if (!isEmail(a.correo)) e.correo = true;
    if (!isPhone(a.telefono)) e.telefono = true;
    if (a.proyecto.trim().length < 3) e.proyecto = true;
    if (!a.marca) e.marca = true;
    if (a.marca === "Otra" && a.marcaOtra.trim().length < 2) e.marcaOtra = true;
    if (!a.servicio) e.servicio = true;
    if (a.servicio === "Otro servicio de Mercadotecnia" && a.servicioOtro.trim().length < 3) {
      e.servicioOtro = true;
    }
    if (a.resumen.trim().length < 10) e.resumen = true;
    if (a.antecedentes.trim().length < 10) e.antecedentes = true;
    if (a.problema.trim().length < 10) e.problema = true;
    if (!a.objetivo) e.objetivo = true;
    if (a.objetivo === "Otro" && a.objetivoOtro.trim().length < 3) e.objetivoOtro = true;
    if (a.resultado.trim().length < 10) e.resultado = true;
    if (!a.publico.length) e.publico = true;
    if (!a.cobertura.length) e.cobertura = true;
    if (needsCoberturaDetalle() && a.coberturaDetalle.trim().length < 3) e.coberturaDetalle = true;
    if (a.mensaje.trim().length < 5) e.mensaje = true;
    if (a.callToAction.trim().length < 2) e.callToAction = true;
    if (a.tieneOferta !== "Sí" && a.tieneOferta !== "No") e.tieneOferta = true;
    if (a.tieneOferta === "Sí") {
      if (a.ofertaDetalle.trim().length < 15) e.ofertaDetalle = true;
      if (a.ofertaVigencia.trim().length < 5) e.ofertaVigencia = true;
    }
    if (!a.entregables.length) e.entregables = true;
    if (a.entregables.includes("Otro") && a.entregableOtro.trim().length < 2) e.entregableOtro = true;
    if (!a.canales.length) e.canales = true;
    if (a.canales.includes("Otro") && a.canalOtro.trim().length < 2) e.canalOtro = true;
    if (needsDiseñoBlock()) {
      if (!a.textoListo) e.textoListo = true;
      if (!a.lineaGrafica) e.lineaGrafica = true;
    }
    if (!a.fechaPropuesta) e.fechaPropuesta = true;
    if (!a.fechaFinal) e.fechaFinal = true;
    else if (a.fechaPropuesta && a.fechaFinal < a.fechaPropuesta) e.fechaFinal = true;
    if (a.confirmaciones.length !== CONFIRMACIONES.length) e.confirmaciones = true;

    state.fieldErrors = e;
    const count = Object.keys(e).length;
    state.formError = count
      ? `Hay ${count} campo${count === 1 ? "" : "s"} pendiente${count === 1 ? "" : "s"} o con error. Revisa lo marcado en rojo.`
      : "";
    return count === 0;
  }

  function renderSuccess() {
    return `
      <section class="sheet success">
        <div class="success-icon">✓</div>
        <h2>¡Tu solicitud fue recibida correctamente!</h2>
        <p class="lead" style="margin-top:14px">
          El área de Mercadotecnia revisará que el brief esté completo y evaluará su alcance y fecha de atención.
        </p>
      </section>
    `;
  }

  function renderForm() {
    const a = state.answers;
    return `
      <section class="sheet">
        <div class="hero">
          <div class="kicker"><span class="kicker-dot"></span> Mercadotecnia</div>
          <h1>Solicitud de servicios de Mercadotecnia</h1>
          <p class="lead">
            Completa este brief para comprender el objetivo, definir entregables y programar tu proyecto.
            La información debe estar completa, actualizada y autorizada.
          </p>
          <div class="hint-grid">
            <div class="hint-item"><span>01</span><p>Objetivo y alcance claros</p></div>
            <div class="hint-item"><span>02</span><p>Responsables, entregables y fechas</p></div>
            <div class="hint-item"><span>03</span><p>Programación en calendario</p></div>
            <div class="hint-item"><span>04</span><p>Seguimiento y control de cambios</p></div>
          </div>
        </div>

        <form class="form-body" id="briefForm" novalidate>
          <div class="section" id="sec1">
            <div class="section-head">
              <div class="section-num">Sección 1</div>
              <h2 class="section-title">Datos del solicitante</h2>
            </div>
            ${fieldBlock({
              id: "area",
              label: "Área solicitante",
              required: true,
              body: selectInput("area", AREAS),
            })}
            ${fieldBlock({
              id: "areaOtra",
              label: "Especifica el área",
              required: true,
              hidden: a.area !== "Otra",
              body: textInput("areaOtra", "text", "Nombre del área"),
            })}
            <div class="fields-row">
              ${fieldBlock({
                id: "nombre",
                label: "Nombre completo del solicitante",
                required: true,
                body: textInput("nombre", "text", "Nombre y apellidos", 'autocomplete="name"'),
              })}
              ${fieldBlock({
                id: "puesto",
                label: "Puesto",
                required: true,
                body: textInput("puesto", "text", "Tu puesto o cargo", 'autocomplete="organization-title"'),
              })}
            </div>
            <div class="fields-row">
              ${fieldBlock({
                id: "correo",
                label: "Correo electrónico",
                required: true,
                body: textInput("correo", "email", "nombre@empresa.com", 'autocomplete="email"'),
              })}
              ${fieldBlock({
                id: "telefono",
                label: "Número telefónico utilitario",
                required: true,
                help: "Incluye lada. Ejemplo: 55 1234 5678",
                body: textInput("telefono", "tel", "55 0000 0000", 'autocomplete="tel"'),
              })}
            </div>
          </div>

          <div class="section" id="sec2">
            <div class="section-head">
              <div class="section-num">Sección 2</div>
              <h2 class="section-title">Clasificación de la solicitud</h2>
            </div>
            ${fieldBlock({
              id: "proyecto",
              label: "Nombre del proyecto o solicitud",
              required: true,
              help: "Utiliza un nombre breve y fácil de identificar.",
              body: textInput("proyecto", "text", "Ej. Campaña verano PDV Centro"),
            })}
            ${fieldBlock({
              id: "marca",
              label: "Marca, unidad de negocio o proyecto relacionado",
              required: true,
              body: choiceGroup(MARCAS, a.marca, "marca"),
            })}
            ${fieldBlock({
              id: "marcaOtra",
              label: "Especifica la marca o proyecto",
              required: true,
              hidden: a.marca !== "Otra",
              body: textInput("marcaOtra"),
            })}
            ${fieldBlock({
              id: "servicio",
              label: "¿Cuál es el servicio principal que necesitas?",
              required: true,
              body: choiceGroup(SERVICIOS, a.servicio, "servicio"),
            })}
            ${fieldBlock({
              id: "servicioOtro",
              label: "Describe el servicio que necesitas",
              required: true,
              hidden: a.servicio !== "Otro servicio de Mercadotecnia",
              body: textArea("servicioOtro"),
            })}
            ${fieldBlock({
              id: "resumen",
              label: "Resume tu solicitud en una o dos frases",
              required: true,
              help: "Explica concretamente qué necesitas que desarrolle Mercadotecnia.",
              body: textArea("resumen"),
            })}
          </div>

          <div class="section" id="sec3">
            <div class="section-head">
              <div class="section-num">Sección 3</div>
              <h2 class="section-title">Brief general</h2>
            </div>
            ${fieldBlock({
              id: "antecedentes",
              label: "Antecedentes de la solicitud",
              required: true,
              help: "Explica el contexto que Mercadotecnia necesita conocer.",
              body: textArea("antecedentes"),
            })}
            ${fieldBlock({
              id: "problema",
              label: "¿Qué problema, necesidad u oportunidad se busca atender?",
              required: true,
              body: textArea("problema"),
            })}
            ${fieldBlock({
              id: "objetivo",
              label: "Objetivo principal",
              required: true,
              body: choiceGroup(OBJETIVOS, a.objetivo, "objetivo"),
            })}
            ${fieldBlock({
              id: "objetivoOtro",
              label: "Especifica el objetivo",
              required: true,
              hidden: a.objetivo !== "Otro",
              body: textInput("objetivoOtro"),
            })}
            ${fieldBlock({
              id: "resultado",
              label: "¿Qué resultado concreto esperas obtener?",
              required: true,
              help: "Describe cómo se vería un resultado exitoso.",
              body: textArea("resultado"),
            })}
            ${fieldBlock({
              id: "publico",
              label: "¿A quién va dirigida la comunicación?",
              required: true,
              help: "Puedes seleccionar más de una opción.",
              body: choiceGroup(PUBLICOS, a.publico, "publico", true),
            })}
            ${fieldBlock({
              id: "cobertura",
              label: "Cobertura geográfica",
              required: true,
              help: "Puedes seleccionar más de una opción.",
              body: choiceGroup(COBERTURAS, a.cobertura, "cobertura", true),
            })}
            ${fieldBlock({
              id: "coberturaDetalle",
              label: "Especifica las regiones, estados, ciudades o puntos de venta",
              required: true,
              hidden: !needsCoberturaDetalle(),
              body: textArea("coberturaDetalle"),
            })}
            ${fieldBlock({
              id: "mensaje",
              label: "¿Cuál es el mensaje principal que debe comunicar el proyecto?",
              required: true,
              body: textArea("mensaje"),
            })}
            ${fieldBlock({
              id: "callToAction",
              label: "¿Qué acción debe realizar el público después de ver la comunicación?",
              required: true,
              help: "Ejemplos: comprar, registrarse, asistir, activar, solicitar información o visitar un punto de venta.",
              body: textInput("callToAction", "text", "Ej. Visitar el PDV y activar la promoción"),
            })}
            ${fieldBlock({
              id: "tieneOferta",
              label: "¿La solicitud comunica una oferta, promoción o incentivo comercial?",
              required: true,
              body: choiceGroup(["Sí", "No"], a.tieneOferta, "tieneOferta"),
            })}
            ${fieldBlock({
              id: "ofertaDetalle",
              label: "Describe la oferta comercial completa",
              required: true,
              help: "Incluye precio, beneficio, mecánica, vigencia, cobertura y participantes.",
              hidden: a.tieneOferta !== "Sí",
              body: textArea("ofertaDetalle"),
            })}
            ${fieldBlock({
              id: "ofertaVigencia",
              label: "Vigencia y restricciones",
              required: true,
              hidden: a.tieneOferta !== "Sí",
              body: textArea("ofertaVigencia"),
            })}
          </div>

          <div class="section" id="sec4">
            <div class="section-head">
              <div class="section-num">Sección 4</div>
              <h2 class="section-title">Entregables solicitados</h2>
            </div>
            ${fieldBlock({
              id: "entregables",
              label: "¿Qué materiales o entregables necesitas?",
              required: true,
              help: "Selecciona todos los que apliquen.",
              body: choiceGroup(ENTREGABLES, a.entregables, "entregables", true),
            })}
            ${fieldBlock({
              id: "entregableOtro",
              label: "Especifica el entregable adicional",
              required: true,
              hidden: !a.entregables.includes("Otro"),
              body: textInput("entregableOtro"),
            })}
            ${fieldBlock({
              id: "canales",
              label: "¿Dónde se utilizarán o publicarán los materiales?",
              required: true,
              help: "Selecciona todos los canales que apliquen.",
              body: choiceGroup(CANALES, a.canales, "canales", true),
            })}
            ${fieldBlock({
              id: "canalOtro",
              label: "Especifica el canal adicional",
              required: true,
              hidden: !a.canales.includes("Otro"),
              body: textInput("canalOtro"),
            })}
          </div>

          <div class="section" id="sec5">
            <div class="section-head">
              <div class="section-num">Sección 5</div>
              <h2 class="section-title">Preguntas condicionales por servicio</h2>
            </div>
            <p class="section-note">Bloque A · Diseño gráfico o adaptación. Obligatorias cuando el servicio principal es diseño o actualización de un material existente.</p>
            ${fieldBlock({
              id: "textoListo",
              label: "¿El texto que deberá llevar el diseño ya está completo y aprobado?",
              required: needsDiseñoBlock(),
              body: choiceGroup(TEXTO_LISTO, a.textoListo, "textoListo"),
            })}
            ${fieldBlock({
              id: "lineaGrafica",
              label: "¿Debe conservarse alguna línea gráfica existente?",
              required: needsDiseñoBlock(),
              body: choiceGroup(LINEAS_GRAFICAS, a.lineaGrafica, "lineaGrafica"),
            })}
          </div>

          <div class="section" id="sec6">
            <div class="section-head">
              <div class="section-num">Sección 6</div>
              <h2 class="section-title">Fechas e impacto operativo</h2>
            </div>
            <div class="dates-grid">
              ${fieldBlock({
                id: "fechaPropuesta",
                label: "Fecha solicitada para recibir la primera propuesta",
                required: true,
                body: textInput("fechaPropuesta", "date"),
              })}
              ${fieldBlock({
                id: "fechaFinal",
                label: "Fecha solicitada para la entrega final",
                required: true,
                body: textInput("fechaFinal", "date"),
              })}
              ${fieldBlock({
                id: "fechaPublicacion",
                label: "Fecha de publicación, lanzamiento, evento o implementación",
                help: "Completa solo cuando aplique.",
                body: textInput("fechaPublicacion", "date"),
              })}
            </div>
          </div>

          <div class="section" id="sec7">
            <div class="section-head">
              <div class="section-num">Sección 7</div>
              <h2 class="section-title">Archivos, validación y aprobación</h2>
            </div>
            ${fieldBlock({
              id: "comentarios",
              label: "Comentarios o indicaciones adicionales",
              body: textArea("comentarios", "Cualquier detalle que ayude a Mercadotecnia…"),
            })}
            ${fieldBlock({
              id: "confirmaciones",
              label: "Confirmación del solicitante",
              required: true,
              help: "Debes aceptar las cuatro confirmaciones para enviar.",
              body: `<div class="confirm-list${state.fieldErrors.confirmaciones ? " has-error" : ""}" id="confirmList">
                ${CONFIRMACIONES.map((c) => {
                  const on = a.confirmaciones.includes(c);
                  return `<button type="button" class="confirm-item${on ? " is-selected" : ""}" data-value="${escapeHtml(c)}">
                    <span class="mark" aria-hidden="true"></span>
                    <span>${escapeHtml(c)}</span>
                  </button>`;
                }).join("")}
              </div>`,
            })}
          </div>

          <div class="form-footer">
            ${state.formError ? `<div class="error-banner">${escapeHtml(state.formError)}</div>` : ""}
            <button type="submit" class="btn btn-primary" id="btnSubmit" ${state.submitting ? "disabled" : ""}>
              ${state.submitting ? "Enviando…" : "Enviar solicitud"}
            </button>
          </div>

          <div class="honeypot" aria-hidden="true">
            <label>Website <input type="text" id="website" name="website" tabindex="-1" autocomplete="off" /></label>
          </div>
        </form>
      </section>
    `;
  }

  function syncVisibility() {
    const a = state.answers;
    const toggle = (id, show) => {
      const el = app.querySelector(`[data-block="${id}"]`);
      if (el) el.classList.toggle("is-hidden", !show);
    };
    toggle("areaOtra", a.area === "Otra");
    toggle("marcaOtra", a.marca === "Otra");
    toggle("servicioOtro", a.servicio === "Otro servicio de Mercadotecnia");
    toggle("objetivoOtro", a.objetivo === "Otro");
    toggle("coberturaDetalle", needsCoberturaDetalle());
    toggle("ofertaDetalle", a.tieneOferta === "Sí");
    toggle("ofertaVigencia", a.tieneOferta === "Sí");
    toggle("entregableOtro", a.entregables.includes("Otro"));
    toggle("canalOtro", a.canales.includes("Otro"));
  }

  function readTextFields() {
    app.querySelectorAll("input.field, textarea.field, select.select").forEach((el) => {
      const key = el.id;
      if (key && key in state.answers && typeof state.answers[key] === "string") {
        state.answers[key] = el.value;
      }
    });
    const website = document.getElementById("website");
    if (website) state.answers.website = website.value;
  }

  function bind() {
    const form = document.getElementById("briefForm");
    if (!form) return;

    form.addEventListener("input", (e) => {
      const t = e.target;
      if (!t.id || !(t.id in state.answers)) return;
      if (typeof state.answers[t.id] === "string") {
        state.answers[t.id] = t.value;
        if (t.id === "area" || t.id === "servicio") syncVisibility();
      }
    });

    form.addEventListener("change", (e) => {
      const t = e.target;
      if (!t.id || !(t.id in state.answers)) return;
      if (typeof state.answers[t.id] === "string") {
        state.answers[t.id] = t.value;
        syncVisibility();
      }
    });

    form.querySelectorAll(".choices").forEach((group) => {
      const key = group.getAttribute("data-key");
      const multi = group.getAttribute("data-multi") === "1";
      group.querySelectorAll(".choice, .check").forEach((btn) => {
        btn.addEventListener("click", () => {
          const val = btn.getAttribute("data-value");
          if (multi) {
            const list = state.answers[key];
            const i = list.indexOf(val);
            if (i >= 0) list.splice(i, 1);
            else list.push(val);
          } else {
            state.answers[key] = val;
          }
          // Soft re-render of choice UI without losing scroll: update classes + visibility
          group.querySelectorAll(".choice, .check").forEach((b) => {
            const v = b.getAttribute("data-value");
            const on = multi ? state.answers[key].includes(v) : state.answers[key] === v;
            b.classList.toggle("is-selected", on);
          });
          syncVisibility();
        });
      });
    });

    form.querySelectorAll(".confirm-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const val = btn.getAttribute("data-value");
        const list = state.answers.confirmaciones;
        const i = list.indexOf(val);
        if (i >= 0) list.splice(i, 1);
        else list.push(val);
        btn.classList.toggle("is-selected", list.includes(val));
      });
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      readTextFields();
      if (!validateAll()) {
        render();
        const firstErr = app.querySelector(".has-error, .field-block .has-error");
        if (firstErr) firstErr.scrollIntoView({ behavior: "smooth", block: "center" });
        showToast("Revisa los campos marcados");
        return;
      }
      await submit();
    });
  }

  async function submit() {
    if (state.submitting) return;
    if (state.answers.website) {
      state.done = true;
      render();
      return;
    }

    state.submitting = true;
    render();

    const payload = {
      timestamp: new Date().toISOString(),
      answers: { ...state.answers },
    };
    delete payload.answers.website;

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("submit failed");

      if (cfg.mode === "google-forms" && cfg.formAction && cfg.entryId) {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = cfg.formAction;
        form.target = "yaavs_brief_sink";
        form.style.display = "none";
        const input = document.createElement("input");
        input.name = cfg.entryId;
        input.value = JSON.stringify(payload);
        form.appendChild(input);
        let iframe = document.getElementById("yaavs_brief_sink");
        if (!iframe) {
          iframe = document.createElement("iframe");
          iframe.name = "yaavs_brief_sink";
          iframe.id = "yaavs_brief_sink";
          iframe.style.display = "none";
          document.body.appendChild(iframe);
        }
        document.body.appendChild(form);
        form.submit();
        form.remove();
      }

      state.submitting = false;
      state.done = true;
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      state.submitting = false;
      state.formError = "No se pudo enviar. Revisa tu conexión e inténtalo de nuevo.";
      showToast("Error al enviar la solicitud");
      render();
    }
  }

  function render() {
    const y = window.scrollY;
    app.innerHTML = state.done ? renderSuccess() : renderForm();
    if (!state.done) {
      bind();
      syncVisibility();
      window.scrollTo(0, y);
    }
  }

  render();
})();
