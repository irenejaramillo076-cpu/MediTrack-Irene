const sanitizeHtml = require('sanitize-html');
function fail(status, message) { throw Object.assign(new Error(message), { status }); }
function text(value, label, max = 120, required = true) {
  if (value === undefined && !required) return '';
  if (typeof value !== 'string' || value.length > max * 4) fail(400, `${label}: texto inválido.`);
  // Decodificación de entidades.
  const clean = sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} })
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').trim();
  if ((required && !clean) || clean.length > max) fail(400, `${label}: requerido y máximo ${max} caracteres.`);
  return clean;
}
function email(value, required = true) {
  const clean = text(value, 'Correo', 254, required).toLowerCase();
  if (clean && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) fail(400, 'Correo inválido.');
  return clean;
}
function choice(value, values, label) {
  const clean = text(value, label, 40);
  if (!values.includes(clean)) fail(400, `${label}: opción inválida.`);
  return clean;
}
function id(value) {
  if (!/^[1-9]\d*$/.test(String(value)) || !Number.isSafeInteger(Number(value))) fail(400, 'ID inválido.');
  return Number(value);
}
function date(value, birth = false) {
  const clean = text(value, 'Fecha', 10);
  const parsed = new Date(clean + 'T00:00:00Z');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(clean) || Number.isNaN(+parsed) || parsed.toISOString().slice(0, 10) !== clean || (birth && (parsed > new Date() || clean < '1900-01-01'))) fail(400, 'Fecha inválida.');
  return clean;
}
// Contraseñas sin transformar.
function password(value, min = 1) {
  if (typeof value !== 'string' || value.length < min || Buffer.byteLength(value) > 72) fail(400, 'Contraseña inválida (máximo 72 bytes).');
  return value;
}
module.exports = { fail, text, email, choice, id, date, password };
