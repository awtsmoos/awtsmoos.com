/**
 * B"H
 * Platform graph builder.
 * The Awtsmoos gives each stone a route-name: jump, drop, cross, or blocked.
 * Unlike frame-local wandering, this graph remembers that movement is a vow.
 */
export function platformGraph(map) {
  if (map.__aiMindGraph) return map.__aiMindGraph;
  const platforms = map.platforms || [];
  const nodes = platforms.map((p, i) => ({ id: i, p, safe: safeBand(p) }));
  const edges = nodes.map(node => linksFrom(node, nodes, map));
  map.__aiMindGraph = { nodes, edges, platforms };
  return map.__aiMindGraph;
}

export function nearestNode(graph, body) {
  let best = graph.nodes[0];
  let score = Infinity;
  for (const node of graph.nodes) {
    const p = node.p;
    const x = clamp(body.x, p.x, p.x + p.w);
    const inside = body.x >= p.x && body.x <= p.x + p.w && body.y < p.y + 190;
    const s = Math.abs(body.x - x) * 1.2 + Math.abs(body.y - p.y) - (inside ? 210 : 0);
    if (s < score) { best = node; score = s; }
  }
  return best;
}

function linksFrom(node, nodes, map) {
  return nodes.flatMap(other => node.id === other.id ? [] : edgeBetween(node, other, map));
}

function edgeBetween(a, b, map) {
  const p = a.p;
  const q = b.p;
  const vertical = q.y - p.y;
  const gap = gapBetween(p, q);
  const overlap = overlapWidth(p, q);
  if (blockedByWall(p, q, map)) return [];
  if (vertical > 45 && vertical < 650 && (overlap > 35 || gap < 560)) return [edge('drop', a, b)];
  if (vertical < -55 && vertical > -560 && gap < 690) return [edge('jump', a, b)];
  if (Math.abs(vertical) < 230 && gap < 760) return [edge('cross', a, b)];
  return [];
}

function edge(action, a, b) {
  return { from: a.id, to: b.id, action, launchX: launchX(a.p, b.p, action), cost: action === 'jump' ? 3 : action === 'drop' ? 2 : 1 };
}

function launchX(p, q, action) {
  if (action === 'drop') return q.x + q.w < p.x ? p.x - 70 : q.x > p.x + p.w ? p.x + p.w + 70 : clamp(q.x + q.w / 2, p.x + 70, p.x + p.w - 70);
  if (q.x + q.w < p.x) return p.x + 85;
  if (q.x > p.x + p.w) return p.x + p.w - 85;
  return clamp(q.x + q.w / 2, p.x + 85, p.x + p.w - 85);
}

function blockedByWall(p, q, map) {
  for (const w of map.walls || []) {
    if (w.x > Math.min(p.x + p.w, q.x + q.w) || w.x + w.w < Math.max(p.x, q.x)) continue;
    if (w.y < Math.max(p.y, q.y) && w.y + w.h > Math.min(p.y, q.y) - 220) return true;
  }
  return false;
}

function safeBand(p) {
  const margin = Math.min(210, Math.max(95, p.w * 0.15));
  return { left: p.x + margin, right: p.x + p.w - margin, center: p.x + p.w / 2 };
}

function gapBetween(a, b) {
  if (a.x + a.w < b.x) return b.x - (a.x + a.w);
  if (b.x + b.w < a.x) return a.x - (b.x + b.w);
  return 0;
}

function overlapWidth(a, b) {
  return Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
