// B"H
/**
 * @module UniverseDna
 * @description
 * Chapter 163: Every entity carries DNA: ancestors, descendants, references,
 * citations, forks, merges, timeline, assets, and discussions. The DNA is
 * materialized from the recursive entity record and its graph edges.
 */

function idsFromNodes(nodes = []) {
  const ids = [];
  for (const node of nodes) {
    ids.push(node.id);
    ids.push(...idsFromNodes(node.children || []));
  }
  return ids.filter(Boolean);
}

function assetsFromNodes(nodes = []) {
  const assets = [];
  for (const node of nodes) {
    assets.push(...(node.assets || []));
    assets.push(...assetsFromNodes(node.children || []));
  }
  return assets.filter(Boolean);
}

function buildDna({ entity, inbound = [], outbound = [], children = [], snapshots = [], forks = [] }) {
  return {
    entityId: entity.id,
    entityType: entity.type,
    parentEntity: entity.parentId || '',
    ancestors: entity.parentId ? [entity.parentId] : [],
    descendants: children.map(child => child.id || child.entityId).filter(Boolean),
    contentNodes: idsFromNodes(entity.nodes || []),
    references: outbound.filter(edge => edge.kind === 'references' || edge.kind === 'mentions').map(edge => edge.to).filter(Boolean),
    citations: inbound.filter(edge => edge.kind === 'references' || edge.kind === 'quotes').map(edge => edge.from).filter(Boolean),
    forks: forks.map(fork => fork.id || fork.entityId).filter(Boolean),
    merges: outbound.filter(edge => edge.kind === 'mergedInto').map(edge => edge.to).filter(Boolean),
    timeline: snapshots.map(snapshot => ({ id: snapshot.id, createdAt: snapshot.createdAt, label: snapshot.label || snapshot.id })),
    assets: [...(entity.rootAssets || []), ...assetsFromNodes(entity.nodes || [])],
    discussions: [{ heichelId: entity.heichelId, entityId: entity.id, commentTree: true }],
    computedAt: Date.now()
  };
}

module.exports = { buildDna, idsFromNodes, assetsFromNodes };
