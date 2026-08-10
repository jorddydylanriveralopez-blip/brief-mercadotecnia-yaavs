/**
 * Brief Mercadotecnia YAAVS → Google Sheets
 *
 * SETUP (una sola vez):
 * 1. Abre https://sheets.new y renombra el archivo a
 *    "Brief Mercadotecnia YAAVS — Respuestas"
 * 2. Extensiones → Apps Script → pega este código → Guardar
 * 3. Implementar → Nueva implementación → Tipo: Aplicación web
 *    - Ejecutar como: Yo
 *    - Quién tiene acceso: Cualquiera
 * 4. Copia la URL de la app web
 * 5. En el servidor / Hostinger define:
 *    SHEETS_WEBHOOK_URL=<esa URL>
 *
 * Opcional: ejecuta setupSheet() una vez para crear encabezados.
 */

var SHEET_NAME = "Respuestas Brief";

var HEADERS = [
  "Timestamp",
  "ID",
  "Área solicitante",
  "Área (otra)",
  "Nombre",
  "Puesto",
  "Correo",
  "Teléfono",
  "Proyecto",
  "Marca / unidad",
  "Marca (otra)",
  "Servicio principal",
  "Servicio (otro)",
  "Resumen",
  "Antecedentes",
  "Problema / oportunidad",
  "Objetivo",
  "Objetivo (otro)",
  "Resultado esperado",
  "Público",
  "Cobertura",
  "Detalle cobertura",
  "Mensaje principal",
  "Call to action",
  "¿Oferta comercial?",
  "Oferta detalle",
  "Vigencia / restricciones",
  "Entregables",
  "Entregable (otro)",
  "Canales",
  "Canal (otro)",
  "Texto aprobado",
  "Línea gráfica",
  "Fecha 1ª propuesta",
  "Fecha entrega final",
  "Fecha publicación",
  "Comentarios",
  "Confirmaciones",
];

function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({
      ok: true,
      service: "Brief Mercadotecnia YAAVS",
      sheet: SHEET_NAME,
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var raw = (e && e.postData && e.postData.contents) || "{}";
    var data = JSON.parse(raw);
    var sheet = ensureSheet_();
    sheet.appendRow(rowFromPayload_(data));
    return ContentService.createTextOutput(
      JSON.stringify({ ok: true, appended: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function setupSheet() {
  ensureSheet_();
}

function ensureSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, Math.min(10, HEADERS.length));
  }
  return sheet;
}

function asText_(v) {
  if (v == null) return "";
  if (Object.prototype.toString.call(v) === "[object Array]") return v.join(", ");
  if (typeof v === "object") {
    try {
      return JSON.stringify(v);
    } catch (err) {
      return String(v);
    }
  }
  return String(v);
}

function pick_(data, key) {
  if (data[key] != null && data[key] !== "") return data[key];
  if (data.answers && data.answers[key] != null) return data.answers[key];
  return "";
}

function rowFromPayload_(data) {
  return [
    pick_(data, "receivedAt") || pick_(data, "timestamp") || new Date().toISOString(),
    pick_(data, "id"),
    pick_(data, "area"),
    pick_(data, "areaOtra"),
    pick_(data, "nombre"),
    pick_(data, "puesto"),
    pick_(data, "correo"),
    pick_(data, "telefono"),
    pick_(data, "proyecto"),
    pick_(data, "marca"),
    pick_(data, "marcaOtra"),
    pick_(data, "servicio"),
    pick_(data, "servicioOtro"),
    pick_(data, "resumen"),
    pick_(data, "antecedentes"),
    pick_(data, "problema"),
    pick_(data, "objetivo"),
    pick_(data, "objetivoOtro"),
    pick_(data, "resultado"),
    asText_(pick_(data, "publico")),
    asText_(pick_(data, "cobertura")),
    pick_(data, "coberturaDetalle"),
    pick_(data, "mensaje"),
    pick_(data, "callToAction"),
    pick_(data, "tieneOferta"),
    pick_(data, "ofertaDetalle"),
    pick_(data, "ofertaVigencia"),
    asText_(pick_(data, "entregables")),
    pick_(data, "entregableOtro"),
    asText_(pick_(data, "canales")),
    pick_(data, "canalOtro"),
    pick_(data, "textoListo"),
    pick_(data, "lineaGrafica"),
    pick_(data, "fechaPropuesta"),
    pick_(data, "fechaFinal"),
    pick_(data, "fechaPublicacion"),
    pick_(data, "comentarios"),
    asText_(pick_(data, "confirmaciones")),
  ];
}
