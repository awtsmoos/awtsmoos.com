// B"H
/**
 * @module UniversalObjectSchema
 * @description Chapter 587: every post, window, file, agent, mail, thought, and
 * proposal receives one inspectable object vessel.
 */
function clean(value, fallback = '', max = 240) {
  return String(value ?? fallback).trim().replace(/[<>]/g, '').slice(0, max);
}
function obj(value, fallback = {}) {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  try { const parsed = JSON.parse(value || '{}'); return parsed && typeof parsed === 'object' ? parsed : fallback; } catch { return fallback; }
}
function arr(value) {
  if (Array.isArray(value)) return value;
  try { const parsed = JSON.parse(value || '[]'); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
}
function idFor(type, id) { return `${clean(type, 'object', 80)}:${clean(id, '', 180)}`; }
function now() { return Date.now(); }
function pointer(input = {}) {
  const v = obj(input, input || {});
  return { type: clean(v.type || v.entityType || 'object', 'object', 80), id: clean(v.id || v.entityId || '', '', 180), label: clean(v.label || v.title || v.name || '', '', 220) };
}
function normalizeObject(input = {}) {
  const body = obj(input, input);
  const type = clean(body.type || body.objectType || body.entityType || 'object', 'object', 80);
  const id = clean(body.id || body.objectId || body.entityId || `${type}_${now()}`, '', 180);
  return {
    key: idFor(type, id), type, id,
    title: clean(body.title || body.name || id, id, 220),
    summary: clean(body.summary || body.description || '', '', 2000),
    creator: pointer(body.creator || body.actor || { type: 'alias', id: body.creatorAliasId || body.actorAliasId || '' }),
    metadata: obj(body.metadata || body.meta), permissions: obj(body.permissions), renderer: obj(body.renderer),
    relationships: arr(body.relationships).map(pointer).slice(0, 120), tags: arr(body.tags).map(x => clean(x, '', 80)).filter(Boolean).slice(0, 80),
    createdAt: Number(body.createdAt || 0) || now(), updatedAt: now(), lifecycle: clean(body.lifecycle || 'active', 'active', 40)
  };
}
module.exports = { clean, obj, arr, pointer, normalizeObject, idFor };
