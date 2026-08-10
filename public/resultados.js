(() => {
  const POLL_MS = 3000;
  const kpisEl = document.getElementById("kpis");
  const detailEl = document.getElementById("detailCard");
  const statsEl = document.getElementById("statsCard");
  const liveStatus = document.getElementById("liveStatus");

  const SECTIONS = [
    {
      id: "clasificacion",
      title: "Clasificación",
      tone: "blue",
      fields: [
        ["proyecto", "Proyecto"],
        ["marca", "Marca / unidad"],
        ["marcaOtra", "Marca (otra)"],
        ["servicio", "Servicio principal"],
        ["servicioOtro", "Servicio (otro)"],
        ["resumen", "Resumen"],
      ],
    },
    {
      id: "brief",
      title: "Brief estratégico",
      tone: "navy",
      fields: [
        ["antecedentes", "Antecedentes"],
        ["problema", "Problema / oportunidad"],
        ["objetivo", "Objetivo"],
        ["objetivoOtro", "Objetivo (otro)"],
        ["resultado", "Resultado esperado"],
        ["publico", "Público"],
        ["cobertura", "Cobertura"],
        ["coberturaDetalle", "Detalle cobertura"],
        ["mensaje", "Mensaje principal"],
        ["callToAction", "Call to action"],
      ],
    },
    {
      id: "comercial",
      title: "Oferta comercial",
      tone: "green",
      fields: [
        ["tieneOferta", "¿Oferta comercial?"],
        ["ofertaDetalle", "Oferta detalle"],
        ["ofertaVigencia", "Vigencia / restricciones"],
      ],
    },
    {
      id: "entrega",
      title: "Entregables y canales",
      tone: "cyan",
      chipFields: [
        ["entregables", "Entregables"],
        ["canales", "Canales"],
      ],
      fields: [
        ["entregableOtro", "Entregable (otro)"],
        ["canalOtro", "Canal (otro)"],
      ],
    },
    {
      id: "diseno",
      title: "Diseño / adaptación",
      tone: "violet",
      fields: [
        ["textoListo", "Texto aprobado"],
        ["lineaGrafica", "Línea gráfica"],
      ],
    },
    {
      id: "fechas",
      title: "Fechas clave",
      tone: "amber",
      timeline: [
        ["fechaPropuesta", "1ª propuesta"],
        ["fechaFinal", "Entrega final"],
        ["fechaPublicacion", "Publicación"],
      ],
    },
    {
      id: "cierre",
      title: "Cierre",
      tone: "slate",
      fields: [
        ["comentarios", "Comentarios"],
        ["confirmaciones", "Confirmaciones"],
      ],
    },
  ];

  const OPTIONAL_EMPTY = new Set([
    "areaOtra",
    "marcaOtra",
    "servicioOtro",
    "objetivoOtro",
    "coberturaDetalle",
    "ofertaDetalle",
    "ofertaVigencia",
    "entregableOtro",
    "canalOtro",
    "textoListo",
    "lineaGrafica",
    "comentarios",
    "fechaPublicacion",
  ]);

  const LONG_FIELDS = new Set([
    "resumen",
    "antecedentes",
    "problema",
    "resultado",
    "publico",
    "mensaje",
    "ofertaDetalle",
    "comentarios",
    "confirmaciones",
  ]);

  const state = {
    responses: [],
    index: 0,
    lastCount: 0,
    stickToLatest: true,
  };

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function raw(v) {
    return String(v ?? "").trim();
  }

  function val(v) {
    const s = raw(v);
    if (!s) return { text: "—", na: true };
    return { text: s, na: false };
  }

  function when(iso) {
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return "Sin fecha";
      return d.toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" });
    } catch (_) {
      return "Sin fecha";
    }
  }

  function initials(name) {
    const parts = raw(name).split(/\s+/).filter(Boolean);
    if (!parts.length) return "YA";
    return parts
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();
  }

  function chips(value) {
    return raw(value)
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  }

  function countBy(list, key) {
    const map = new Map();
    list.forEach((r) => {
      const rawVal = String(r[key] || "").trim() || "Sin dato";
      rawVal.split(",").forEach((part) => {
        const k = part.trim() || "Sin dato";
        map.set(k, (map.get(k) || 0) + 1);
      });
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }

  function computeStats(list) {
    const ofertas = list.filter((r) => String(r.tieneOferta || "").toLowerCase() === "sí").length;
    const conDiseño = list.filter((r) => String(r.textoListo || "").trim() || String(r.lineaGrafica || "").trim()).length;
    return {
      total: list.length,
      ofertas,
      conDiseño,
      servicios: countBy(list, "servicio").slice(0, 6),
      marcas: countBy(list, "marca").slice(0, 6),
      areas: countBy(list, "area").slice(0, 6),
      entregables: countBy(list, "entregables").slice(0, 8),
    };
  }

  function bar(label, count, total) {
    const pct = total ? Math.round((count / total) * 100) : 0;
    return `
      <div class="bar-row">
        <span>${esc(label)}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
        <strong>${count}</strong>
      </div>
    `;
  }

  function renderKpis(stats) {
    const last = state.responses[0];
    kpisEl.innerHTML = `
      <div class="kpi">
        <div class="kpi-label">Solicitudes</div>
        <div class="kpi-value">${stats.total}</div>
        <div class="kpi-sub">En tiempo real</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">Con oferta</div>
        <div class="kpi-value">${stats.ofertas}</div>
        <div class="kpi-sub">Promoción / incentivo</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">Bloque diseño</div>
        <div class="kpi-value">${stats.conDiseño}</div>
        <div class="kpi-sub">Adaptación / gráfico</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">Última</div>
        <div class="kpi-value" style="font-size:1.05rem;line-height:1.25;margin-top:10px">${
          last ? esc(last.proyecto || last.nombre || "—") : "—"
        }</div>
        <div class="kpi-sub">${last ? esc(when(last.receivedAt)) : "Sin envíos"}</div>
      </div>
    `;
  }

  function renderStats(stats) {
    const t = stats.total || 1;
    statsEl.innerHTML = `
      <h2>Resumen</h2>
      <div class="stat-block">
        <h3>Por servicio</h3>
        ${
          stats.servicios.map(([k, n]) => bar(k, n, t)).join("") ||
          `<p class="muted" style="margin:0;font-size:0.85rem">Sin datos aún.</p>`
        }
      </div>
      <div class="stat-block">
        <h3>Por marca</h3>
        ${
          stats.marcas.map(([k, n]) => bar(k, n, t)).join("") ||
          `<p class="muted" style="margin:0;font-size:0.85rem">Sin datos aún.</p>`
        }
      </div>
      <div class="stat-block">
        <h3>Por área</h3>
        ${
          stats.areas.map(([k, n]) => bar(k, n, t)).join("") ||
          `<p class="muted" style="margin:0;font-size:0.85rem">Sin datos aún.</p>`
        }
      </div>
      <div class="stat-block">
        <h3>Entregables más pedidos</h3>
        ${
          stats.entregables.map(([k, n]) => bar(k, n, t)).join("") ||
          `<p class="muted" style="margin:0;font-size:0.85rem">Sin datos aún.</p>`
        }
      </div>
      <p class="muted" style="margin:0;font-size:0.85rem">Se actualiza solo cada pocos segundos.</p>
    `;
  }

  function fieldBlock(key, label, r) {
    const v = val(r[key]);
    if (v.na && OPTIONAL_EMPTY.has(key)) return "";
    const long = LONG_FIELDS.has(key) && !v.na;
    return `
      <div class="field${long ? " field-spotlight" : ""}">
        <div class="field-label">${esc(label)}</div>
        <div class="field-value${v.na ? " na" : ""}">${esc(v.text)}</div>
      </div>
    `;
  }

  function chipBlock(key, label, r) {
    const items = chips(r[key]);
    if (!items.length && OPTIONAL_EMPTY.has(key)) return "";
    if (!items.length) {
      return `
        <div class="field">
          <div class="field-label">${esc(label)}</div>
          <div class="field-value na">—</div>
        </div>
      `;
    }
    return `
      <div class="field field-chips">
        <div class="field-label">${esc(label)}</div>
        <div class="chip-row">
          ${items.map((item) => `<span class="chip">${esc(item)}</span>`).join("")}
        </div>
      </div>
    `;
  }

  function timelineBlock(pairs, r) {
    const items = pairs
      .map(([key, label]) => {
        const v = val(r[key]);
        if (v.na && OPTIONAL_EMPTY.has(key)) return "";
        return `
          <div class="tl-item${v.na ? " is-empty" : ""}">
            <div class="tl-dot" aria-hidden="true"></div>
            <div class="tl-copy">
              <div class="field-label">${esc(label)}</div>
              <div class="field-value${v.na ? " na" : ""}">${esc(v.text)}</div>
            </div>
          </div>
        `;
      })
      .join("");
    if (!items.trim()) return "";
    return `<div class="timeline">${items}</div>`;
  }

  function sectionHtml(section, r) {
    const parts = [];
    if (section.chipFields) {
      section.chipFields.forEach(([key, label]) => parts.push(chipBlock(key, label, r)));
    }
    if (section.fields) {
      section.fields.forEach(([key, label]) => parts.push(fieldBlock(key, label, r)));
    }
    if (section.timeline) {
      parts.push(timelineBlock(section.timeline, r));
    }
    const body = parts.join("").trim();
    if (!body) return "";
    return `
      <section class="answer-section tone-${section.tone}">
        <div class="answer-section-head">
          <span class="section-mark" aria-hidden="true"></span>
          <h3>${esc(section.title)}</h3>
        </div>
        <div class="answer-grid">${body}</div>
      </section>
    `;
  }

  function contactStrip(r) {
    const items = [
      ["Área", r.area || r.areaOtra],
      ["Nombre", r.nombre],
      ["Puesto", r.puesto],
      ["Correo", r.correo],
      ["Teléfono", r.telefono],
    ];
    return `
      <div class="contact-strip">
        ${items
          .map(([label, value]) => {
            const v = val(value);
            return `
              <div class="contact-pill">
                <span class="field-label">${esc(label)}</span>
                <strong class="${v.na ? "na" : ""}">${esc(v.text)}</strong>
              </div>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function renderDetail() {
    const list = state.responses;
    if (!list.length) {
      detailEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-orb" aria-hidden="true"></div>
          <p class="muted"><strong>Aún no hay solicitudes.</strong></p>
          <p class="muted">Cuando alguien complete el brief, verás aquí cada respuesta en vivo.</p>
        </div>
      `;
      return;
    }

    const r = list[state.index];
    const sections = SECTIONS.map((s) => sectionHtml(s, r)).join("");

    detailEl.innerHTML = `
      <div class="detail-hero">
        <div class="detail-hero-main">
          <div class="detail-head">
            <div class="counter">Solicitud ${state.index + 1} de ${list.length}</div>
            <div class="badge">${esc(r.servicio || "Sin servicio")}</div>
          </div>
          <div class="detail-title-row">
            <div class="avatar" aria-hidden="true">${esc(initials(r.nombre))}</div>
            <div>
              <h2 class="detail-title">${esc(r.proyecto || "Sin nombre de proyecto")}</h2>
              <p class="detail-when">${esc(r.nombre || "Sin nombre")} · ${esc(when(r.receivedAt || r.timestamp))}</p>
            </div>
          </div>
          <div class="meta-chips">
            ${raw(r.marca) ? `<span class="meta-chip">${esc(r.marca)}</span>` : ""}
            ${raw(r.area) ? `<span class="meta-chip">${esc(r.area)}</span>` : ""}
            ${raw(r.cobertura) ? `<span class="meta-chip">${esc(r.cobertura)}</span>` : ""}
            ${String(r.tieneOferta || "").toLowerCase() === "sí" ? `<span class="meta-chip is-hot">Con oferta</span>` : ""}
          </div>
        </div>
      </div>
      ${contactStrip(r)}
      <div class="answer-stack">${sections}</div>
      <div class="nav">
        <button type="button" class="btn btn-ghost" id="btnPrev" ${state.index <= 0 ? "disabled" : ""}>← Anterior</button>
        <button type="button" class="btn btn-primary" id="btnNext" ${state.index >= list.length - 1 ? "disabled" : ""}>Siguiente →</button>
      </div>
    `;

    document.getElementById("btnPrev")?.addEventListener("click", () => {
      state.stickToLatest = false;
      if (state.index > 0) {
        state.index -= 1;
        renderDetail();
      }
    });
    document.getElementById("btnNext")?.addEventListener("click", () => {
      state.stickToLatest = state.index + 1 >= list.length - 1;
      if (state.index < list.length - 1) {
        state.index += 1;
        renderDetail();
      }
    });
  }

  function renderAll(flash) {
    const stats = computeStats(state.responses);
    renderKpis(stats);
    renderStats(stats);
    renderDetail();
    if (flash) {
      detailEl.classList.remove("flash");
      void detailEl.offsetWidth;
      detailEl.classList.add("flash");
    }
  }

  async function refresh() {
    try {
      const res = await fetch("/api/responses?ts=" + Date.now(), { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      const list = Array.isArray(data.responses)
        ? data.responses
        : Array.isArray(data.items)
          ? data.items
          : [];
      const grew = list.length > state.lastCount;
      const prevId = state.responses[state.index]?.id;

      state.responses = list;
      if (!list.length) {
        state.index = 0;
      } else if (state.stickToLatest || grew) {
        state.index = 0;
        state.stickToLatest = true;
      } else {
        const idx = list.findIndex((item) => item.id === prevId);
        state.index = idx >= 0 ? idx : 0;
      }

      const now = new Date().toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      liveStatus.textContent = `En vivo · ${list.length} solicitud${list.length === 1 ? "" : "es"} · ${now}`;
      renderAll(grew && list.length > state.lastCount);
      state.lastCount = list.length;
    } catch (_) {
      liveStatus.textContent = "Sin conexión · reintentando…";
    }
  }

  document.addEventListener("keydown", (e) => {
    if (!state.responses.length) return;
    if (e.key === "ArrowLeft" && state.index > 0) {
      state.stickToLatest = false;
      state.index -= 1;
      renderDetail();
    }
    if (e.key === "ArrowRight" && state.index < state.responses.length - 1) {
      state.index += 1;
      state.stickToLatest = state.index >= state.responses.length - 1;
      renderDetail();
    }
  });

  refresh();
  setInterval(refresh, POLL_MS);
})();
