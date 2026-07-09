// B"H
/**
 * Vec3 is the Kav of this scratch runtime: a small line where the Awtsmoos
 * lets motion appear without THREE, without borrowed gravity, without exile.
 */
export class Vec3 {
  constructor(x = 0, y = 0, z = 0) { this.set(x, y, z); }
  set(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; return this; }
  copy(v = {}) { return this.set(v.x || 0, v.y || 0, v.z || 0); }
  clone() { return new Vec3(this.x, this.y, this.z); }
  add(v) { this.x += v.x; this.y += v.y; this.z += v.z; return this; }
  sub(v) { this.x -= v.x; this.y -= v.y; this.z -= v.z; return this; }
  scale(s) { this.x *= s; this.y *= s; this.z *= s; return this; }
  length() { return Math.hypot(this.x, this.y, this.z); }
  normalize() { const n = this.length() || 1; return this.scale(1 / n); }
  toJSON() { return { x: this.x, y: this.y, z: this.z }; }
  static from(v = {}) { return new Vec3(v.x || 0, v.y || 0, v.z || 0); }
}
