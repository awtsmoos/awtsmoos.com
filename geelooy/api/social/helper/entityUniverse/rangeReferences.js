// B"H
/**
 * @module RangeReferences
 * @description
 * Chapter 172: A post can now carry living windows of Torah-like structure from
 * any other entity: same Heichel, another Heichel, another series, another post,
 * a question, an answer, or even a mail-thread entity. The referenced nodes are
 * not copied blindly; they resolve back to the source so source comments remain
 * attached and navigable.
 */

const { er } = require('../general.js');
const { normalizeEntity, entityPointer, clean, array } = require('./universeSchema.js');
const { getEntity, linkEntities, writeEntity } = require('./universeStore.js');

function flattenNodes(nodes = [], ancestry = []) {
  const out = [];
  for (const node of nodes || []) {
    const path = [...ancestry, node.id].filter(Boolean);
    out.push({ ...node, path, children: node.children || [] });
    out.push(...flattenNodes(node.children || [], path));
  }
  return out;
}

function inRange(node, ref) {
  const start = clean(ref.startNodeId || ref.fromNodeId || '', '', 120);
  const end = clean(ref.endNodeId || ref.toNodeId || '', '', 120);
  if (!start && !end) return true;
  if (node.id === start || node.id === end) return true;
  if (start && !end) return node.id === start || node.path.includes(start);
  return false;
}

function commentPointer({ source, node }) {
  return {
    heichelId: source.heichelId,
    entityId: source.id,
    postId: source.id,
    verseSection: node.id,
    commentTreeUrl: `/comment-thread/?heichel=${encodeURIComponent(source.heichelId || '')}&post=${encodeURIComponent(source.id)}&verse=${encodeURIComponent(node.id)}`
  };
}

async function resolveRangeReference({ $i, reference }) {
  const source = entityPointer(reference.source || reference);
  const got = await getEntity({ $i, type: source.type, id: source.id });
  if (!got.success) return got;
  const sourceEntity = got.success;
  const flat = flattenNodes(sourceEntity.nodes || []);
  const selected = flat.filter(node => inRange(node, reference)).slice(0, Number(reference.limit || 40));
  return { success: {
    id: clean(reference.id || `range_${sourceEntity.type}_${sourceEntity.id}_${Date.now()}`, '', 160),
    kind: 'rangeReference',
    source: { type: sourceEntity.type, id: sourceEntity.id, heichelId: sourceEntity.heichelId, seriesId: sourceEntity.seriesId, title: sourceEntity.title },
    selector: { startNodeId: reference.startNodeId || reference.fromNodeId || '', endNodeId: reference.endNodeId || reference.toNodeId || '', limit: Number(reference.limit || 40) },
    nodes: selected.map(node => ({ id: node.id, type: node.type, title: node.title, content: node.content, html: node.html, assets: node.assets || [], path: node.path, sourceCommentPointer: commentPointer({ source: sourceEntity, node }) })),
    resolvedAt: Date.now()
  }};
}

async function attachRangeReference({ $i, target, reference }) {
  const targetPointer = entityPointer(target);
  const gotTarget = await getEntity({ $i, type: targetPointer.type, id: targetPointer.id });
  if (!gotTarget.success) return gotTarget;
  const resolved = await resolveRangeReference({ $i, reference });
  if (!resolved.success) return resolved;
  const entity = normalizeEntity(gotTarget.success);
  const refNode = {
    id: resolved.success.id,
    type: 'quote',
    title: `Referenced: ${resolved.success.source.title}`,
    content: `Loaded range from ${resolved.success.source.type}/${resolved.success.source.id}`,
    html: '',
    assets: [],
    options: { reference: resolved.success, liveReference: true },
    order: entity.nodes.length,
    children: resolved.success.nodes.map((node, index) => ({ id: `${resolved.success.id}_${node.id}`, type: node.type || 'section', title: node.title, content: node.content, html: node.html, assets: node.assets, options: { sourceNodeId: node.id, sourceCommentPointer: node.sourceCommentPointer }, order: index, children: [] }))
  };
  entity.nodes.push(refNode);
  entity.mode = 'recursive';
  const written = await writeEntity({ $i, input: entity });
  await linkEntities({ $i, from: targetPointer, to: resolved.success.source, kind: 'references', note: `range:${resolved.success.id}`, actorAlias: entity.aliasId });
  return { success: { target: written.success, reference: resolved.success, insertedNode: refNode } };
}

function referencesFromBody(body = {}) {
  return array(body.references || body.rangeReferences).map(item => typeof item === 'string' ? { source: { id: item, type: 'post' } } : item);
}

module.exports = { flattenNodes, resolveRangeReference, attachRangeReference, referencesFromBody };
