/**
 * B"H
 * Cached route search.
 *
 * Chapter 232: the stones do not need to rediscover the same path every breath.
 * The first search opens the gate; later bots drink from the cached route until
 * the graph itself changes. Intelligence remains, waste is burned away.
 */
export function findPlatformRoute(graph, startId, goalId) {
  graph.__routeCache ||= new Map();
  const key = `${startId}->${goalId}`;
  if (graph.__routeCache.has(key)) return graph.__routeCache.get(key);
  const route = searchRoute(graph, startId, goalId);
  graph.__routeCache.set(key, route);
  return route;
}

export function nextRouteStep(graph, route) {
  if (!route.found || !route.edges.length) return null;
  const edge = route.edges[0];
  return { edge, from: graph.nodes[edge.from], to: graph.nodes[edge.to], action: edge.action, targetX: edge.launchX };
}

function searchRoute(graph, startId, goalId) {
  if (startId === goalId) return freezeRoute({ found: true, nodes: [startId], edges: [] });
  const queue = [startId];
  const prev = new Map([[startId, null]]);
  const via = new Map();
  for (let i = 0; i < queue.length; i++) {
    const node = queue[i];
    for (const edge of graph.edges[node] || []) {
      if (prev.has(edge.to)) continue;
      prev.set(edge.to, node);
      via.set(edge.to, edge);
      if (edge.to === goalId) return freezeRoute(unwind(prev, via, goalId));
      queue.push(edge.to);
    }
  }
  return freezeRoute({ found: false, nodes: [startId], edges: [] });
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

function freezeRoute(route) {
  Object.freeze(route.nodes);
  Object.freeze(route.edges);
  return Object.freeze(route);
}
