/**
 * B"H
 * Chapter 42: The Path Found Itself Under The Walker.
 */

export class PathfindingRuntime {
  constructor(graph = {}) {
    this.graph = graph;
  }

  route(from, to) {
    const queue = [[from]];
    const seen = new Set([from]);

    while (queue.length) {
      const route = queue.shift();
      const here = route.at(-1);
      if (here === to) return route;

      for (const next of this.graph[here] || []) {
        if (seen.has(next)) continue;
        seen.add(next);
        queue.push([...route, next]);
      }
    }

    return [];
  }
}

export default PathfindingRuntime;
