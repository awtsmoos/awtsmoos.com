// B"H
import { composeTRS, copyMat4, identity, multiply } from './tiny-math.js';

/** Tiny scene graph: every node is a candle; parent matrices are the flame chain. */
export class Vector3 {
  constructor(x = 0, y = 0, z = 0) { this.set(x, y, z); }
  set(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; return this; }
  fromArray(a = [0, 0, 0]) { return this.set(a[0] || 0, a[1] || 0, a[2] || 0); }
  copy(v) { return this.set(v.x || 0, v.y || 0, v.z || 0); }
  clone() { return new Vector3(this.x, this.y, this.z); }
  toArray() { return [this.x, this.y, this.z]; }
}

export class Quaternion {
  constructor(x = 0, y = 0, z = 0, w = 1) { this.set(x, y, z, w); }
  set(x = 0, y = 0, z = 0, w = 1) { this.x = x; this.y = y; this.z = z; this.w = w; return this; }
  fromArray(a = [0, 0, 0, 1]) { return this.set(a[0] || 0, a[1] || 0, a[2] || 0, a[3] ?? 1); }
  copy(q) { return this.set(q.x || 0, q.y || 0, q.z || 0, q.w ?? 1); }
  clone() { return new Quaternion(this.x, this.y, this.z, this.w); }
  toArray() { return [this.x, this.y, this.z, this.w]; }
}

export class Object3D {
  constructor() { this.children = []; this.parent = null; this.position = new Vector3(); this.quaternion = new Quaternion(); this.scale = new Vector3(1, 1, 1); this.matrix = null; this.matrixWorld = identity(); this.name = ''; this.visible = true; this.userData = {}; this.isBone = false; }
  add(object) { if (object?.parent) object.parent.remove(object); if (object) { object.parent = this; this.children.push(object); } return this; }
  remove(object) { const i = this.children.indexOf(object); if (i >= 0) { this.children.splice(i, 1); object.parent = null; } return this; }
  traverse(fn) { fn(this); for (const child of this.children) child.traverse(fn); }
  setBaseTransform() { this._base = { position: this.position.clone(), quaternion: this.quaternion.clone(), scale: this.scale.clone(), matrix: this.matrix ? copyMat4(this.matrix) : null }; return this; }
  resetToBase() { if (!this._base) return; this.position.copy(this._base.position); this.quaternion.copy(this._base.quaternion); this.scale.copy(this._base.scale); this.matrix = this._base.matrix ? copyMat4(this._base.matrix) : null; }
  localMatrix() { return this.matrix ? copyMat4(this.matrix) : composeTRS(this.position, this.quaternion, this.scale); }
  updateWorldMatrix(parentWorld = identity()) { this.matrixWorld = multiply(parentWorld, this.localMatrix()); for (const child of this.children) child.updateWorldMatrix(this.matrixWorld); return this.matrixWorld; }
}

export class Group extends Object3D { constructor() { super(); this.isGroup = true; } }
export class Scene extends Group { constructor() { super(); this.isScene = true; } }
export class Bone extends Object3D { constructor() { super(); this.isBone = true; } }

export class Mesh extends Object3D {
  constructor(geometry = null, material = null) { super(); this.geometry = geometry; this.material = material; this.isMesh = true; this.isSkinnedMesh = false; this.skinIndex = null; this.skeleton = null; this.primitiveMode = 4; this.nodeIndex = null; }
}

export class BufferGeometry {
  constructor() { this.attributes = {}; this.index = null; this.mode = 4; this.userData = {}; }
  setAttribute(key, value) { this.attributes[key] = value; return this; }
  setIndex(value) { this.index = value; return this; }
}

export class BufferAttribute {
  constructor(array, itemSize, normalized = false, componentType = null) { this.array = array; this.itemSize = itemSize; this.normalized = normalized; this.componentType = componentType; this.count = Math.floor((array?.length || 0) / itemSize); }
}

export class MeshStandardMaterial {
  constructor(params = {}) {
    const color = params.color || [0.74, 0.68, 0.58, 1];
    const opacity = params.opacity ?? color[3] ?? 1;
    const alphaMode = params.alphaMode || 'OPAQUE';
    const autoTransparent = alphaMode === 'BLEND' || opacity < 1;
    this.name = params.name || 'material';
    this.color = color;
    this.opacity = opacity;
    this.alphaMode = alphaMode;
    this.alphaCutoff = params.alphaCutoff ?? 0.5;
    this.transparent = params.transparent ?? autoTransparent;
    this.doubleSided = params.doubleSided === true;
  }
}

export class PerspectiveCamera extends Object3D {
  constructor(fov = 45, aspect = 1, near = 0.1, far = 1000) { super(); Object.assign(this, { fov, aspect, near, far }); }
}

export function resetTreeToBase(root) { root.traverse((object) => object.resetToBase?.()); }
export default { Vector3, Quaternion, Object3D, Group, Scene, Bone, Mesh, BufferGeometry, BufferAttribute, MeshStandardMaterial, PerspectiveCamera };
