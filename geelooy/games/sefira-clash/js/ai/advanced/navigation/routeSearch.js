/**
 * B"H
 * Route search.
 * The Awtsmoos opens a path only when the stones truly connect; if no path is
 * found, the bot receives honest exile instead of fake confidence.
 */
export function findPlatformRoute(graph, startId, goalId) {
  if (startId === goalId) return { found: true, nodes: [startId], edges: [] };
  const queue = [startId];
  const prev = new Map([[startId, null]]);
  const via = new Map();
  for (let i = 0; i < queue.length; i++) {
    const node = queue[i];
    for (const edge of graph.edges[node] || []) {
      if (prev.has(edge.to)) continue;
      prev.set(edge.to, node);
      via.set(edge.to, edge);
      if (edge.to === goalId) return unwind(prev, via, goalId);
      queue.push(edge.to);
    }
  }
  return { found: false, nodes: [startId], edges: [] };
}

export function nextRouteStep(graph, route) {
  if (!route.found || !route.edges.length) return null;
  const edge = route.edges[0];
  return { edge, from: graph.nodes[edge.from], to: graph.nodes[edge.to], action: edge.action, targetX: edge.launchX };
}

function unwind(prev, via, goalId) {
  const nodes = [goalId];
  const edges = [];
  let at = goalId;
  while (prev.get(at) !== null) {
    const edge = via.get(at);
    edges.push(edge);
    at = prev.get(at);
    nodes.push(at);
  }
  return { found: true, nodes: nodes.reverse(), edges: edges.reverse() };
}
