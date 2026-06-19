// B"H
import { boxFromCenter, tmpBox } from './SpatialMath.js';
import LocalizedSpatialHash from './LocalizedSpatialHash.js';
import StaticOctree from './StaticOctree.js';

/** One gate for nearby static solids and moving life. */
export class NearbySpatialIndex {
  constructor(bounds, options = {}) {
    this.moving = new LocalizedSpatialHash(options.cellSize || 8);
    this.staticTree = new StaticOctree(bounds, options);
    this.items = new Map();
    this.box = tmpBox();
  }

  addStatic(item) { this.staticTree.insert(item); return item; }

  upsertMoving(id, item) {
    this.items.set(id, item);
    this.moving.update(id, item);
    return item;
  }

  removeMoving(id) {
    this.items.delete(id);
    this.moving.remove(id);
  }

  query(center, radius, out = { static: [], moving: [] }) {
    out.static.length = 0;
    out.moving.length = 0;
    this.staticTree.query(boxFromCenter(center, radius, this.box), out.static);
    this.moving.queryNear(center, radius, id => this.items.get(id), out.moving);
    return out;
  }

  stats() {
    const staticStats = this.staticTree.stats();
    return { staticItems: staticStats.items, staticNodes: staticStats.nodes, movingItems: this.items.size, movingCells: this.moving.cells.size };
  }
}

export default NearbySpatialIndex;
