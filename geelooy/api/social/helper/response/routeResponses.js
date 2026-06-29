// B"H
/**
 * @module RouteResponses
 * @description Chapter 516: Every refused gate returns the same clean shape.
 */
function awtsmoosError({ code = 'ERROR', message = 'Request failed', status = 400, details } = {}) {
  const out = { BH: 'B"H', error: true, code, message, status };
  if (details !== undefined) out.details = details;
  return out;
}
function methodNotAllowed(method, allowed = []) {
  return awtsmoosError({ code: 'METHOD_NOT_ALLOWED', message: `Method ${method || 'UNKNOWN'} is not allowed.`, status: 405, details: { method, allowed } });
}
function requireArray(value, name) {
  return Array.isArray(value) ? { ok: true, value } : { ok: false, error: awtsmoosError({ code: 'INVALID_ARRAY', message: `${name} must be an array.`, status: 400, details: { field: name } }) };
}
module.exports = { awtsmoosError, methodNotAllowed, requireArray };
