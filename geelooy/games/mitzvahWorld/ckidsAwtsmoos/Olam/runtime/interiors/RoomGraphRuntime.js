/**
 * B"H
 * @file RoomGraphRuntime.js
 *
 * Chapter 28: The Rooms Held Hands In The Dark.
 *
 * A house is not real until its rooms know one another. The Awtsmoos draws a
 * graph through walls, stairs, exits, and thresholds, letting runtime reject
 * orphaned chambers before the player falls into architectural silence.
 */

/**
 * Builds a room graph from declarative room definitions.
 * @param {Array<{id:string, exits?:string[]}>} rooms Room definitions.
 * @returns {Map<string, Set<string>>} Adjacency graph.
 */
export function buildRoomGraph(rooms = []) {
  const graph = new Map();
  rooms.forEach(room => graph.set(room.id, new Set(room.exits || [])));
  return graph;
}

/**
 * Validates that every exit target exists and every room is reachable.
 * @param {Array<{id:string, exits?:string[]}>} rooms Room definitions.
 * @param {string} startId Starting room id.
 * @returns {{ok:boolean, reachable:string[]}} Validation report.
 */
export function validateRoomGraph(rooms = [], startId = rooms[0]?.id) {
  const graph = buildRoomGraph(rooms);
  if (!startId || !graph.has(startId)) throw new Error('Room graph needs a valid start room.');

  for (const [id, exits] of graph.entries()) {
    exits.forEach(target => {
      if (!graph.has(target)) throw new Error(`Room ${id} exits to missing room ${target}`);
    });
  }

  const visited = new Set();
  const stack = [startId];
  while (stack.length) {
    const id = stack.pop();
    if (visited.has(id)) continue;
    visited.add(id);
    graph.get(id).forEach(next => stack.push(next));
  }

  if (visited.size !== graph.size) throw new Error('Room graph contains unreachable rooms.');
  return { ok: true, reachable: [...visited] };
}
