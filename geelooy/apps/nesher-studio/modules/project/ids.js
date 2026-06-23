/* B"H
The Awtsmoos speaks every model-spark into time: ids, cloning, and validation
become small clean vessels so the studio remembers without pretending.
*/
export function makeId(prefix = 'id') {
  const uuid = globalThis.crypto?.randomUUID?.();
  const fallback = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${uuid || fallback}`;
}

export function now(input = {}) { return input.createdAt || Date.now(); }
export function touch(model) { model.updatedAt = Date.now(); return model; }
export function clonePlain(value) { return JSON.parse(JSON.stringify(value ?? null)); }
export function asArray(value) { return Array.isArray(value) ? value : []; }
export function numberOr(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function assertKind(model, kind) {
  if (!model || model.kind !== kind) throw new Error(`Expected ${kind} model.`);
  return model;
}
