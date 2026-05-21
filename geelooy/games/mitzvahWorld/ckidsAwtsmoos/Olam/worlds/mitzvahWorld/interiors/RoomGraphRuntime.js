/**
 * B"H
 * Chapter 23: Every Room Became A Letter.
 */

export class RoomGraphRuntime {
  constructor(edges = []) {
    this.edges = edges;
  }

  neighbors(roomId) {
    return this.edges
      .filter(edge => edge.from === roomId || edge.to === roomId)
      .map(edge => edge.from === roomId ? edge.to : edge.from);
  }

  canMove(from, to) {
    return this.neighbors(from).includes(to);
  }

  path(from, to) {
    const queue = [[from]];
    const seen = new Set([from]);

    while (queue.length) {
      const path = queue.shift();
      const here = path.at(-1);
      if (here === to) return path;

      for (const next of this.neighbors(here)) {
        if (seen.has(next)) continue;
        seen.add(next);
        queue.push([...path, next]);
      }
    }

    return [];
  }
}

export default RoomGraphRuntime;
