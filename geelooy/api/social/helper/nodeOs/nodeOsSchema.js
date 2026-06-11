// B"H
/**
 * @module NodeOsSchema
 * @description
 * Chapter 185: A node is the shared body of the social filesystem. It can be a
 * post, verse, comment section, image, audio file, Heichel, series, mail thread,
 * or legacy shadow. Every node offers read/write/children/history/permissions.
 */

function clean(value, fallback = '', max = 4000) {
  return String(value ?? fallback).replace(/[<>]/g, '').trim().slice(0, max);
}

function nodeIdFrom(kind, id) {
  return `${clean(kind, 'node', 80)}_${Buffer.from(String(id || Date.now())).toString('base64url').slice(0, 120)}`;
}

function normalizeNode(input = {}) {
  const kind = clean(input.kind || input.type || 'node', 'node', 80);
  const id = clean(input.id || input.nodeId || nodeIdFrom(kind, input.sourceId || input.path || Date.now()), '', 160);
  return {
    id,
    kind,
    title: clean(input.title || input.name || id, id, 240),
    path: clean(input.path || '/', '/', 900),
    source: input.source && typeof input.source === 'object' ? input.source : {},
    mime: clean(input.mime || '', '', 120),
    size: Number(input.size || 0),
    content: clean(input.content || input.text || input.summary || '', '', 50000),
    publicPath: clean(input.publicPath || input.url || '', '', 900),
    parentId: clean(input.parentId || '', '', 160),
    permissions: input.permissions && typeof input.permissions === 'object' ? input.permissions : { read: 'public', write: 'owner' },
    meta: input.meta && typeof input.meta === 'object' ? input.meta : {},
    createdAt: Number(input.createdAt || 0) || Date.now(),
    updatedAt: Date.now()
  };
}

function childPointer(node) {
  return { id: node.id, kind: node.kind, title: node.title, path: node.path };
}

module.exports = { clean, nodeIdFrom, normalizeNode, childPointer };
