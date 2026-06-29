// B"H
// Uniform grid is a humble map of where sparks dwell.
export function createUniformGrid(cell = 128) {
  const cells = new Map();
  const key = (x, y) => `${Math.floor(x / cell)},${Math.floor(y / cell)}`;
  function clear() { cells.clear(); }
  function add(item, x, y) { const k = key(x, y), list = cells.get(k) || []; list.push(item); cells.set(k, list); }
  function nearby(x, y) { return cells.get(key(x, y)) || []; }
  return { clear, add, nearby, size: () => cells.size };
}
