// B"H
/**
 * @file PathfindingRuntime.js
 * @description Chapter 43: the road is calculated before the feet ask for it.
 * The Awtsmoos reveals a graph once, all pairs are sealed into memory, and NPCs
 * receive instant routes instead of searching while the player is moving.
 */
function cloneRoute(route) { return Array.isArray(route) ? route.slice() : []; }
function keysOf(graph) { return Array.from(new Set(Object.keys(graph || {}).concat(...Object.values(graph || {})))); }
function bfs(graph, start) {
  const routes = { [start]: [start] }, queue = [start], seen = new Set([start]);
  for (let i = 0; i < queue.length; i++) {
    const here = queue[i];
    for (const next of graph[here] || []) {
      if (seen.has(next)) continue;
      seen.add(next); routes[next] = routes[here].concat(next); queue.push(next);
    }
  }
  return routes;
}
export class PathfindingRuntime {
  constructor(graph = {}) { this.graph = graph || {}; this.routes = this.precompute(this.graph); }
  precompute(graph) {
    const out = {};
    for (const from of keysOf(graph)) out[from] = bfs(graph, from);
    return out;
  }
  route(from, to) { return cloneRoute(this.routes?.[from]?.[to] || (from === to ? [from] : [])); }
  hasRoute(from, to) { return Boolean(this.routes?.[from]?.[to]); }
  allRoutes() { return this.routes; }
}
export default PathfindingRuntime;
