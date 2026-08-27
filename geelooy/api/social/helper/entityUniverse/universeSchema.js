// B"H
/**
 * @module UniverseSchema
 * @description
 * Chapter 161: The Awtsmoos breathes one recursive entity language over every
 * social object. A post, question, answer, comment, series, Heichel, mail
 * thread, asset, task, event, collection, or draft can all become a chamber with
 * children, edges, snapshots, and future civilizations inside it.
 */

const ENTITY_TYPES = new Set([
  'post', 'question', 'answer', 'comment', 'heichel', 'series', 'collection',
  'poll', 'event', 'project', 'task', 'notification', 'conversation',
  'mailThread', 'asset', 'draft', 'profile', 'world'
]);

const NODE_TYPES = new Set(['root', 'verse', 'section', 'subsection', 'segment', 'media', 'quote', 'question', 'answer', 'note']);
const EDGE_TYPES = new Set(['references', 'answers', 'quotes', 'derivedFrom', 'forkedFrom', 'mergedInto', 'translates', 'extends', 'opposes', 'supports', 'contains', 'dependsOn', 'duplicates', 'corrects', 'respondsTo', 'mentions', 'usesAsset']);

function clean(value, fallback = '', max = 8000) {
  return String(value ?? fallback).replace(/[<>]/g, '').trim().slice(0, max);
}

function array(value) {
  if (Array.isArray(value)) return value;
  try { return JSON.parse(value || '[]'); } catch { return []; }
}

function object(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function makeId(prefix = 'entity') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function normalizeType(type) {
  const value = clean(type || 'post', 'post', 80);
  return ENTITY_TYPES.has(value) ? value : 'post';
}

function normalizeNode(node = {}, index = 0, depth = 0) {
  const type = NODE_TYPES.has(clean(node.type || node.nodeType || '', '', 50)) ? clean(node.type || node.nodeType, 'section', 50) : (depth === 0 ? 'root' : 'section');
  const id = clean(node.id || node.nodeId || `${type}_${index + 1}`, '', 100);
  return {
    id,
    type,
    title: clean(node.title || node.label || '', '', 240),
    content: clean(node.content || node.text || node.html || '', '', 50000),
    html: clean(node.html || node.content || node.text || '', '', 50000),
    assets: array(node.assets).map(asset => object(asset)).filter(Boolean).slice(0, 60),
    options: object(node.options),
    order: Number.isFinite(Number(node.order)) ? Number(node.order) : index,
    children: array(node.children || node.segments || node.subsections).map((child, childIndex) => normalizeNode(child, childIndex, depth + 1))
  };
}

function normalizeEntity(input = {}) {
  const type = normalizeType(input.type || input.entityType || input.contentType);
  const id = clean(input.id || input.entityId || input.postId || input.questionId || input.answerId || '', '', 120) || makeId(type);
  const nodes = array(input.nodes || input.contentNodes || input.sections || input.verses).map((node, index) => normalizeNode(node, index, 0));
  return {
    id,
    type,
    mode: nodes.length ? 'recursive' : clean(input.mode || input.entityMode || 'plain', 'plain', 40),
    heichelId: clean(input.heichelId || input.worldId || '', '', 120),
    seriesId: clean(input.seriesId || input.parentSeriesId || 'root', 'root', 120),
    aliasId: clean(input.aliasId || input.author || input.ownerAlias || '', '', 120),
    parentId: clean(input.parentId || input.parentEntityId || input.parentQuestionId || '', '', 120),
    title: clean(input.title || input.name || '', '', 240),
    summary: clean(input.summary || input.description || input.content || input.rootContent || '', '', 5000),
    rootContent: clean(input.rootContent || input.content || input.description || '', '', 50000),
    rootAssets: array(input.rootAssets || input.assets).map(asset => object(asset)).filter(Boolean).slice(0, 80),
    nodes,
    options: object(input.options),
    visibility: clean(input.visibility || 'public', 'public', 40),
    status: clean(input.status || 'active', 'active', 40),
    createdAt: Number(input.createdAt || 0) || Date.now(),
    updatedAt: Date.now()
  };
}

function entityPointer(input = {}) {
  if (typeof input === 'string') return { id: input, type: 'post' };
  return { id: clean(input.id || input.entityId || input.postId || '', '', 120), type: normalizeType(input.type || input.entityType || input.contentType), heichelId: clean(input.heichelId || '', '', 120), seriesId: clean(input.seriesId || '', '', 120) };
}

module.exports = { ENTITY_TYPES, NODE_TYPES, EDGE_TYPES, clean, array, object, makeId, normalizeEntity, normalizeNode, entityPointer };
