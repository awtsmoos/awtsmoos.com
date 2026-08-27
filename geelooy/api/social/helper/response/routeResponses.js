// B"H
/**
 * @module RouteResponses
 * @description Chapter 520: every API gate returns one inspectable vessel.
 */
function awtsmoosError({ code = 'ERROR', message = 'Request failed', status = 400, details } = {}) {
  const out = { BH: 'B"H', error: true, ok: false, code, message, status };
  if (details !== undefined) out.details = details;
  return out;
}
function awtsmoosOk(data = {}, meta = {}) {
  return { BH: 'B"H', ok: true, error: false, data, meta };
}
function methodNotAllowed(method, allowed = []) {
  return awtsmoosError({ code: 'METHOD_NOT_ALLOWED', message: `Method ${method || 'UNKNOWN'} is not allowed.`, status: 405, details: { method, allowed } });
}
function requireArray(value, name) {
  if (Array.isArray(value)) return { ok: true, value };
  return { ok: false, error: awtsmoosError({ code: 'INVALID_ARRAY', message: `${name} must be an array.`, status: 400, details: { field: name, type: typeof value } }) };
}
module.exports = { awtsmoosError, awtsmoosOk, methodNotAllowed, requireArray };
