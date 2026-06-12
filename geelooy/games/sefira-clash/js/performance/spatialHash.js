/**
 * B"H
 * Spatial hash broad-phase.
 *
 * Chapter 247: instead of every body asking every other body where it stands,
 * the arena is divided into small chambers. Only nearby souls are compared.
 * This is cheaper than a quadtree for moving platform-fighter bodies and avoids
 * the allocation storms that made Android frames tremble.
 */
export class SpatialHash {
  constructor(cellSize = 260) {
    this.cellSize = cellSize;
    this.cells = new Map();
    this.seen = new Set();
  }

  clear() {
    this.cells.clear();
    this.seen.clear();
  }

  insert(entity, bounds = boundsFor(entity)) {
    const minX = this.key(bounds.left);
    const maxX = this.key(bounds.right);
    const minY = this.key(bounds.top);
    const maxY = this.key(bounds.bottom);
    for (let gx = minX; gx <= maxX; gx++) {
      for (let gy = minY; gy <= maxY; gy++) this.bucket(gx, gy).push(entity);
    }
  }

  queryCircle(x, y, radius) {
    this.seen.clear();
    const out = [];
    const minX = this.key(x - radius);
    const maxX = this.key(x + radius);
    const minY = this.key(y - radius);
    const maxY = this.key(y + radius);
    for (let gx = minX; gx <= maxX; gx++) {
      for (let gy = minY; gy <= maxY; gy++) collect(this, gx, gy, out);
    }
    return out;
  }

  key(value) { return Math.floor(value / this.cellSize); }
  bucket(x, y) {
    const key = `${x}:${y}`;
    let cell = this.cells.get(key);
    if (!cell) { cell = []; this.cells.set(key, cell); }
    return cell;
  }
}

export function buildFighterGrid(fighters, cellSize = 280) {
  const grid = new SpatialHash(cellSize);
  for (let i = 0; i < fighters.length; i++) {
    const f = fighters[i];
    if (!f.dead) grid.insert(f);
  }
  return grid;
}

export function boundsFor(f) {
  return { left: f.x - 90, right: f.x + 90, top: f.y - 190, bottom: f.y + 30 };
}

function collect(grid, gx, gy, out) {
  const cell = grid.cells.get(`${gx}:${gy}`);
  if (!cell) return;
  for (let i = 0; i < cell.length; i++) {
    const e = cell[i];
    if (grid.seen.has(e.id)) continue;
    grid.seen.add(e.id);
    out.push(e);
  }
}
