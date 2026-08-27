// B"H
/**
 * @module CivilizationEventSchema
 * @description Chapter 546: one event DNA for windows, files, posts, agents,
 * governance, memory, and every spark that asks to become civilization.
 */

function clean(value, fallback = '', max = 1000) {
  return String(value ?? fallback).replace(/[<>]/g, '').trim().slice(0, max);
}
function obj(value, fallback = {}) {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  try { const parsed = JSON.parse(value || '{}'); return parsed && typeof parsed === 'object' ? parsed : fallback; }
  catch { return fallback; }
}
function arr(value) {
  if (Array.isArray(value)) return value;
  try { const parsed = JSON.parse(value || '[]'); return Array.isArray(parsed) ? parsed : []; }
  catch { return []; }
}
function pointer(input = {}) {
  const value = obj(input, input || {});
  return { type: clean(value.type || value.entityType || 'unknown', 'unknown', 80), id: clean(value.id || value.entityId || '', '', 180), aliasId: clean(value.aliasId || '', '', 180) };
}
function makeId(type) {
  return `civ_${clean(type, 'event', 60)}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
function normalizeEvent(input = {}) {
  const body = obj(input, input);
  const type = clean(body.type || body.eventType || 'civilization.event', 'civilization.event', 120);
  const createdAt = Number(body.createdAt || 0) || Date.now();
  return {
    id: clean(body.id || makeId(type), '', 180), type, createdAt, updatedAt: Date.now(),
    actor: pointer(body.actor || { type: 'alias', id: body.actorAliasId || body.actor || '' }),
    target: pointer(body.target || { type: body.targetType || body.entityType, id: body.targetId || body.entityId, aliasId: body.targetAliasId }),
    parents: arr(body.parents).map(pointer).slice(0, 20), children: arr(body.children).map(pointer).slice(0, 20), related: arr(body.related).map(pointer).slice(0, 40),
    context: obj(body.context), payload: obj(body.payload || body.data), permissions: obj(body.permissions), references: arr(body.references).map(pointer).slice(0, 60),
    visibility: clean(body.visibility || 'public', 'public', 40), priority: Number(body.priority || 0) || 0,
    lifecycle: clean(body.lifecycle || 'active', 'active', 40), targetAliases: arr(body.targetAliases || body.toAliases).map(x => clean(x, '', 180)).filter(Boolean).slice(0, 100)
  };
}
module.exports = { clean, obj, arr, pointer, normalizeEvent };
