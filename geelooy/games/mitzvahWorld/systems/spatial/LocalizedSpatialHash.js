// B"H
import { boxFromCenter, hashCell, readBox, intersects, tmpBox } from './SpatialMath.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11';

/** Moving things enter nearby buckets only; memory stays local and reusable. */
export class LocalizedSpatialHash {
  constructor(cellSize = 8) {
    this.cellSize = cellSize;
    this.cells = new Map();
    this.itemCells = new Map();
    this.queryBox = tmpBox();
    this.candidateBox = tmpBox();
    this.keyScratch = [];
  }

  cell(value) { return Math.floor(value / this.cellSize); }

  keysFor(box, out = []) {
    out.length = 0;
    for (let x = this.cell(box.minX); x <= this.cell(box.maxX); x += 1)
      for (let y = this.cell(box.minY); y <= this.cell(box.maxY); y += 1)
        for (let z = this.cell(box.minZ); z <= this.cell(box.maxZ); z += 1) out.push(hashCell(x, y, z));
    return out;
  }

  insert(id, item) {
    const keys = this.keysFor(readBox(item, this.queryBox), []);
    this.itemCells.set(id, keys);
    for (const key of keys) {
      if (!this.cells.has(key)) this.cells.set(key, new Set());
      this.cells.get(key).add(id);
    }
    return id;
  }

  remove(id) {
    for (const key of this.itemCells.get(id) || []) {
      const set = this.cells.get(key);
      if (!set) continue;
      set.delete(id);
      if (!set.size) this.cells.delete(key);
    }
    this.itemCells.delete(id);
  }

  update(id, item) { this.remove(id); return this.insert(id, item); }

  queryNear(center, radius, resolve, out = []) {
    out.length = 0;
    const seen = new Set();
    const box = boxFromCenter(center, radius, this.queryBox);
    for (const key of this.keysFor(box, this.keyScratch)) for (const id of this.cells.get(key) || []) {
      if (seen.has(id)) continue;
      seen.add(id);
      const item = resolve ? resolve(id) : id;
      if (!item || intersects(readBox(item, this.candidateBox), box)) out.push(item);
    }
    return out;
  }

  clearFar(center, radius) {
    const keep = new Set(this.keysFor(boxFromCenter(center, radius, this.queryBox), this.keyScratch));
    for (const key of [...this.cells.keys()]) if (!keep.has(key)) this.cells.delete(key);
  }
}

export default LocalizedSpatialHash;
