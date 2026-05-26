// B"H
/**
 * @file NeutralMath.js
 * @description
 * Deterministic renderer-neutral math vessels.
 * These structures mirror the semantic behavior needed by gameplay/runtime
 * systems while remaining serializable and independent from Three.
 */

export class NeutralVector3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.rendererNeutral = true;
  }

  set(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  clone() {
    return new NeutralVector3(this.x, this.y, this.z);
  }

  add(v) {
    this.x += v.x || 0;
    this.y += v.y || 0;
    this.z += v.z || 0;
    return this;
  }

  sub(v) {
    this.x -= v.x || 0;
    this.y -= v.y || 0;
    this.z -= v.z || 0;
    return this;
  }

  multiplyScalar(s = 1) {
    this.x *= s;
    this.y *= s;
    this.z *= s;
    return this;
  }

  length() {
    return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
  }

  normalize() {
    const len = this.length() || 1;
    return this.multiplyScalar(1 / len);
  }

  distanceTo(v) {
    return Math.sqrt(
      (this.x - (v.x || 0)) ** 2 +
      (this.y - (v.y || 0)) ** 2 +
      (this.z - (v.z || 0)) ** 2
    );
  }

  toJSON() {
    return { x: this.x, y: this.y, z: this.z };
  }
}

export class NeutralQuaternion {
  constructor(x = 0, y = 0, z = 0, w = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    this.rendererNeutral = true;
  }

  set(x = 0, y = 0, z = 0, w = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    return this;
  }

  clone() {
    return new NeutralQuaternion(this.x, this.y, this.z, this.w);
  }

  toJSON() {
    return { x: this.x, y: this.y, z: this.z, w: this.w };
  }
}
