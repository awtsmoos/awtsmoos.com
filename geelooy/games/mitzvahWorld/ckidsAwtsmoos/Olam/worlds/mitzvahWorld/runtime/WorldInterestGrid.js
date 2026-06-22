// B"H
/**
 * @file WorldInterestGrid.js
 * @description
 * Coarse spatial hashing for the living world. The Awtsmoos lets one village
 * breathe without every soul searching every other soul. Nearby cells answer
 * nearest queries; far cells sleep until called.
 */
const DEFAULT_CELL = 18;
const keyOf = (x, z, cell) => `${Math.floor(x / cell)}:${Math.floor(z / cell)}`;
const pos = e => e?.mesh?.position || e?.position || null;
const idOf = e => e?.id || e?.name || e?.mesh?.name || e?.mesh?.userData?.npcId || "entity";

export class WorldInterestGrid {
  constructor(cellSize = DEFAULT_CELL) { this.cellSize = cellSize; this.cells = new Map(); this.index = new Map(); this.version = 0; }
  clear() { this.cells.clear(); this.index.clear(); this.version += 1; }
  insert(entity) { const p = pos(entity); if (!p) return false; const key = keyOf(p.x || 0, p.z || 0, this.cellSize), id = idOf(entity); if (!this.cells.has(key)) this.cells.set(key, new Set()); this.cells.get(key).add(entity); this.index.set(id, { key, entity }); this.version += 1; return true; }
  rebuild(entities = []) { this.clear(); for (const e of entities) this.insert(e); return this; }
  nearby(position, radius = this.cellSize) { if (!position) return []; const out = [], cell = this.cellSize, cx = Math.floor((position.x || 0) / cell), cz = Math.floor((position.z || 0) / cell), r = Math.ceil(radius / cell); for (let x = cx - r; x <= cx + r; x++) for (let z = cz - r; z <= cz + r; z++) for (const e of this.cells.get(`${x}:${z}`) || []) out.push(e); return out; }
  nearest(position, predicate = () => true, radius = this.cellSize * 1.5) { let best = null, bestD = Infinity; for (const e of this.nearby(position, radius)) { if (!predicate(e)) continue; const p = pos(e); if (!p) continue; const dx = (p.x || 0) - (position.x || 0), dz = (p.z || 0) - (position.z || 0), d = dx * dx + dz * dz; if (d < bestD && d <= radius * radius) { best = e; bestD = d; } } return best; }
  report() { return { cells:this.cells.size, indexed:this.index.size, cellSize:this.cellSize, version:this.version }; }
}
export function getWorldInterestGrid(olam, cellSize = DEFAULT_CELL) { olam.__worldInterestGrid ||= new WorldInterestGrid(cellSize); return olam.__worldInterestGrid; }
export default WorldInterestGrid;
