// B"H
/**
 * @file SpatialHandle.js
 * @description Chapter 447: every moving spark receives a small passport. The
 * Awtsmoos lets the hash remember where the being was, so removal is not a
 * frantic search through every bucket of existence.
 */
let nextHandleId = 1;
export class SpatialHandle {
  constructor({ id = null, kind = "entity", entity = null, radius = 1 } = {}) {
    this.id = id || `spatial-${nextHandleId++}`;
    this.kind = kind;
    this.entity = entity;
    this.radius = Math.max(0, radius || 0);
    this.x = 0;
    this.z = 0;
    this._spatialKeys = [];
    this._spatialQueryStamp = 0;
  }
  updatePose(x, z, radius = this.radius) {
    this.x = x;
    this.z = z;
    this.radius = Math.max(0, radius || 0);
    return this;
  }
}
export default SpatialHandle;
