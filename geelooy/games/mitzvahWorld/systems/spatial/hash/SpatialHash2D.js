// B"H
/**
 * @file SpatialHash2D.js
 * @description Chapter 448: the world stops asking every creature where every
 * other creature is. The Awtsmoos makes proximity local, humble, and fast.
 */
import { visitAabbCells, visitCircleCells } from "./cellKey.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export class SpatialHash2D {
  constructor({ cellSize = 10 } = {}) {
    this.cellSize = Math.max(0.001, cellSize);
    this.cells = new Map();
    this.queryStamp = 1;
    this.metrics = { upserts:0, removes:0, queries:0, candidates:0, hits:0 };
  }
  clear() { this.cells.clear(); this.queryStamp = 1; }
  bucket(key) { let bucket = this.cells.get(key); if (!bucket) { bucket = new Set(); this.cells.set(key, bucket); } return bucket; }
  sameKeys(a, b) { return a.length === b.length && a.every((key, index) => key === b[index]); }
  keysForCircle(x, z, radius) { const keys = []; visitCircleCells(x, z, radius, this.cellSize, (_ix, _iz, key) => keys.push(key)); return keys; }
  upsert(handle, x, z, radius = handle.radius) {
    const r = Math.max(0, radius || 0), nextKeys = this.keysForCircle(x, z, r);
    handle.updatePose?.(x, z, r); if (!this.sameKeys(handle._spatialKeys || [], nextKeys)) this.replaceKeys(handle, nextKeys);
    this.metrics.upserts += 1; return handle;
  }
  replaceKeys(handle, nextKeys) { this.remove(handle); handle._spatialKeys = nextKeys; for (const key of nextKeys) this.bucket(key).add(handle); }
  remove(handle) {
    for (const key of handle._spatialKeys || []) { const bucket = this.cells.get(key); if (bucket) { bucket.delete(handle); if (!bucket.size) this.cells.delete(key); } }
    handle._spatialKeys = []; this.metrics.removes += 1;
  }
  nextStamp() { this.queryStamp = this.queryStamp >= 2147483647 ? 1 : this.queryStamp + 1; return this.queryStamp; }
  visitBucket(key, stamp, visitor, accept = null) {
    const bucket = this.cells.get(key); if (!bucket) return 0; let hits = 0;
    for (const handle of bucket) {
      if (handle._spatialQueryStamp === stamp) continue; handle._spatialQueryStamp = stamp; this.metrics.candidates += 1;
      if (accept && !accept(handle)) continue; hits += 1; this.metrics.hits += 1; if (visitor(handle) === false) break;
    }
    return hits;
  }
  queryCircle(x, z, radius, visitor) {
    const stamp = this.nextStamp(), r = Math.max(0, radius || 0); let hits = 0; this.metrics.queries += 1;
    visitCircleCells(x, z, r, this.cellSize, (_ix, _iz, key) => { hits += this.visitBucket(key, stamp, visitor, h => ((h.x - x) ** 2 + (h.z - z) ** 2) <= (r + h.radius) ** 2); });
    return hits;
  }
  queryAabb(minX, minZ, maxX, maxZ, visitor) {
    const stamp = this.nextStamp(); let hits = 0; this.metrics.queries += 1;
    visitAabbCells(minX, minZ, maxX, maxZ, this.cellSize, (_ix, _iz, key) => { hits += this.visitBucket(key, stamp, visitor); });
    return hits;
  }
  snapshot() { return { cellSize:this.cellSize, cells:this.cells.size, ...this.metrics }; }
}
export default SpatialHash2D;
