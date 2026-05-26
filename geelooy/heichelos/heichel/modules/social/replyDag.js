//B"H
import { EDGE_TYPES } from './edgeTypes.js';
import { normalizeTarget, targetKey } from './targets.js';

export function createReplyEdge({ from, to, edgeType = EDGE_TYPES.RESPONDS_TO } = {}) {
  return { from: normalizeTarget(from), to: normalizeTarget(to), edgeType };
}

export function groupReplyEdges(edges = []) {
  return (Array.isArray(edges) ? edges : []).reduce((map, edge) => {
    const key = targetKey(edge.to);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(edge);
    return map;
  }, new Map());
}
