// B"H
import { containsBox, intersects, readBox, tmpBox } from './SpatialMath.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11';

function childBox(b, i) {
  const mx = (b.minX + b.maxX) / 2, my = (b.minY + b.maxY) / 2, mz = (b.minZ + b.maxZ) / 2;
  return { minX: i & 1 ? mx : b.minX, maxX: i & 1 ? b.maxX : mx, minY: i & 2 ? my : b.minY, maxY: i & 2 ? b.maxY : my, minZ: i & 4 ? mz : b.minZ, maxZ: i & 4 ? b.maxZ : mz };
}

/** Compact static octree: solid world meshes sleep in fixed leaves until queried. */
export class StaticOctree {
  constructor(bounds, options = {}) {
    this.bounds = bounds;
    this.maxDepth = options.maxDepth || 6;
    this.maxItems = options.maxItems || 12;
    this.depth = options.depth || 0;
    this.items = [];
    this.children = null;
    this.tmp = tmpBox();
  }

  childFor(box) { return (this.children || []).find(child => containsBox(child.bounds, box)); }

  insert(item) {
    const box = readBox(item, this.tmp);
    if (this.children) {
      const child = this.childFor(box);
      if (child) return child.insert(item);
    }
    this.items.push(item);
    if (!this.children && this.depth < this.maxDepth && this.items.length > this.maxItems) this.split();
    return item;
  }

  split() {
    this.children = Array.from({ length: 8 }, (_, i) => new StaticOctree(childBox(this.bounds, i), { maxDepth: this.maxDepth, maxItems: this.maxItems, depth: this.depth + 1 }));
    const keep = [];
    for (const item of this.items) {
      const child = this.childFor(readBox(item, this.tmp));
      child ? child.insert(item) : keep.push(item);
    }
    this.items = keep;
  }

  query(box, out = []) {
    if (!intersects(this.bounds, box)) return out;
    for (const item of this.items) if (intersects(readBox(item, this.tmp), box)) out.push(item);
    for (const child of this.children || []) child.query(box, out);
    return out;
  }

  stats() {
    const childStats = (this.children || []).map(child => child.stats());
    return { items: this.items.length + childStats.reduce((n, s) => n + s.items, 0), nodes: 1 + childStats.reduce((n, s) => n + s.nodes, 0) };
  }
}

export default StaticOctree;
