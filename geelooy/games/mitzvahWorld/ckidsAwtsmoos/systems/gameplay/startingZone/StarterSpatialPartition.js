// B"H
import { dist } from "./StarterMath.js";

/**
 * Tiny spatial hash standing in front of heavier octree/raycast systems.
 *
 * Static world geometry can still live in the real octree. This hash keeps
 * high-churn gameplay checks cheap: target queries, hostile wakeups, doors,
 * and nearby NPC service bubbles only look inside a few cells.
 */
export class StarterSpatialPartition {
  constructor(cellSize = 32) {
    this.cellSize = cellSize;
    this.cells = new Map();
    this.inserted = 0;
  }

  key(position) {
    return `${Math.floor((position?.x || 0) / this.cellSize)}:${Math.floor((position?.z || 0) / this.cellSize)}`;
  }

  insert(entity) {
    const key = this.key(entity.position);
    if (!this.cells.has(key)) this.cells.set(key, []);
    this.cells.get(key).push(entity);
    this.inserted++;
    return entity;
  }

  rebuild(entities = []) {
    this.cells.clear();
    this.inserted = 0;
    for (const entity of entities) if (entity?.position) this.insert(entity);
    return this;
  }

  queryRadius(position, radius) {
    const out = [];
    const span = Math.ceil(radius / this.cellSize);
    const cx = Math.floor((position?.x || 0) / this.cellSize);
    const cz = Math.floor((position?.z || 0) / this.cellSize);
    for (let x = cx - span; x <= cx + span; x++) {
      for (let z = cz - span; z <= cz + span; z++) {
        for (const entity of this.cells.get(`${x}:${z}`) || []) {
          if (dist(position, entity.position) <= radius) out.push(entity);
        }
      }
    }
    return out;
  }

  stats() {
    return { kind:"spatial-hash-near-octree-front", cellSize:this.cellSize, cells:this.cells.size, inserted:this.inserted };
  }
}

export default StarterSpatialPartition;
