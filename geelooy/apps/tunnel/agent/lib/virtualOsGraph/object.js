// B"H
const T = require('./types.js');
function now() { return new Date().toISOString(); }
function id(type = 'object') { return `${T.valid(type)}:${Date.now().toString(36)}:${Math.random().toString(36).slice(2, 8)}`; }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function permission(input = {}) {
  const owner = input.owner || input.ownerId || 'current';
  const roles = input.roles || {};
  return { owner, roles:{ read:[owner], write:[owner], control:[owner], share:[owner], delete:[owner], watch:[owner], ...roles }, expiresAt:input.expiresAt || null };
}
function refs(input = {}) {
  return T.normalizeList(input.refs || input.references || input.children).map(String);
}
function object(input = {}) {
  const type = T.valid(input.type);
  return {
    id:input.id || id(type),
    type,
    title:input.title || input.name || input.id || 'Object',
    url:input.url || '',
    path:input.path || input.url || '',
    parentId:input.parentId || '',
    children:T.normalizeList(input.children).map(String),
    refs:refs(input),
    ownerId:input.ownerId || input.userId || 'current',
    permission:permission(input.permission || { owner:input.ownerId || 'current' }),
    data:{ ...(input.data || {}) },
    version:input.version || 1,
    createdAt:input.createdAt || now(),
    updatedAt:now()
  };
}
function mergeObject(old, input = {}) {
  const next = { ...old, ...input, data:{ ...(old.data || {}), ...(input.data || {}) } };
  next.type = T.valid(next.type);
  next.children = T.normalizeList(next.children).map(String);
  next.refs = refs(next);
  next.permission = permission(next.permission || { owner:next.ownerId });
  next.version = Number(old.version || 1) + 1;
  next.updatedAt = now();
  return next;
}
/**
 * B"H
 * Every object is a tiny world held in speech: title, path, permission, refs.
 * When it is touched, the old dust is not erased; it rises into versioned
 * memory, and the Awtsmoos lets the graph remember what changed.
 */
module.exports = { id, object, mergeObject, clone, now, permission };
