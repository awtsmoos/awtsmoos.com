// B"H
/**
 * @file Vector3.js
 * @description
 * A tiny renderer-neutral vector vessel. It mirrors the subset of THREE.Vector3
 * used by manifest assembly so Node stress tests and future non-Three engines
 * can share the same geometry logic.
 */
export class AwtsmoosVector3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = Number(x) || 0;
    this.y = Number(y) || 0;
    this.z = Number(z) || 0;
  }

  set(x = 0, y = 0, z = 0) {
    this.x = Number(x) || 0;
    this.y = Number(y) || 0;
    this.z = Number(z) || 0;
    return this;
  }

  copy(other = {}) {
    return this.set(other.x, other.y, other.z);
  }

  add(other = {}) {
    this.x += Number(other.x) || 0;
    this.y += Number(other.y) || 0;
    this.z += Number(other.z) || 0;
    return this;
  }

  sub(other = {}) {
    this.x -= Number(other.x) || 0;
    this.y -= Number(other.y) || 0;
    this.z -= Number(other.z) || 0;
    return this;
  }

  clone() {
    return new AwtsmoosVector3(this.x, this.y, this.z);
  }

  toJSON() {
    return { x: this.x, y: this.y, z: this.z };
  }
}

export function makeVector3(x = 0, y = 0, z = 0) {
  return new AwtsmoosVector3(x, y, z);
}
