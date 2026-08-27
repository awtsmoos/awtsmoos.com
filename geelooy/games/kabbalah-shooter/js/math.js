//B"H
export class Vec2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  set(x, y) { this.x = x; this.y = y; return this; }
  copy(v) { this.x = v.x; this.y = v.y; return this; }
  add(v) { this.x += v.x; this.y += v.y; return this; }
  sub(v) { this.x -= v.x; this.y -= v.y; return this; }
  mult(s) { this.x *= s; this.y *= s; return this; }
  mag() { return Math.sqrt(this.x * this.x + this.y * this.y); }
  normalize() {
    const m = this.mag();
    if (m > 0) { this.x /= m; this.y /= m; }
    return this;
  }
  dist(v) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  static sub(v1, v2) { return new Vec2(v1.x - v2.x, v1.y - v2.y); }
}

export class Vec3 {
    constructor(x=0, y=0, z=0) { this.x=x; this.y=y; this.z=z; }
}

export function lerp(start, end, t) { return start * (1 - t) + end * t; }
export function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }
export function rectIntersect(r1, r2) {
  return !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top);
}
export function circleIntersect(c1, c2) {
  const dx = c1.x - c2.x;
  const dy = c1.y - c2.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  return dist < (c1.radius + c2.radius);
}

// 3D Rotation for Metatron Engine
export function rotateX(v, angle) {
    const c = Math.cos(angle), s = Math.sin(angle);
    const y = v.y * c - v.z * s;
    const z = v.y * s + v.z * c;
    return new Vec3(v.x, y, z);
}
export function rotateY(v, angle) {
    const c = Math.cos(angle), s = Math.sin(angle);
    const x = v.x * c + v.z * s;
    const z = -v.x * s + v.z * c;
    return new Vec3(x, v.y, z);
}
export function rotateZ(v, angle) {
    const c = Math.cos(angle), s = Math.sin(angle);
    const x = v.x * c - v.y * s;
    const y = v.x * s + v.y * c;
    return new Vec3(x, y, v.z);
}
export function project3D(v, width, height, scale=200) {
    const factor = scale / (v.z + 400); // Simple perspective projection
    return new Vec2(v.x * factor + width/2, v.y * factor + height/2);
}
