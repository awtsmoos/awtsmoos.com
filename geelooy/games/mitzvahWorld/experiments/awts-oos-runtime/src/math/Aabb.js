// B"H
import { Vec3 } from './Vec3.js';

/** AABB: a sealed ark around triangles, terrain, and moving souls. */
export class Aabb {
  constructor(min = new Vec3(), max = new Vec3()) { this.min = Vec3.from(min); this.max = Vec3.from(max); }
  static centerSize(center, size) { const c = Vec3.from(center), s = Vec3.from(size).scale(0.5); return new Aabb(c.clone().sub(s), c.clone().add(s)); }
  clone() { return new Aabb(this.min, this.max); }
  expanded(amount = 0) { return new Aabb({ x: this.min.x - amount, y: this.min.y - amount, z: this.min.z - amount }, { x: this.max.x + amount, y: this.max.y + amount, z: this.max.z + amount }); }
  intersects(o) { return this.min.x <= o.max.x && this.max.x >= o.min.x && this.min.y <= o.max.y && this.max.y >= o.min.y && this.min.z <= o.max.z && this.max.z >= o.min.z; }
  containsAabb(o) { return this.min.x <= o.min.x && this.max.x >= o.max.x && this.min.y <= o.min.y && this.max.y >= o.max.y && this.min.z <= o.min.z && this.max.z >= o.max.z; }
  center() { return new Vec3((this.min.x + this.max.x) / 2, (this.min.y + this.max.y) / 2, (this.min.z + this.max.z) / 2); }
  toJSON() { return { min: this.min.toJSON(), max: this.max.toJSON() }; }
}
