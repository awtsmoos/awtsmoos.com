import {
  VILLAGE_ARRIVAL_CLEARINGS,
  VILLAGE_ARRIVAL_ENTRANCE,
  VILLAGE_DESTINATIONS,
  VILLAGE_SIGN_GROUPS,
  assertProductionMaterialUrl,
  cachedTextureImage,
  createVillageSignTextureUrl,
  exactMaterialUrl,
  fullMaterialUrl,
  isSameOriginMaterialUrl,
  runtimeMaterialByRole
} from "./chunk-PERZ7G34.js";

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-matrix-core.js
var EPSILON = 1e-8;
function identity() {
  return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
}
function copyMat4(source) {
  return new Float32Array(source || identity());
}
function mat4FromArray(source, offset = 0) {
  const result = new Float32Array(16);
  for (let index = 0; index < 16; index += 1) {
    result[index] = Number(source?.[offset + index] ?? (index % 5 === 0 ? 1 : 0));
  }
  return result;
}
function multiply(left, right) {
  const result = new Float32Array(16);
  for (let column = 0; column < 4; column += 1) {
    const offset = column * 4;
    const right0 = right[offset];
    const right1 = right[offset + 1];
    const right2 = right[offset + 2];
    const right3 = right[offset + 3];
    result[offset] = left[0] * right0 + left[4] * right1 + left[8] * right2 + left[12] * right3;
    result[offset + 1] = left[1] * right0 + left[5] * right1 + left[9] * right2 + left[13] * right3;
    result[offset + 2] = left[2] * right0 + left[6] * right1 + left[10] * right2 + left[14] * right3;
    result[offset + 3] = left[3] * right0 + left[7] * right1 + left[11] * right2 + left[15] * right3;
  }
  return result;
}
function inverse(matrix) {
  const result = new Float32Array(16);
  const [a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, a30, a31, a32, a33] = matrix;
  const b00 = a00 * a11 - a01 * a10;
  const b01 = a00 * a12 - a02 * a10;
  const b02 = a00 * a13 - a03 * a10;
  const b03 = a01 * a12 - a02 * a11;
  const b04 = a01 * a13 - a03 * a11;
  const b05 = a02 * a13 - a03 * a12;
  const b06 = a20 * a31 - a21 * a30;
  const b07 = a20 * a32 - a22 * a30;
  const b08 = a20 * a33 - a23 * a30;
  const b09 = a21 * a32 - a22 * a31;
  const b10 = a21 * a33 - a23 * a31;
  const b11 = a22 * a33 - a23 * a32;
  let determinant = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  if (Math.abs(determinant) < EPSILON) return identity();
  determinant = 1 / determinant;
  result.set([
    (a11 * b11 - a12 * b10 + a13 * b09) * determinant,
    (-a01 * b11 + a02 * b10 - a03 * b09) * determinant,
    (a31 * b05 - a32 * b04 + a33 * b03) * determinant,
    (-a21 * b05 + a22 * b04 - a23 * b03) * determinant,
    (-a10 * b11 + a12 * b08 - a13 * b07) * determinant,
    (a00 * b11 - a02 * b08 + a03 * b07) * determinant,
    (-a30 * b05 + a32 * b02 - a33 * b01) * determinant,
    (a20 * b05 - a22 * b02 + a23 * b01) * determinant,
    (a10 * b10 - a11 * b08 + a13 * b06) * determinant,
    (-a00 * b10 + a01 * b08 - a03 * b06) * determinant,
    (a30 * b04 - a31 * b02 + a33 * b00) * determinant,
    (-a20 * b04 + a21 * b02 - a23 * b00) * determinant,
    (-a10 * b09 + a11 * b07 - a12 * b06) * determinant,
    (a00 * b09 - a01 * b07 + a02 * b06) * determinant,
    (-a30 * b03 + a31 * b01 - a32 * b00) * determinant,
    (a20 * b03 - a21 * b01 + a22 * b00) * determinant
  ]);
  return result;
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-camera-math.js
function transformPoint(matrix, x, y, z) {
  return [
    matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12],
    matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13],
    matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14]
  ];
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-transform-cache.js
var MATRIX_SNAPSHOT = 1;
var TRS_SNAPSHOT = 2;
var ROOT_WORLD_MATRIX = identity();
function cachedLocalMatrix(object) {
  if (!localTransformChanged(object)) return object._localMatrixCache;
  captureLocalTransform(object);
  object._localMatrixCache ||= new Float32Array(16);
  if (object.matrix) copyMatrixInto(object._localMatrixCache, object.matrix);
  else composeTrsInto(object._localMatrixCache, object);
  object._localRevision = (object._localRevision || 0) + 1;
  return object._localMatrixCache;
}
function updateCachedWorldMatrix(object, parentWorld = ROOT_WORLD_MATRIX, parentRevision = null) {
  const localMatrix = cachedLocalMatrix(object);
  const localRevision = object._localRevision || 0;
  const inheritedRevision = parentRevision ?? object.parent?._worldRevision ?? 0;
  const unchanged = object._worldParentMatrix === parentWorld && object._worldParentRevision === inheritedRevision && object._worldLocalRevision === localRevision;
  if (unchanged) return false;
  if (object.isMesh || !validMatrix(object.matrixWorld)) {
    object.matrixWorld = multiplyInto(
      new Float32Array(16),
      parentWorld,
      localMatrix
    );
  } else {
    multiplyInto(object.matrixWorld, parentWorld, localMatrix);
  }
  object._worldParentMatrix = parentWorld;
  object._worldParentRevision = inheritedRevision;
  object._worldLocalRevision = localRevision;
  object._worldRevision = (object._worldRevision || 0) + 1;
  return true;
}
function invalidateTransformCache(object) {
  object._localTransformSnapshot = null;
  object._worldParentMatrix = null;
  object._worldParentRevision = -1;
  object._worldLocalRevision = -1;
}
function localTransformChanged(object) {
  const snapshot = object._localTransformSnapshot;
  if (object.matrix) {
    if (!snapshot || snapshot.length !== 17 || snapshot[0] !== MATRIX_SNAPSHOT) {
      return true;
    }
    for (let index = 0; index < 16; index += 1) {
      if (snapshot[index + 1] !== object.matrix[index]) return true;
    }
    return false;
  }
  if (!snapshot || snapshot.length !== 11 || snapshot[0] !== TRS_SNAPSHOT) {
    return true;
  }
  return snapshot[1] !== object.position.x || snapshot[2] !== object.position.y || snapshot[3] !== object.position.z || snapshot[4] !== object.quaternion.x || snapshot[5] !== object.quaternion.y || snapshot[6] !== object.quaternion.z || snapshot[7] !== object.quaternion.w || snapshot[8] !== object.scale.x || snapshot[9] !== object.scale.y || snapshot[10] !== object.scale.z;
}
function captureLocalTransform(object) {
  if (object.matrix) {
    const snapshot2 = reusableSnapshot(object, 17);
    snapshot2[0] = MATRIX_SNAPSHOT;
    for (let index = 0; index < 16; index += 1) {
      snapshot2[index + 1] = object.matrix[index];
    }
    return;
  }
  const snapshot = reusableSnapshot(object, 11);
  snapshot[0] = TRS_SNAPSHOT;
  snapshot[1] = object.position.x;
  snapshot[2] = object.position.y;
  snapshot[3] = object.position.z;
  snapshot[4] = object.quaternion.x;
  snapshot[5] = object.quaternion.y;
  snapshot[6] = object.quaternion.z;
  snapshot[7] = object.quaternion.w;
  snapshot[8] = object.scale.x;
  snapshot[9] = object.scale.y;
  snapshot[10] = object.scale.z;
}
function reusableSnapshot(object, length3) {
  if (!object._localTransformSnapshot || object._localTransformSnapshot.length !== length3) {
    object._localTransformSnapshot = new Array(length3);
  }
  return object._localTransformSnapshot;
}
function copyMatrixInto(target, source) {
  for (let index = 0; index < 16; index += 1) target[index] = source[index];
}
function composeTrsInto(target, object) {
  const quaternion = object.quaternion;
  const x = quaternion.x || 0;
  const y = quaternion.y || 0;
  const z = quaternion.z || 0;
  const w = quaternion.w ?? 1;
  const inverseLength = 1 / (Math.hypot(x, y, z, w) || 1);
  const normalizedX = x * inverseLength;
  const normalizedY = y * inverseLength;
  const normalizedZ = z * inverseLength;
  const normalizedW = w * inverseLength;
  const x2 = normalizedX + normalizedX;
  const y2 = normalizedY + normalizedY;
  const z2 = normalizedZ + normalizedZ;
  const xx = normalizedX * x2;
  const xy = normalizedX * y2;
  const xz = normalizedX * z2;
  const yy = normalizedY * y2;
  const yz = normalizedY * z2;
  const zz = normalizedZ * z2;
  const wx = normalizedW * x2;
  const wy = normalizedW * y2;
  const wz = normalizedW * z2;
  target[0] = (1 - yy - zz) * object.scale.x;
  target[1] = (xy + wz) * object.scale.x;
  target[2] = (xz - wy) * object.scale.x;
  target[3] = 0;
  target[4] = (xy - wz) * object.scale.y;
  target[5] = (1 - xx - zz) * object.scale.y;
  target[6] = (yz + wx) * object.scale.y;
  target[7] = 0;
  target[8] = (xz + wy) * object.scale.z;
  target[9] = (yz - wx) * object.scale.z;
  target[10] = (1 - xx - yy) * object.scale.z;
  target[11] = 0;
  target[12] = object.position.x;
  target[13] = object.position.y;
  target[14] = object.position.z;
  target[15] = 1;
}
function multiplyInto(target, left, right) {
  for (let column = 0; column < 4; column += 1) {
    const offset = column * 4;
    const right0 = right[offset];
    const right1 = right[offset + 1];
    const right2 = right[offset + 2];
    const right3 = right[offset + 3];
    target[offset] = left[0] * right0 + left[4] * right1 + left[8] * right2 + left[12] * right3;
    target[offset + 1] = left[1] * right0 + left[5] * right1 + left[9] * right2 + left[13] * right3;
    target[offset + 2] = left[2] * right0 + left[6] * right1 + left[10] * right2 + left[14] * right3;
    target[offset + 3] = left[3] * right0 + left[7] * right1 + left[11] * right2 + left[15] * right3;
  }
  return target;
}
function validMatrix(matrix) {
  return matrix?.length === 16;
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-vector.js
var Vector3 = class _Vector3 {
  constructor(x = 0, y = 0, z = 0) {
    this.set(x, y, z);
  }
  set(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }
  fromArray(values = [0, 0, 0]) {
    return this.set(values[0] || 0, values[1] || 0, values[2] || 0);
  }
  copy(vector2) {
    return this.set(vector2.x || 0, vector2.y || 0, vector2.z || 0);
  }
  clone() {
    return new _Vector3(this.x, this.y, this.z);
  }
  toArray() {
    return [this.x, this.y, this.z];
  }
};
var Quaternion = class _Quaternion {
  constructor(x = 0, y = 0, z = 0, w = 1) {
    this.set(x, y, z, w);
  }
  set(x = 0, y = 0, z = 0, w = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    return this;
  }
  fromArray(values = [0, 0, 0, 1]) {
    return this.set(values[0] || 0, values[1] || 0, values[2] || 0, values[3] ?? 1);
  }
  copy(quaternion) {
    return this.set(
      quaternion.x || 0,
      quaternion.y || 0,
      quaternion.z || 0,
      quaternion.w ?? 1
    );
  }
  clone() {
    return new _Quaternion(this.x, this.y, this.z, this.w);
  }
  toArray() {
    return [this.x, this.y, this.z, this.w];
  }
};

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-object3d.js
var Object3D = class {
  constructor() {
    this.children = [];
    this.parent = null;
    this.position = new Vector3();
    this.quaternion = new Quaternion();
    this.scale = new Vector3(1, 1, 1);
    this.matrix = null;
    this.matrixWorld = identity();
    this.name = "";
    this._visible = true;
    this._sceneGraphRevision = 0;
    this.userData = {};
    this.isBone = false;
  }
  get visible() {
    return this._visible;
  }
  set visible(value) {
    const next = value !== false;
    if (this._visible === next) return;
    this._visible = next;
    markSceneGraphChanged(this);
  }
  add(object) {
    if (!object) return this;
    if (object.parent) object.parent.remove(object);
    object.parent = this;
    invalidateTransformCache(object);
    this.children.push(object);
    markSceneGraphChanged(this);
    return this;
  }
  remove(object) {
    const index = this.children.indexOf(object);
    if (index < 0) return this;
    this.children.splice(index, 1);
    markSceneGraphChanged(this);
    object.parent = null;
    invalidateTransformCache(object);
    return this;
  }
  traverse(visitor) {
    visitor(this);
    for (const child of this.children) child.traverse(visitor);
  }
  setBaseTransform() {
    this._base = {
      position: this.position.clone(),
      quaternion: this.quaternion.clone(),
      scale: this.scale.clone(),
      matrix: this.matrix ? copyMat4(this.matrix) : null
    };
    return this;
  }
  resetToBase() {
    if (!this._base) return;
    this.position.copy(this._base.position);
    this.quaternion.copy(this._base.quaternion);
    this.scale.copy(this._base.scale);
    this.matrix = this._base.matrix ? copyMat4(this._base.matrix) : null;
    invalidateTransformCache(this);
  }
  localMatrix() {
    return cachedLocalMatrix(this);
  }
  updateWorldMatrix(parentWorld = ROOT_WORLD_MATRIX) {
    updateCachedWorldMatrix(this, parentWorld);
    for (const child of this.children) child.updateWorldMatrix(this.matrixWorld);
    return this.matrixWorld;
  }
};
var Group = class extends Object3D {
  constructor() {
    super();
    this.isGroup = true;
  }
};
var Scene = class extends Group {
  constructor() {
    super();
    this.isScene = true;
  }
};
var Bone = class extends Object3D {
  constructor() {
    super();
    this.isBone = true;
  }
};
function markSceneGraphChanged(object) {
  let root = object;
  while (root.parent) root = root.parent;
  root._sceneGraphRevision = Number(root._sceneGraphRevision || 0) + 1;
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-mesh-object.js
var Mesh = class extends Object3D {
  constructor(geometry = null, material = null) {
    super();
    this.geometry = geometry;
    this.material = material;
    this.isMesh = true;
    this.isSkinnedMesh = false;
    this.skinIndex = null;
    this.skeleton = null;
    this.primitiveMode = 4;
    this.nodeIndex = null;
  }
};

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-geometry.js
var BufferGeometry = class {
  constructor() {
    this.attributes = {};
    this.index = null;
    this.mode = 4;
    this.userData = {};
  }
  setAttribute(key, value) {
    this.attributes[key] = value;
    return this;
  }
  setIndex(value) {
    this.index = value;
    return this;
  }
};
var BufferAttribute = class {
  constructor(array, itemSize, normalized3 = false, componentType = null) {
    this.array = array;
    this.itemSize = itemSize;
    this.normalized = normalized3;
    this.componentType = componentType;
    this.count = Math.floor((array?.length || 0) / itemSize);
  }
};
var MeshStandardMaterial = class {
  constructor(parameters = {}) {
    const color = parameters.color || [0.74, 0.68, 0.58, 1];
    const opacity = parameters.opacity ?? color[3] ?? 1;
    const alphaMode = parameters.alphaMode || "OPAQUE";
    const autoTransparent = alphaMode === "BLEND" || opacity < 1;
    this.name = parameters.name || "material";
    this.color = color;
    this.opacity = opacity;
    this.alphaMode = alphaMode;
    this.alphaCutoff = parameters.alphaCutoff ?? 0.5;
    this.transparent = parameters.transparent ?? autoTransparent;
    this.doubleSided = parameters.doubleSided === true;
  }
};

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-camera.js
var PerspectiveCamera = class extends Object3D {
  constructor(fov = 45, aspect = 1, near = 0.1, far = 1e3) {
    super();
    this.fov = fov;
    this.aspect = aspect;
    this.near = near;
    this.far = far;
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/math/Vec3.js
var Vec3 = class _Vec3 {
  constructor(x = 0, y = 0, z = 0) {
    this.set(x, y, z);
  }
  /** Replaces every coordinate and returns this mutable vector. */
  set(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }
  /** Copies coordinates while preserving the original falsy-zero behavior. */
  copy(value = {}) {
    return this.set(value.x || 0, value.y || 0, value.z || 0);
  }
  /** Returns an independent vector with the same coordinates. */
  clone() {
    return new _Vec3(this.x, this.y, this.z);
  }
  /** Adds another vector in place. */
  add(value) {
    this.x += value.x;
    this.y += value.y;
    this.z += value.z;
    return this;
  }
  /** Subtracts another vector in place. */
  sub(value) {
    this.x -= value.x;
    this.y -= value.y;
    this.z -= value.z;
    return this;
  }
  /** Multiplies every coordinate by one scalar. */
  scale(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;
    return this;
  }
  /** Returns the Euclidean vector length. */
  length() {
    return Math.hypot(this.x, this.y, this.z);
  }
  /** Normalizes in place while leaving a zero vector unchanged. */
  normalize() {
    const divisor = this.length() || 1;
    return this.scale(1 / divisor);
  }
  /** Returns plain serializable coordinates. */
  toJSON() {
    return {
      x: this.x,
      y: this.y,
      z: this.z
    };
  }
  /** Creates a vector from a vector-like value. */
  static from(value = {}) {
    return new _Vec3(value.x || 0, value.y || 0, value.z || 0);
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/math/Aabb.js
var Aabb = class _Aabb {
  constructor(min = new Vec3(), max = new Vec3()) {
    this.min = Vec3.from(min);
    this.max = Vec3.from(max);
  }
  /** Creates a box from one center and complete size. */
  static centerSize(center, size) {
    const halfSize = Vec3.from(size).scale(0.5);
    return new _Aabb(
      Vec3.from(center).sub(halfSize),
      Vec3.from(center).add(halfSize)
    );
  }
  /** Returns an independent box with cloned endpoints. */
  clone() {
    return new _Aabb(this.min, this.max);
  }
  /** Returns a new box expanded equally along every axis. */
  expanded(amount) {
    return new _Aabb(
      this.min.clone().sub(new Vec3(amount, amount, amount)),
      this.max.clone().add(new Vec3(amount, amount, amount))
    );
  }
  /** Returns whether two closed boxes touch or overlap. */
  intersects(other) {
    return !(this.max.x < other.min.x || this.min.x > other.max.x || this.max.y < other.min.y || this.min.y > other.max.y || this.max.z < other.min.z || this.min.z > other.max.z);
  }
  /** Returns whether this closed box completely contains another. */
  containsAabb(other) {
    return other.min.x >= this.min.x && other.max.x <= this.max.x && other.min.y >= this.min.y && other.max.y <= this.max.y && other.min.z >= this.min.z && other.max.z <= this.max.z;
  }
  /** Returns the midpoint of the box. */
  center() {
    return this.min.clone().add(this.max).scale(0.5);
  }
  /** Returns a plain serializable bounds object. */
  toJSON() {
    return {
      min: this.min.toJSON(),
      max: this.max.toJSON()
    };
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/math/Geometry3D.js
function v(x = 0, y = 0, z = 0) {
  return { x, y, z };
}
function add(a, b) {
  return v(a.x + b.x, a.y + b.y, a.z + b.z);
}
function sub(a, b) {
  return v(a.x - b.x, a.y - b.y, a.z - b.z);
}
function scale2(a, s) {
  return v(a.x * s, a.y * s, a.z * s);
}
function dot(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}
function cross(a, b) {
  return v(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
}
function length(a) {
  return Math.hypot(a.x, a.y, a.z);
}
function normalize(a) {
  const n = length(a) || 1;
  return scale2(a, 1 / n);
}
function negate(a) {
  return v(-a.x, -a.y, -a.z);
}
function clamp01(n) {
  return Math.max(0, Math.min(1, n));
}
function triangleNormal(a, b, c) {
  return normalize(cross(sub(b, a), sub(c, a)));
}
function planeDistance(point3, tri) {
  return dot(sub(point3, tri.a), tri.normal);
}
function projectToPlane(point3, tri) {
  return sub(point3, scale2(tri.normal, planeDistance(point3, tri)));
}
function triangleContainsPoint(p, tri) {
  const v0 = sub(tri.c, tri.a), v1 = sub(tri.b, tri.a), v2 = sub(p, tri.a);
  const d00 = dot(v0, v0), d01 = dot(v0, v1), d02 = dot(v0, v2), d11 = dot(v1, v1), d12 = dot(v1, v2);
  const inv = 1 / (d00 * d11 - d01 * d01 || 1);
  const u = (d11 * d02 - d01 * d12) * inv, w = (d00 * d12 - d01 * d02) * inv;
  return u >= -1e-4 && w >= -1e-4 && u + w <= 1.0001;
}
function closestPointsSegmentSegment(a0, a1, b0, b1) {
  const d1 = sub(a1, a0), d2 = sub(b1, b0), r = sub(a0, b0);
  const a = dot(d1, d1), e = dot(d2, d2), f = dot(d2, r);
  let s = 0, t = 0;
  if (a <= 1e-8 && e <= 1e-8) return [a0, b0];
  if (a <= 1e-8) t = clamp01(f / e);
  else {
    const c = dot(d1, r);
    if (e <= 1e-8) s = clamp01(-c / a);
    else {
      const b = dot(d1, d2), denom = a * e - b * b;
      s = denom ? clamp01((b * f - c * e) / denom) : 0;
      t = (b * s + f) / e;
      if (t < 0) {
        t = 0;
        s = clamp01(-c / a);
      } else if (t > 1) {
        t = 1;
        s = clamp01((b - c) / a);
      }
    }
  }
  return [add(a0, scale2(d1, s)), add(b0, scale2(d2, t))];
}
function rayTriangle(origin, direction2, tri, maxDistance = Infinity) {
  const edge1 = sub(tri.b, tri.a), edge2 = sub(tri.c, tri.a), h = cross(direction2, edge2);
  const det = dot(edge1, h);
  if (Math.abs(det) < 1e-6) return null;
  const inv = 1 / det, s = sub(origin, tri.a), u = inv * dot(s, h);
  if (u < 0 || u > 1) return null;
  const q = cross(s, edge1), vv = inv * dot(direction2, q);
  if (vv < 0 || u + vv > 1) return null;
  const t = inv * dot(edge2, q);
  if (t < 1e-3 || t > maxDistance) return null;
  return { distance: t, point: add(origin, scale2(direction2, t)), normal: tri.normal, item: tri };
}
function minMax(points) {
  const min = v(Infinity, Infinity, Infinity), max = v(-Infinity, -Infinity, -Infinity);
  for (const p of points) {
    min.x = Math.min(min.x, p.x);
    min.y = Math.min(min.y, p.y);
    min.z = Math.min(min.z, p.z);
    max.x = Math.max(max.x, p.x);
    max.y = Math.max(max.y, p.y);
    max.z = Math.max(max.z, p.z);
  }
  return { min, max };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/collision/TriangleCollider.js
var TriangleCollider = class {
  /**
   * Creates one immutable-in-shape triangle collision record.
   * @param {object} a First vertex.
   * @param {object} b Second vertex.
   * @param {object} c Third vertex.
   * @param {object} [options] Collision semantics and optional normal.
   */
  constructor(a, b, c, options = {}) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.normal = options.normal || triangleNormal(a, b, c);
    this.kind = options.kind || "triangle";
    this.solid = options.solid !== false;
    this.floor = options.floor ?? this.normal.y > 0.45;
    const bounds = minMax([a, b, c]);
    this.aabb = new Aabb(bounds.min, bounds.max).expanded(0.03);
  }
};
function trianglesFromIndexed(vertices, indices, options = {}) {
  const triangles = [];
  for (let index = 0; index < indices.length; index += 3) {
    triangles.push(new TriangleCollider(
      vertices[indices[index]],
      vertices[indices[index + 1]],
      vertices[indices[index + 2]],
      options
    ));
  }
  return triangles;
}

// geelooy/libs/awtsmoos-procedural/src/mesh/primitives/core.js
var WHITE = [1, 1, 1, 1];
function mesh(positions = [], indices = [], color = WHITE) {
  return {
    positions,
    indices,
    colors: Array.from({ length: positions.length / 3 }, () => color).flat()
  };
}
function safeSegments(value, min) {
  return Math.max(min, Math.floor(value || min));
}

// geelooy/libs/awtsmoos-procedural/src/mesh/primitives/box.js
function cubeMesh({ center = [0, 0, 0], size = [1, 1, 1], color = WHITE } = {}) {
  const [cx, cy, cz] = center;
  const [sx, sy, sz] = size.map((value) => Math.max(1e-3, Math.abs(value)) / 2);
  const p = [
    cx - sx,
    cy - sy,
    cz - sz,
    cx + sx,
    cy - sy,
    cz - sz,
    cx + sx,
    cy + sy,
    cz - sz,
    cx - sx,
    cy + sy,
    cz - sz,
    cx - sx,
    cy - sy,
    cz + sz,
    cx + sx,
    cy - sy,
    cz + sz,
    cx + sx,
    cy + sy,
    cz + sz,
    cx - sx,
    cy + sy,
    cz + sz
  ];
  const i = [
    0,
    1,
    2,
    0,
    2,
    3,
    4,
    6,
    5,
    4,
    7,
    6,
    0,
    4,
    5,
    0,
    5,
    1,
    3,
    2,
    6,
    3,
    6,
    7,
    1,
    5,
    6,
    1,
    6,
    2,
    0,
    3,
    7,
    0,
    7,
    4
  ];
  return mesh(p, i, color);
}

// geelooy/libs/awtsmoos-procedural/src/mesh/primitives/round.js
function sphereMesh({ radius = 1, rings = 8, segments = 16, color = WHITE } = {}) {
  const p = [];
  const i = [];
  const rows = Math.max(3, rings | 0);
  const cols = safeSegments(segments, 8);
  for (let y = 0; y <= rows; y += 1) {
    const ph = y / rows * Math.PI;
    for (let x = 0; x < cols; x += 1) {
      const th = x / cols * Math.PI * 2;
      p.push(Math.sin(ph) * Math.cos(th) * radius, Math.cos(ph) * radius, Math.sin(ph) * Math.sin(th) * radius);
    }
  }
  for (let y = 0; y < rows; y += 1) for (let x = 0; x < cols; x += 1) {
    const a = y * cols + x;
    const b = y * cols + (x + 1) % cols;
    const c = (y + 1) * cols + (x + 1) % cols;
    const d = (y + 1) * cols + x;
    i.push(a, c, d, a, b, c);
  }
  return mesh(p, i, color);
}

// geelooy/libs/awtsmoos-procedural-core/src/core/geometry/csg/bsp/node.js
var Node = class _Node {
  constructor(polygons) {
    this.plane = null;
    this.front = null;
    this.back = null;
    this.polygons = [];
    if (polygons) this.build(polygons);
  }
  clone() {
    const node = new _Node();
    node.plane = this.plane && this.plane.clone();
    node.front = this.front && this.front.clone();
    node.back = this.back && this.back.clone();
    node.polygons = this.polygons.map((p) => p.clone());
    return node;
  }
  build(polygons) {
    if (!polygons.length) return;
    if (!this.plane) this.plane = polygons[0].plane.clone();
    const front = [], back = [];
    for (let i = 0; i < polygons.length; i++) {
      this.plane.splitPolygon(polygons[i], this.polygons, this.polygons, front, back);
    }
    if (front.length) {
      if (!this.front) this.front = new _Node();
      this.front.build(front);
    }
    if (back.length) {
      if (!this.back) this.back = new _Node();
      this.back.build(back);
    }
  }
  /**
   * Clips a single polygon against this node's tree.
   * @param {Polygon} polygon - The polygon to clip.
   * @param {boolean} keepInside - True to keep parts inside the volume (Back).
   * @param {Array} outList - Accumulator for resulting polygons.
   */
  clipTo(polygon, keepInside, outList) {
    const front = [], back = [];
    this.plane.splitPolygon(polygon, front, back, front, back);
    if (this.front) {
      front.forEach((p) => this.front.clipTo(p, keepInside, outList));
    } else {
      if (!keepInside) outList.push(...front);
    }
    if (this.back) {
      back.forEach((p) => this.back.clipTo(p, keepInside, outList));
    } else {
      if (keepInside) outList.push(...back);
    }
  }
};

// geelooy/libs/awtsmoos-procedural-core/src/core/geometry/csg/bsp/tree.js
var Tree = class {
  constructor(polygons) {
    this.rootnode = new Node();
    if (polygons) this.build(polygons);
  }
  build(polygons) {
    this.rootnode.build(polygons);
  }
  /**
   * B"H - Clips a list of polygons against this tree.
   * Modifies the input array in-place.
   * @param {Array} polygons - The polygons to clip.
   * @param {boolean} keepInside - If true, keep parts inside the tree. If false, keep parts outside.
   */
  clipPolygons(polygons, keepInside) {
    const result = [];
    for (let i = 0; i < polygons.length; i++) {
      this.rootnode.clipTo(polygons[i], keepInside, result);
    }
    polygons.length = 0;
    polygons.push(...result);
  }
};

// geelooy/libs/awtsmoos-procedural-core/src/core/geometry/csg/math/vector3.js
var Vector3D = class _Vector3D {
  constructor(x = 0, y = 0, z = 0) {
    if (Array.isArray(x)) {
      this.x = x[0];
      this.y = x[1];
      this.z = x[2] || 0;
    } else {
      this.x = x;
      this.y = y;
      this.z = z;
    }
  }
  clone() {
    return new _Vector3D(this.x, this.y, this.z);
  }
  negated() {
    return new _Vector3D(-this.x, -this.y, -this.z);
  }
  plus(a) {
    return new _Vector3D(this.x + a.x, this.y + a.y, this.z + a.z);
  }
  minus(a) {
    return new _Vector3D(this.x - a.x, this.y - a.y, this.z - a.z);
  }
  times(a) {
    return new _Vector3D(this.x * a, this.y * a, this.z * a);
  }
  dividedBy(a) {
    return new _Vector3D(this.x / a, this.y / a, this.z / a);
  }
  dot(a) {
    return this.x * a.x + this.y * a.y + this.z * a.z;
  }
  lerp(a, t) {
    return this.plus(a.minus(this).times(t));
  }
  lengthSquared() {
    return this.dot(this);
  }
  length() {
    return Math.sqrt(this.lengthSquared());
  }
  unit() {
    return this.dividedBy(this.length());
  }
  cross(a) {
    return new _Vector3D(
      this.y * a.z - this.z * a.y,
      this.z * a.x - this.x * a.z,
      this.x * a.y - this.y * a.x
    );
  }
  distanceTo(a) {
    return this.minus(a).length();
  }
  equals(a) {
    return this.x === a.x && this.y === a.y && this.z === a.z;
  }
};

// geelooy/libs/awtsmoos-procedural-core/src/core/geometry/csg/core/vertex.js
var Vertex = class _Vertex {
  constructor(pos, col) {
    this.pos = pos;
    this.col = col || [1, 1, 1, 1];
  }
  clone() {
    return new _Vertex(this.pos.clone(), [...this.col]);
  }
  flip() {
  }
  interpolate(other, t) {
    const v2 = new _Vertex(this.pos.lerp(other.pos, t));
    if (this.col && other.col) {
      v2.col = [
        this.col[0] + (other.col[0] - this.col[0]) * t,
        this.col[1] + (other.col[1] - this.col[1]) * t,
        this.col[2] + (other.col[2] - this.col[2]) * t,
        this.col[3] + (other.col[3] - this.col[3]) * t
      ];
    }
    return v2;
  }
};

// geelooy/libs/awtsmoos-procedural-core/src/core/geometry/csg/core/plane.js
var EPSILON2 = 1e-5;
var Plane = class _Plane {
  constructor(normal, w) {
    this.normal = normal;
    this.w = w;
  }
  static fromVector3Ds(a, b, c) {
    const n = b.minus(a).cross(c.minus(a)).unit();
    return new _Plane(n, n.dot(a));
  }
  clone() {
    return new _Plane(this.normal.clone(), this.w);
  }
  flip() {
    this.normal = this.normal.negated();
    this.w = -this.w;
  }
  /**
   * Splits a polygon by this plane.
   * @param {Polygon} polygon 
   * @param {Array} coplanarFront 
   * @param {Array} coplanarBack 
   * @param {Array} front 
   * @param {Array} back 
   */
  splitPolygon(polygon, coplanarFront, coplanarBack, front, back) {
    const COPLANAR = 0;
    const FRONT = 1;
    const BACK = 2;
    const SPANNING = 3;
    let polygonType = 0;
    const types = [];
    for (let i = 0; i < polygon.vertices.length; i++) {
      const t = this.normal.dot(polygon.vertices[i].pos) - this.w;
      const type = t < -EPSILON2 ? BACK : t > EPSILON2 ? FRONT : COPLANAR;
      polygonType |= type;
      types.push(type);
    }
    switch (polygonType) {
      case COPLANAR:
        (this.normal.dot(polygon.plane.normal) > 0 ? coplanarFront : coplanarBack).push(polygon);
        break;
      case FRONT:
        front.push(polygon);
        break;
      case BACK:
        back.push(polygon);
        break;
      case SPANNING:
        const f = [], b = [];
        for (let i = 0; i < polygon.vertices.length; i++) {
          const j = (i + 1) % polygon.vertices.length;
          const ti = types[i], tj = types[j];
          const vi = polygon.vertices[i], vj = polygon.vertices[j];
          if (ti !== BACK) f.push(vi);
          if (ti !== FRONT) b.push(ti !== BACK ? vi.clone() : vi);
          if ((ti | tj) === SPANNING) {
            const t = (this.w - this.normal.dot(vi.pos)) / this.normal.dot(vj.pos.minus(vi.pos));
            const v2 = vi.interpolate(vj, t);
            f.push(v2);
            b.push(v2.clone());
          }
        }
        if (f.length >= 3) front.push(new polygon.constructor(f, polygon.shared));
        if (b.length >= 3) back.push(new polygon.constructor(b, polygon.shared));
        break;
    }
  }
};

// geelooy/libs/awtsmoos-procedural-core/src/core/geometry/csg/core/polygon.js
var Polygon = class _Polygon {
  constructor(vertices, shared, plane) {
    this.vertices = vertices;
    this.shared = shared || null;
    this.plane = plane || Plane.fromVector3Ds(vertices[0].pos, vertices[1].pos, vertices[2].pos);
  }
  clone() {
    return new _Polygon(
      this.vertices.map((v2) => v2.clone()),
      this.shared ? [...this.shared] : null,
      this.plane.clone()
    );
  }
  flip() {
    this.vertices.reverse().map((v2) => v2.flip());
    this.plane.flip();
  }
};

// geelooy/libs/awtsmoos-procedural-core/src/core/geometry/csg/utils/meshUtils.js
function meshToPolygons(mesh2) {
  const polygons = [];
  if (mesh2.faces) {
    mesh2.faces.forEach((face2) => {
      const mkV = (v3) => {
        const vert = new Vertex(new Vector3D(v3.pos[0], v3.pos[1], v3.pos[2]));
        if (v3.col) vert.col = [...v3.col];
        return vert;
      };
      const v2 = face2.vertices;
      if (v2.length === 3) {
        const poly = new Polygon([mkV(v2[0]), mkV(v2[1]), mkV(v2[2])]);
        if (face2.tags) poly.shared = [...face2.tags];
        polygons.push(poly);
      } else if (v2.length === 4) {
        const poly1 = new Polygon([mkV(v2[0]), mkV(v2[1]), mkV(v2[2])]);
        const poly2 = new Polygon([mkV(v2[0]), mkV(v2[2]), mkV(v2[3])]);
        if (face2.tags) {
          poly1.shared = [...face2.tags];
          poly2.shared = [...face2.tags];
        }
        polygons.push(poly1);
        polygons.push(poly2);
      } else if (v2.length > 4) {
        for (let i = 2; i < v2.length; i++) {
          const poly = new Polygon([mkV(v2[0]), mkV(v2[i - 1]), mkV(v2[i])]);
          if (face2.tags) poly.shared = [...face2.tags];
          polygons.push(poly);
        }
      }
    });
    return polygons;
  }
  const p = mesh2.positions;
  const idx = mesh2.indices;
  const c = mesh2.colors;
  if (!p || !idx) return [];
  for (let i = 0; i < idx.length; i += 3) {
    const verts = [];
    for (let j = 0; j < 3; j++) {
      const id = idx[i + j];
      const vert = new Vertex(new Vector3D(p[id * 3], p[id * 3 + 1], p[id * 3 + 2]));
      if (c && c.length >= id * 4 + 3) {
        vert.col = [c[id * 4], c[id * 4 + 1], c[id * 4 + 2], c[id * 4 + 3] || 1];
      }
      verts.push(vert);
    }
    polygons.push(new Polygon(verts));
  }
  return polygons;
}
function polygonsToMesh(polygons) {
  const faces = [];
  const PRECISION = 1e3;
  const quantize = (val) => Math.round(val * PRECISION) / PRECISION;
  polygons.forEach((poly) => {
    if (!poly.vertices || poly.vertices.length < 3) return;
    const tags = poly.shared || [];
    const faceVerts = poly.vertices.map((v2) => ({
      pos: [quantize(v2.pos.x), quantize(v2.pos.y), quantize(v2.pos.z)],
      col: v2.col ? [...v2.col] : [1, 1, 1, 1],
      norm: [poly.plane.normal.x, poly.plane.normal.y, poly.plane.normal.z]
    }));
    for (let j = 2; j < faceVerts.length; j++) {
      faces.push({
        vertices: [faceVerts[0], faceVerts[j - 1], faceVerts[j]],
        tags: [...tags]
      });
    }
  });
  return { faces };
}

// geelooy/libs/awtsmoos-procedural-core/src/core/geometry/csg/csg.js
var CSG = class _CSG {
  constructor() {
    this.polygons = [];
  }
  static fromPolygons(polygons) {
    const csg = new _CSG();
    csg.polygons = polygons;
    return csg;
  }
  static fromMesh(renderData) {
    if (!renderData) return new _CSG();
    return _CSG.fromPolygons(meshToPolygons(renderData));
  }
  toMesh() {
    return polygonsToMesh(this.polygons);
  }
  clone() {
    const csg = new _CSG();
    csg.polygons = this.polygons.map((p) => p.clone());
    return csg;
  }
  union(csg) {
    let polygonsA = this.clone().polygons;
    let polygonsB = csg.clone().polygons;
    const treeA = new Tree(this.polygons);
    const treeB = new Tree(csg.polygons);
    treeB.clipPolygons(polygonsA, false);
    treeA.clipPolygons(polygonsB, false);
    return _CSG.fromPolygons(polygonsA.concat(polygonsB));
  }
  /**
   * B"H - THE REFINED SUBTRACTION (A - B)
   * Now preserves the internal tags of the cutter (B).
   */
  subtract(csg, insideTag = null) {
    console.log(`B"H - \u2702\uFE0F [CSG::Subtract]: Performing binary division...`);
    let polygonsA = this.clone().polygons;
    let polygonsB = csg.clone().polygons;
    const treeA = new Tree(this.polygons);
    const treeB = new Tree(csg.polygons);
    treeB.clipPolygons(polygonsA, false);
    treeA.clipPolygons(polygonsB, true);
    polygonsB.forEach((p) => {
      p.flip();
      if (insideTag) {
        if (!p.shared) p.shared = [];
        if (!p.shared.includes(insideTag)) p.shared.push(insideTag);
      }
    });
    console.log(`      -> \u{1F3C1} Subtraction complete. Resulting in ${polygonsA.length + polygonsB.length} polygons.`);
    return _CSG.fromPolygons(polygonsA.concat(polygonsB));
  }
  intersect(csg) {
    let polygonsA = this.clone().polygons;
    let polygonsB = csg.clone().polygons;
    const treeA = new Tree(this.polygons);
    const treeB = new Tree(csg.polygons);
    treeB.clipPolygons(polygonsA, true);
    treeA.clipPolygons(polygonsB, true);
    return _CSG.fromPolygons(polygonsA.concat(polygonsB));
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/BooleanDoorwayGeometryCache.js
var MAX_CACHE_ENTRIES = 64;
var geometryCache = /* @__PURE__ */ new Map();
var cacheHits = 0;
var cacheMisses = 0;
function resolveBooleanDoorwayGeometry(definition4, createGeometry) {
  const cacheKey = createDoorwayCacheKey(definition4);
  const cachedGeometry = geometryCache.get(cacheKey);
  if (cachedGeometry) {
    cacheHits += 1;
    return cachedGeometry;
  }
  cacheMisses += 1;
  const geometry = freezeGeometry(createGeometry());
  geometryCache.set(cacheKey, geometry);
  trimOldestEntries();
  return geometry;
}
function createDoorwayCacheKey(definition4) {
  const wall = definition4.size || {};
  const door = definition4.door || {};
  return [
    finiteNumber(wall.x, 7),
    finiteNumber(wall.y, 3),
    finiteNumber(wall.z, 0.7),
    finiteNumber(door.x, 2.2),
    finiteNumber(door.y, 2.15),
    positiveNumber(definition4.texturePolicy?.tileWorld, 6)
  ].join("|");
}
function finiteNumber(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}
function positiveNumber(value, fallback) {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}
function freezeGeometry(geometry) {
  Object.freeze(geometry.positions);
  Object.freeze(geometry.indices);
  Object.freeze(geometry.uvs);
  return Object.freeze(geometry);
}
function trimOldestEntries() {
  while (geometryCache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = geometryCache.keys().next().value;
    geometryCache.delete(oldestKey);
  }
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/BooleanDoorwayUvProjection.js
function projectBooleanDoorwayUv(position, normal = [0, 0, 1], tileWorld) {
  const absoluteX = Math.abs(normal[0]);
  const absoluteY = Math.abs(normal[1]);
  const absoluteZ = Math.abs(normal[2]);
  if (absoluteY >= absoluteX && absoluteY >= absoluteZ) {
    return [
      position[0] / tileWorld,
      position[2] / tileWorld
    ];
  }
  if (absoluteX >= absoluteZ) {
    return [
      position[2] / tileWorld,
      position[1] / tileWorld
    ];
  }
  return [
    position[0] / tileWorld,
    position[1] / tileWorld
  ];
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/BooleanDoorwayMeshData.js
function createClosedCuboidMesh({
  x,
  y,
  z,
  centerY = 0
}) {
  const halfX = x / 2;
  const halfY = y / 2;
  const halfZ = z / 2;
  const points = {
    leftBackBottom: [-halfX, centerY - halfY, -halfZ],
    leftBackTop: [-halfX, centerY + halfY, -halfZ],
    leftFrontBottom: [-halfX, centerY - halfY, halfZ],
    leftFrontTop: [-halfX, centerY + halfY, halfZ],
    rightBackBottom: [halfX, centerY - halfY, -halfZ],
    rightBackTop: [halfX, centerY + halfY, -halfZ],
    rightFrontBottom: [halfX, centerY - halfY, halfZ],
    rightFrontTop: [halfX, centerY + halfY, halfZ]
  };
  return {
    faces: [
      face(points.leftFrontBottom, points.rightFrontBottom, points.rightFrontTop, points.leftFrontTop),
      face(points.rightBackBottom, points.leftBackBottom, points.leftBackTop, points.rightBackTop),
      face(points.leftBackBottom, points.leftFrontBottom, points.leftFrontTop, points.leftBackTop),
      face(points.rightFrontBottom, points.rightBackBottom, points.rightBackTop, points.rightFrontTop),
      face(points.leftFrontTop, points.rightFrontTop, points.rightBackTop, points.leftBackTop),
      face(points.leftBackBottom, points.rightBackBottom, points.rightFrontBottom, points.leftFrontBottom)
    ]
  };
}
function flattenBooleanMesh(mesh2, tileWorld) {
  const positions = [];
  const indices = [];
  const uvs = [];
  for (const meshFace of mesh2.faces || []) {
    const firstIndex = positions.length / 3;
    const vertices = meshFace.vertices || [];
    for (const vertex of vertices) {
      positions.push(
        vertex.pos[0],
        vertex.pos[1],
        vertex.pos[2]
      );
      uvs.push(
        ...projectBooleanDoorwayUv(
          vertex.pos,
          vertex.norm,
          tileWorld
        )
      );
    }
    for (let index = 2; index < vertices.length; index += 1) {
      indices.push(
        firstIndex,
        firstIndex + index - 1,
        firstIndex + index
      );
    }
  }
  return {
    indices,
    positions,
    uvs
  };
}
function face(...positions) {
  return {
    vertices: positions.map((position) => ({
      col: [1, 1, 1, 1],
      pos: [...position]
    }))
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/BooleanDoorwayGeometry.js
function createBooleanDoorwayMesh(definition4 = {}) {
  return resolveBooleanDoorwayGeometry(
    definition4,
    () => carveBooleanDoorway(definition4)
  );
}
function carveBooleanDoorway(definition4) {
  const wallSize = {
    x: finiteNumber2(definition4.size?.x, 7),
    y: finiteNumber2(definition4.size?.y, 3),
    z: finiteNumber2(definition4.size?.z, 0.7)
  };
  const opening = {
    x: finiteNumber2(definition4.door?.x, 2.2),
    y: finiteNumber2(definition4.door?.y, 2.15)
  };
  const wall = createClosedCuboidMesh(wallSize);
  const cutter = createClosedCuboidMesh({
    centerY: -wallSize.y / 2 + opening.y / 2,
    x: opening.x,
    y: opening.y + 0.04,
    z: wallSize.z + 0.2
  });
  const carved = CSG.fromMesh(wall).subtract(CSG.fromMesh(cutter), "door-reveal").toMesh();
  return flattenBooleanMesh(
    carved,
    positiveNumber2(definition4.texturePolicy?.tileWorld, 6)
  );
}
function finiteNumber2(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}
function positiveNumber2(value, fallback) {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/ProceduralBridge.js
var PROCEDURAL_SOURCE = "Awtsmoos procedural primitives + true CSG doorway difference";
function proceduralData(definition4) {
  const raw = rawMesh(definition4);
  const vertices = [];
  for (let index = 0; index < raw.positions.length; index += 3) {
    vertices.push(worldPoint(
      definition4,
      raw.positions[index],
      raw.positions[index + 1],
      raw.positions[index + 2]
    ));
  }
  return {
    vertices,
    indices: raw.indices || [],
    colors: raw.colors || [],
    uvs: raw.uvs || null
  };
}
function manualMesh({ vertices = [], faces = [], indices = [], uvs = [] }) {
  const positions = vertices.flatMap(point);
  const flatIndices = indices.length ? [...indices] : faces.flatMap(triangulateFace);
  const flatUvs = uvs.length === vertices.length * 2 ? [...uvs] : null;
  return { positions, indices: flatIndices, uvs: flatUvs };
}
function rawMesh(definition4) {
  if (definition4.shape === "manual") {
    return manualMesh(definition4);
  }
  if (definition4.shape === "doorway") {
    return createBooleanDoorwayMesh(definition4);
  }
  if (definition4.shape === "cylinder") {
    return cleanCylinderMesh(definition4);
  }
  if (definition4.shape === "triPrism") {
    return triPrismMesh(definition4);
  }
  if (definition4.shape === "sphere") {
    return sphereMesh({
      radius: definition4.radius || 1,
      rings: 10,
      segments: 20,
      color: definition4.rgba
    });
  }
  return cubeMesh({
    size: [1, 1, 1],
    color: definition4.rgba || [0.7, 0.7, 0.7, 1]
  });
}
function point(value) {
  if (Array.isArray(value)) {
    return [value[0], value[1], value[2]];
  }
  return [value.x || 0, value.y || 0, value.z || 0];
}
function triangulateFace(face2) {
  const output = [];
  for (let index = 1; index < face2.length - 1; index += 1) {
    output.push(face2[0], face2[index], face2[index + 1]);
  }
  return output;
}
function triPrismMesh(definition4) {
  const size = definition4.size || { x: 2, y: 1, z: 0.4 };
  const hx = size.x / 2;
  const hy = size.y / 2;
  const hz = size.z / 2;
  return manualMesh({
    vertices: [
      [-hx, -hy, hz],
      [hx, -hy, hz],
      [0, hy, hz],
      [-hx, -hy, -hz],
      [hx, -hy, -hz],
      [0, hy, -hz]
    ],
    faces: [
      [0, 1, 2],
      [4, 3, 5],
      [0, 3, 4, 1],
      [1, 4, 5, 2],
      [2, 5, 3, 0]
    ]
  });
}
function cleanCylinderMesh(definition4) {
  const radius = definition4.radius || 1;
  const height = definition4.height || 1;
  const segments = Math.max(12, definition4.segments || 32);
  const mesh2 = { positions: [], indices: [] };
  const topCenter = addVertex(mesh2, 0, height / 2, 0);
  const bottomCenter = addVertex(mesh2, 0, -height / 2, 0);
  const top = [];
  const bottom = [];
  for (let segment2 = 0; segment2 < segments; segment2 += 1) {
    const angle = segment2 / segments * Math.PI * 2;
    top.push(addVertex(mesh2, Math.cos(angle) * radius, height / 2, Math.sin(angle) * radius));
    bottom.push(addVertex(mesh2, Math.cos(angle) * radius, -height / 2, Math.sin(angle) * radius));
  }
  for (let segment2 = 0; segment2 < segments; segment2 += 1) {
    const next = (segment2 + 1) % segments;
    triangle(mesh2, topCenter, top[next], top[segment2]);
    triangle(mesh2, bottomCenter, bottom[segment2], bottom[next]);
    triangle(mesh2, top[segment2], bottom[next], bottom[segment2]);
    triangle(mesh2, top[segment2], top[next], bottom[next]);
  }
  return mesh2;
}
function addVertex(mesh2, x, y, z) {
  mesh2.positions.push(x, y, z);
  return mesh2.positions.length / 3 - 1;
}
function triangle(mesh2, a, b, c) {
  mesh2.indices.push(a, b, c);
}
function worldPoint(definition4, x, y, z) {
  const pointValue = rotate(
    v(x, y, z),
    definition4.rotation || {
      x: definition4.pitch || 0,
      y: definition4.yaw || 0,
      z: definition4.roll || 0
    }
  );
  const center = definition4.position || { x: 0, y: 0, z: 0 };
  return v(pointValue.x + center.x, pointValue.y + center.y, pointValue.z + center.z);
}
function rotate(pointValue, rotation) {
  let { x, y, z } = pointValue;
  const cx = Math.cos(rotation.x || 0);
  const sx = Math.sin(rotation.x || 0);
  const cy = Math.cos(rotation.y || 0);
  const sy = Math.sin(rotation.y || 0);
  const cz = Math.cos(rotation.z || 0);
  const sz = Math.sin(rotation.z || 0);
  [y, z] = [y * cx - z * sx, y * sx + z * cx];
  [x, z] = [x * cy - z * sy, x * sy + z * cy];
  [x, y] = [x * cz - y * sz, x * sz + y * cz];
  return v(x, y, z);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/primitives/PrimitiveTransform.js
function transformPrimitivePoint(point3, definition4) {
  const rotated = rotatePrimitivePoint(point3, definitionRotation(definition4));
  const center = definition4.position || { x: 0, y: 0, z: 0 };
  return v(
    rotated.x + center.x,
    rotated.y + center.y,
    rotated.z + center.z
  );
}
function rotatePrimitivePoint(point3, rotation) {
  let { x, y, z } = point3;
  const cx = Math.cos(rotation.x || 0);
  const sx = Math.sin(rotation.x || 0);
  const cy = Math.cos(rotation.y || 0);
  const sy = Math.sin(rotation.y || 0);
  const cz = Math.cos(rotation.z || 0);
  const sz = Math.sin(rotation.z || 0);
  [y, z] = [y * cx - z * sx, y * sx + z * cx];
  [x, z] = [x * cy - z * sy, x * sy + z * cy];
  [x, y] = [x * cz - y * sz, x * sz + y * cz];
  return v(x, y, z);
}
function definitionRotation(definition4) {
  return definition4.rotation || {
    x: definition4.pitch || 0,
    y: definition4.yaw || 0,
    z: definition4.roll || 0
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/primitives/PrimitiveBoxGeometry.js
function createPrimitiveBoxGeometry(definition4) {
  const size = definition4.size;
  const half = { x: size.x / 2, y: size.y / 2, z: size.z / 2 };
  const tile = positive(definition4.texturePolicy?.tileWorld, 1);
  const mesh2 = { indices: [], uvs: [], vertices: [] };
  appendFace(mesh2, definition4, [
    [-half.x, -half.y, half.z],
    [half.x, -half.y, half.z],
    [half.x, half.y, half.z],
    [-half.x, half.y, half.z]
  ], size.x / tile, size.y / tile);
  appendFace(mesh2, definition4, [
    [half.x, -half.y, -half.z],
    [-half.x, -half.y, -half.z],
    [-half.x, half.y, -half.z],
    [half.x, half.y, -half.z]
  ], size.x / tile, size.y / tile);
  appendFace(mesh2, definition4, [
    [-half.x, -half.y, -half.z],
    [-half.x, -half.y, half.z],
    [-half.x, half.y, half.z],
    [-half.x, half.y, -half.z]
  ], size.z / tile, size.y / tile);
  appendFace(mesh2, definition4, [
    [half.x, -half.y, half.z],
    [half.x, -half.y, -half.z],
    [half.x, half.y, -half.z],
    [half.x, half.y, half.z]
  ], size.z / tile, size.y / tile);
  appendFace(mesh2, definition4, [
    [-half.x, half.y, half.z],
    [half.x, half.y, half.z],
    [half.x, half.y, -half.z],
    [-half.x, half.y, -half.z]
  ], size.x / tile, size.z / tile);
  appendFace(mesh2, definition4, [
    [-half.x, -half.y, -half.z],
    [half.x, -half.y, -half.z],
    [half.x, -half.y, half.z],
    [-half.x, -half.y, half.z]
  ], size.x / tile, size.z / tile);
  return mesh2;
}
function appendFace(mesh2, definition4, corners, uSpan, vSpan) {
  const first = mesh2.vertices.length;
  const faceUvs = [[0, 0], [uSpan, 0], [uSpan, vSpan], [0, vSpan]];
  for (let index = 0; index < corners.length; index += 1) {
    mesh2.vertices.push(transformPrimitivePoint(v(...corners[index]), definition4));
    mesh2.uvs.push(...faceUvs[index]);
  }
  mesh2.indices.push(first, first + 1, first + 2, first, first + 2, first + 3);
}
function positive(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/primitives/PrimitiveDiamondGeometry.js
function createPrimitiveDiamondGeometry(definition4) {
  const size = definition4.size;
  const localVertices = [
    v(0, size.y / 2, 0),
    v(size.x / 2, 0, 0),
    v(0, 0, size.z / 2),
    v(-size.x / 2, 0, 0),
    v(0, 0, -size.z / 2),
    v(0, -size.y / 2, 0)
  ];
  return {
    indices: [
      0,
      2,
      1,
      0,
      3,
      2,
      0,
      4,
      3,
      0,
      1,
      4,
      5,
      1,
      2,
      5,
      2,
      3,
      5,
      3,
      4,
      5,
      4,
      1
    ],
    uvs: null,
    vertices: localVertices.map((point3) => transformPrimitivePoint(point3, definition4))
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/primitives/DoorwayFrameGeometry.js
var MINIMUM_FRAME_WIDTH = 0.02;
function createDoorwayFrameGeometry(definition4 = {}) {
  const wall = normalizedSize(definition4.size, { x: 10, y: 10, z: 1 });
  const requestedDoor = normalizedSize(definition4.door, {
    x: 3,
    y: 4,
    z: wall.z + 2
  });
  const openingWidth = clamp(
    requestedDoor.x,
    MINIMUM_FRAME_WIDTH,
    wall.x - MINIMUM_FRAME_WIDTH * 2
  );
  const openingHeight = clamp(
    requestedDoor.y,
    MINIMUM_FRAME_WIDTH,
    wall.y - MINIMUM_FRAME_WIDTH
  );
  const pierWidth = (wall.x - openingWidth) / 2;
  const lintelHeight = wall.y - openingHeight;
  const parts = [
    boxPart(definition4, {
      center: v(-(openingWidth + pierWidth) / 2, 0, 0),
      size: { x: pierWidth, y: wall.y, z: wall.z }
    }),
    boxPart(definition4, {
      center: v((openingWidth + pierWidth) / 2, 0, 0),
      size: { x: pierWidth, y: wall.y, z: wall.z }
    }),
    boxPart(definition4, {
      center: v(0, openingHeight / 2, 0),
      size: { x: openingWidth, y: lintelHeight, z: wall.z }
    })
  ];
  return mergeGeometry(parts);
}
function boxPart(definition4, { center, size }) {
  return createPrimitiveBoxGeometry({
    ...definition4,
    door: void 0,
    position: transformPrimitivePoint(center, definition4),
    shape: "box",
    size
  });
}
function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), Math.max(minimum, maximum));
}
function mergeGeometry(parts) {
  const merged = { vertices: [], indices: [], uvs: [] };
  for (const part4 of parts) {
    const vertexOffset = merged.vertices.length;
    merged.vertices.push(...part4.vertices);
    merged.indices.push(...part4.indices.map((index) => index + vertexOffset));
    merged.uvs.push(...part4.uvs);
  }
  return merged;
}
function normalizedSize(value, fallback) {
  return {
    x: positive2(value?.x, fallback.x),
    y: positive2(value?.y, fallback.y),
    z: positive2(value?.z, fallback.z)
  };
}
function positive2(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/primitives/PrimitiveGeometryFactory.js
var PROCEDURAL_SHAPES = Object.freeze([
  "manual",
  "doorway",
  "cylinder",
  "sphere",
  "triPrism"
]);
function createPrimitiveGeometryData(definition4) {
  if (definition4.shape === "doorway") {
    return createDoorwayFrameGeometry(definition4);
  }
  if (isProceduralShape(definition4.shape)) {
    return proceduralData({
      ...definition4,
      rgba: colorArray(definition4.color)
    });
  }
  if (definition4.shape === "diamond") {
    return createPrimitiveDiamondGeometry(definition4);
  }
  return createPrimitiveBoxGeometry(definition4);
}
function isProceduralShape(shape) {
  return PROCEDURAL_SHAPES.includes(shape);
}
function colorArray(hex = "#777777") {
  const number = parseInt(String(hex).replace("#", ""), 16);
  return [
    (number >> 16 & 255) / 255,
    (number >> 8 & 255) / 255,
    (number & 255) / 255,
    1
  ];
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/primitives/PrimitiveGeometryBuffers.js
function flattenPrimitiveVertices(vertices) {
  return vertices.flatMap((point3) => [point3.x, point3.y, point3.z]);
}
function primitiveIndexArray(indices) {
  return Math.max(0, ...indices) > 65535 ? new Uint32Array(indices) : new Uint16Array(indices);
}
function createPrimitiveVertexNormals(data) {
  const normals = Array.from({ length: data.vertices.length }, () => v());
  for (let index = 0; index < data.indices.length; index += 3) {
    const face2 = [
      data.indices[index],
      data.indices[index + 1],
      data.indices[index + 2]
    ];
    const normal = triangleNormal(
      data.vertices[face2[0]],
      data.vertices[face2[1]],
      data.vertices[face2[2]]
    );
    for (const vertexIndex of face2) addNormal(normals[vertexIndex], normal);
  }
  return normals.flatMap(normalized);
}
function addNormal(target, source) {
  target.x += source.x;
  target.y += source.y;
  target.z += source.z;
}
function normalized(normal) {
  const length3 = Math.hypot(normal.x, normal.y, normal.z) || 1;
  return [normal.x / length3, normal.y / length3, normal.z / length3];
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/assets/DetailTextureFamilies.js
var freeze = (value) => Object.freeze(value);
var transparentAspen = exactMaterialUrl(
  "awtsmoos-nature/chai-forest/textures/leaves/aspen.png"
);
var DETAIL_TEXTURE_FAMILIES = Object.freeze({
  leaves: freeze({
    leaf1: fullMaterialUrl("leaf 1"),
    oakSpring: fullMaterialUrl("oak leaf spring"),
    oakFall: fullMaterialUrl("oak leaf fall"),
    chaiOak: exactMaterialUrl("awtsmoos-nature/chai-forest/textures/leaves/oak.png"),
    chaiAsh: exactMaterialUrl("awtsmoos-nature/chai-forest/textures/leaves/ash.png"),
    chaiAspen: transparentAspen,
    chaiPine: exactMaterialUrl("awtsmoos-nature/chai-forest/textures/leaves/pine.png")
  }),
  botany: freeze({
    petalAtlas: exactMaterialUrl("awtsmoos-nature/ilanos/trees/sakura petal.png")
  }),
  metals: freeze({
    gold2: fullMaterialUrl("gold 2"),
    silver1: fullMaterialUrl("silver 1"),
    copper1: fullMaterialUrl("copper 1"),
    rustyIron: fullMaterialUrl("rusty iron")
  }),
  fabric: freeze({
    parchment: fullMaterialUrl("parchment"),
    leather: fullMaterialUrl("leather"),
    tanCloth: fullMaterialUrl("tan cloth"),
    rope: fullMaterialUrl("raveled rope")
  }),
  fur: freeze({
    cow: fullMaterialUrl("cow fur 1"),
    deer: fullMaterialUrl("deer fur 1"),
    fox: fullMaterialUrl("fox fur 1"),
    horse: fullMaterialUrl("horse fur 1")
  })
});

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/assets/SurfaceTextureFamilies.js
var freeze2 = (value) => Object.freeze(value);
var SURFACE_TEXTURE_FAMILIES = Object.freeze({
  bricks: freeze2({
    white1: fullMaterialUrl("white brick 1"),
    red1: fullMaterialUrl("red brick 1"),
    red2: fullMaterialUrl("red brick 2"),
    red3: fullMaterialUrl("red brick 3"),
    yellow1: fullMaterialUrl("yellow brick 1"),
    weatheredRed: fullMaterialUrl("weathered Red bricks 1"),
    limestone1: fullMaterialUrl("limestone bricks 1"),
    fieldstone1: fullMaterialUrl("weathered fieldstone Rock 1")
  }),
  terrain: freeze2({
    dirt1: fullMaterialUrl("dirt 1"),
    dirt2: fullMaterialUrl("dirt 2"),
    dirt5: fullMaterialUrl("dirt 5"),
    dirt6: fullMaterialUrl("dirt 6"),
    dirtGrass1: fullMaterialUrl("dirt grass 1"),
    dirtGrass2: fullMaterialUrl("dirt grass 2"),
    dirtGrass3: fullMaterialUrl("dirt grass 3"),
    darkForestFloor: fullMaterialUrl("dark forest floor nonlight"),
    forestLeaves: fullMaterialUrl("forest floor covered with leaves"),
    marshGrass: fullMaterialUrl("marsh grass"),
    mud: fullMaterialUrl("mud"),
    sand1: fullMaterialUrl("sand 1"),
    tilledSoil: fullMaterialUrl("tilled soil"),
    grass1: fullMaterialUrl("grass 1"),
    grass4: fullMaterialUrl("grass 4"),
    grass5: fullMaterialUrl("grass 5"),
    grass6: fullMaterialUrl("grass 6"),
    grass7: fullMaterialUrl("grass 7"),
    grass8: fullMaterialUrl("grass 8")
  }),
  wood: freeze2({
    bark1: fullMaterialUrl("tree bark 1"),
    oak1: fullMaterialUrl("oak wood 1"),
    oak2: fullMaterialUrl("oak wood 2"),
    oak3: fullMaterialUrl("oak wood 3"),
    planks1: fullMaterialUrl("wooden oak planks 1"),
    plankedFloor: fullMaterialUrl("wooden planked floor")
  }),
  water: freeze2({
    still: fullMaterialUrl("seamless water"),
    bright: fullMaterialUrl("seamless water brighter"),
    shallowRiver: fullMaterialUrl("shallow river water"),
    raw: fullMaterialUrl("water not seamless")
  }),
  stone: freeze2({
    stone1: fullMaterialUrl("stone 1"),
    bluestone1: fullMaterialUrl("bluestone 1"),
    cobblestone: fullMaterialUrl("cobblestone"),
    floor1: fullMaterialUrl("stone floor"),
    floor2: fullMaterialUrl("stone floor 2"),
    granite1: fullMaterialUrl("polished granite Rock 1")
  }),
  roof: freeze2({
    tile1: fullMaterialUrl("tiled roof 1"),
    tile2: fullMaterialUrl("tiled roof 2"),
    tile3: fullMaterialUrl("tiled roof 3 smaller tiles"),
    tile4: fullMaterialUrl("tiled roof 4")
  })
});

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/assets/TextureFamilies.js
var TEXTURE_URLS = Object.freeze({
  ...SURFACE_TEXTURE_FAMILIES,
  ...DETAIL_TEXTURE_FAMILIES
});

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/assets/WorldMaterialPresets.js
var freeze3 = (value) => Object.freeze(value);
var WORLD_MATERIAL_PRESETS = Object.freeze({
  terrainMix: freeze3([
    TEXTURE_URLS.terrain.grass1,
    TEXTURE_URLS.terrain.grass6,
    TEXTURE_URLS.terrain.dirtGrass3,
    TEXTURE_URLS.terrain.darkForestFloor,
    TEXTURE_URLS.terrain.forestLeaves,
    TEXTURE_URLS.terrain.marshGrass,
    TEXTURE_URLS.terrain.mud
  ]),
  forestLeaves: freeze3([
    TEXTURE_URLS.leaves.chaiOak,
    TEXTURE_URLS.leaves.chaiAsh,
    TEXTURE_URLS.leaves.chaiAspen,
    TEXTURE_URLS.leaves.chaiPine
  ]),
  forestBark: freeze3([
    TEXTURE_URLS.wood.bark1,
    TEXTURE_URLS.wood.oak1,
    TEXTURE_URLS.wood.oak2,
    TEXTURE_URLS.wood.oak3
  ]),
  houseWalls: freeze3([
    TEXTURE_URLS.bricks.white1,
    TEXTURE_URLS.bricks.weatheredRed,
    TEXTURE_URLS.bricks.limestone1,
    TEXTURE_URLS.bricks.fieldstone1
  ]),
  villageProps: freeze3([
    TEXTURE_URLS.wood.planks1,
    TEXTURE_URLS.metals.rustyIron,
    TEXTURE_URLS.fabric.parchment,
    TEXTURE_URLS.fabric.rope,
    TEXTURE_URLS.metals.gold2
  ]),
  water: freeze3([
    TEXTURE_URLS.water.shallowRiver,
    TEXTURE_URLS.water.bright,
    TEXTURE_URLS.water.still
  ])
});
var TEXTURE_PURPOSES = Object.freeze({
  houseWall: TEXTURE_URLS.bricks.white1,
  lavaPlatform: TEXTURE_URLS.bricks.red3,
  lavaPlatformAlt: TEXTURE_URLS.bricks.red2,
  road: TEXTURE_URLS.bricks.yellow1,
  coin: TEXTURE_URLS.metals.gold2,
  terrainMix: TEXTURE_URLS.terrain.dirtGrass3,
  terrainDirtSet: freeze3([
    TEXTURE_URLS.terrain.dirt1,
    TEXTURE_URLS.terrain.dirt2,
    TEXTURE_URLS.terrain.dirtGrass1,
    TEXTURE_URLS.terrain.dirtGrass2,
    TEXTURE_URLS.terrain.dirtGrass3,
    TEXTURE_URLS.terrain.darkForestFloor,
    TEXTURE_URLS.terrain.marshGrass
  ]),
  houseFloor: TEXTURE_URLS.stone.stone1,
  houseDoor: TEXTURE_URLS.wood.bark1,
  houseRoof: TEXTURE_URLS.roof.tile2,
  forestBark: TEXTURE_URLS.wood.bark1,
  forestLeaf: TEXTURE_URLS.leaves.chaiOak,
  botanicalLeaf: TEXTURE_URLS.leaves.chaiAspen,
  botanicalPetal: TEXTURE_URLS.botany.petalAtlas,
  lake: TEXTURE_URLS.water.shallowRiver,
  mezuzaCase: TEXTURE_URLS.metals.gold2,
  mezuzaScroll: TEXTURE_URLS.fabric.parchment
});

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/assets/TextureRepeat.js
var REPEAT_HOOKS = Object.freeze({
  floorTileWorld: 4,
  roadTileWorld: 3.8,
  roofTileWorld: 7,
  surfaceTexelsPerWorld: 96,
  terrainTexelsPerWorld: 48,
  wallTileWorld: 6
});
function textureSize(image) {
  return Object.freeze({
    h: image?.naturalHeight || image?.videoHeight || image?.height || 0,
    w: image?.naturalWidth || image?.videoWidth || image?.width || 0
  });
}
function publicUrl(image) {
  return image?.dataset?.url || image?.dataset?.publicUrl || image?.src || null;
}
function repeatFromPixels(width, height, image, texelsPerWorld = REPEAT_HOOKS.surfaceTexelsPerWorld, fallback = [1, 1]) {
  const source = textureSize(image);
  if (!source.w || !source.h) return [...fallback];
  const density = positive3(texelsPerWorld, REPEAT_HOOKS.surfaceTexelsPerWorld);
  return [
    Math.abs(Number(width) || 0) * density / source.w,
    Math.abs(Number(height) || 0) * density / source.h
  ];
}
function materialTexture(color, image, repeat = [1, 1], options = {}) {
  return {
    anisotropy: options.anisotropy ?? 2,
    backfaceCull: Boolean(options.backfaceCull),
    color,
    doubleSided: Boolean(options.doubleSided),
    mapImage: image || null,
    mapRepeat: [...repeat],
    texturePolicy: texturePolicy(image, repeat, options),
    textureUrl: publicUrl(image)
  };
}
function terrainRepeat(size, image) {
  return repeatFromPixels(
    size,
    size,
    image,
    REPEAT_HOOKS.terrainTexelsPerWorld
  );
}
function texturePolicy(image, repeat, options) {
  return {
    fullResolution: true,
    hook: options.hook || null,
    nativeTexelDensity: options.nativeTexelDensity !== false,
    oneDrawCall: true,
    originalPixels: textureSize(image),
    projection: options.projection || "cube-world",
    repeat: [...repeat],
    shaderWrap: "mirror-pingpong-repeat",
    texelsPerWorld: options.texelsPerWorld || REPEAT_HOOKS.surfaceTexelsPerWorld,
    tileWorld: options.tileWorld || null,
    uvUnitsPerWorld: options.uvUnitsPerWorld || null
  };
}
function positive3(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/primitives/PrimitiveTexturePolicy.js
var WHOLE_IMAGE_PATTERN = /(?:sign|scroll|mezuza|label|decal|atlas|leaf|blossom|window-card|interior-card|portrait|icon|sky|cloud)/i;
function createPrimitiveTexturePolicy(definition4, uvUnitsPerWorld) {
  const authored = definition4.texturePolicy || {};
  return {
    fullResolution: true,
    nativeTexelDensity: primitiveUsesNativeDensity(definition4),
    originalPixelsOnly: true,
    resampleSource: false,
    texelsPerWorld: authored.texelsPerWorld || REPEAT_HOOKS.surfaceTexelsPerWorld,
    uvUnitsPerWorld: authored.uvUnitsPerWorld || uvUnitsPerWorld || null,
    ...authored
  };
}
function primitiveUsesNativeDensity(definition4) {
  const authored = definition4.texturePolicy || {};
  if (authored.nativeTexelDensity === true) return true;
  if (authored.nativeTexelDensity === false) return false;
  return !primitiveUsesWholeImage(definition4);
}
function primitiveUsesWholeImage(definition4) {
  const text = [
    definition4.id,
    definition4.texturePolicy?.role,
    definition4.userData?.family,
    definition4.userData?.part
  ].filter(Boolean).join(" ");
  return WHOLE_IMAGE_PATTERN.test(text);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/primitives/PrimitiveMaterialFactory.js
function createPrimitiveMaterial(definition4, uvUnitsPerWorld) {
  const textureUrl = textureUrlFor(definition4);
  const mapImage = definition4.mapImage || cachedTextureImage(textureUrl) || null;
  const mixImage = definition4.mixImage || cachedTextureImage(definition4.mixTextureUrl) || null;
  const material = new MeshStandardMaterial({
    alphaCutoff: definition4.alphaCutoff ?? 0.5,
    alphaMode: definition4.alphaMode || (definition4.transparent ? "BLEND" : "OPAQUE"),
    color: colorArray(definition4.color),
    doubleSided: Boolean(definition4.doubleSided),
    name: definition4.id,
    opacity: definition4.opacity ?? 1,
    transparent: Boolean(definition4.transparent)
  });
  Object.assign(material, {
    alphaCutoff: definition4.alphaCutoff ?? 0.5,
    alphaMode: definition4.alphaMode || (definition4.transparent ? "BLEND" : "OPAQUE"),
    anisotropy: definition4.anisotropy ?? 3,
    backfaceCull: definition4.backfaceCull,
    emissiveStrength: definition4.emissiveStrength ?? 1.8,
    mapImage,
    mapRepeat: definition4.mapRepeat || [1, 1],
    mixImage,
    mixRepeat: definition4.mixRepeat || definition4.mapRepeat || [1, 1],
    mixTextureUrl: definition4.mixTextureUrl || mixImage?.dataset?.publicUrl || null,
    normalTextureUrl: definition4.normalTextureUrl || null,
    opacity: definition4.opacity ?? 1,
    texturePolicy: materialPolicy(definition4, textureUrl, mapImage, uvUnitsPerWorld),
    textureUrl,
    transparent: Boolean(definition4.transparent)
  });
  return material;
}
function materialPolicy(definition4, textureUrl, mapImage, uvUnitsPerWorld) {
  return {
    ...createPrimitiveTexturePolicy(definition4, uvUnitsPerWorld),
    fallbackApplied: !definition4.textureUrl && !definition4.mapImage,
    publicFirebase: false,
    realMapImage: Boolean(mapImage),
    sameOrigin: isSameOriginMaterialUrl(textureUrl)
  };
}
function textureUrlFor(definition4) {
  return definition4.textureUrl || definition4.mapImage?.dataset?.publicUrl || definition4.mapImage?.dataset?.url || definition4.mapImage?.src || fallbackTexture(definition4);
}
function fallbackTexture(definition4) {
  const id = String(definition4.id || "").toLowerCase();
  if (/water|lake|stream/.test(id)) return TEXTURE_URLS.water.shallowRiver;
  if (/grass|bush|flower|reed/.test(id)) return TEXTURE_URLS.terrain.grass7;
  if (/stone|well|cobble/.test(id)) return TEXTURE_URLS.stone.cobblestone;
  if (id.includes("roof")) return TEXTURE_URLS.roof.tile2;
  if (/gold|coin|lamp/.test(id)) return TEXTURE_URLS.metals.gold2;
  if (/sign|scroll|mezuza/.test(id)) return TEXTURE_PURPOSES.mezuzaScroll;
  if (/dirt|soil|garden/.test(id)) return TEXTURE_URLS.terrain.tilledSoil;
  return TEXTURE_URLS.wood.planks1;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/primitives/PrimitiveUvProjection.js
function projectPrimitiveUvs(vertices, normals, definition4) {
  const tile = positive4(definition4.texturePolicy?.tileWorld, 4);
  return vertices.flatMap((point3, index) => {
    const offset = index * 3;
    const ax = Math.abs(normals[offset]);
    const ay = Math.abs(normals[offset + 1]);
    const az = Math.abs(normals[offset + 2]);
    if (ay >= ax && ay >= az) return [point3.x / tile, point3.z / tile];
    if (ax >= az) return [point3.z / tile, point3.y / tile];
    return [point3.x / tile, point3.y / tile];
  });
}
function normalizePrimitiveUvsToWorld(uvs, uvUnitsPerWorld) {
  if (!uvUnitsPerWorld) return [...uvs];
  const [uUnits, vUnits] = uvUnitsPerWorld;
  return uvs.map((value, index) => index % 2 === 0 ? value / uUnits : value / vUnits);
}
function measureUvUnitsPerWorld(data) {
  const uWorld = [];
  const vWorld = [];
  for (let offset = 0; offset < data.indices.length; offset += 3) {
    const sample = triangleUvWorldScale(data, offset);
    if (!sample) continue;
    uWorld.push(sample.uWorld);
    vWorld.push(sample.vWorld);
  }
  if (!uWorld.length || !vWorld.length) return null;
  return [1 / robustMedian(uWorld), 1 / robustMedian(vWorld)];
}
function triangleUvWorldScale(data, offset) {
  const indices = data.indices.slice(offset, offset + 3);
  const [p0, p1, p2] = indices.map((index) => data.vertices[index]);
  const [uv0, uv1, uv2] = indices.map((index) => uvAt(data.uvs, index));
  const du1 = uv1[0] - uv0[0];
  const dv1 = uv1[1] - uv0[1];
  const du2 = uv2[0] - uv0[0];
  const dv2 = uv2[1] - uv0[1];
  const determinant = du1 * dv2 - du2 * dv1;
  if (Math.abs(determinant) < 1e-10) return null;
  const first = subtract(p1, p0);
  const second = subtract(p2, p0);
  const dPdu = combine(first, dv2, second, -dv1, determinant);
  const dPdv = combine(first, -du2, second, du1, determinant);
  const uWorld = length2(dPdu);
  const vWorld = length2(dPdv);
  return uWorld > 1e-8 && vWorld > 1e-8 ? { uWorld, vWorld } : null;
}
function robustMedian(values) {
  const logs = values.filter((value2) => Number.isFinite(value2) && value2 > 1e-8).map(Math.log).sort((left, right) => left - right);
  if (!logs.length) return 1;
  const middle = Math.floor(logs.length / 2);
  const value = logs.length % 2 ? logs[middle] : (logs[middle - 1] + logs[middle]) / 2;
  return Math.exp(value);
}
function uvAt(uvs, index) {
  return [uvs[index * 2], uvs[index * 2 + 1]];
}
function subtract(left, right) {
  return { x: left.x - right.x, y: left.y - right.y, z: left.z - right.z };
}
function combine(first, firstScale, second, secondScale, divisor) {
  return {
    x: (first.x * firstScale + second.x * secondScale) / divisor,
    y: (first.y * firstScale + second.y * secondScale) / divisor,
    z: (first.z * firstScale + second.z * secondScale) / divisor
  };
}
function length2(vector2) {
  return Math.hypot(vector2.x, vector2.y, vector2.z);
}
function positive4(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/Box3D.js
var WORLD_UV_BASIS = Object.freeze([1, 1]);
function createPrimitiveMesh(definition4) {
  const sourceData = createPrimitiveGeometryData(definition4);
  const normals = createPrimitiveVertexNormals(sourceData);
  const authoredUvs = sourceData.uvs || projectPrimitiveUvs(sourceData.vertices, normals, definition4);
  const measuredData = { ...sourceData, uvs: authoredUvs };
  const measuredUnits = measureUvUnitsPerWorld(measuredData);
  const physical = Boolean(primitiveUsesNativeDensity(definition4) && measuredUnits);
  const uvs = physical ? normalizePrimitiveUvsToWorld(authoredUvs, measuredUnits) : authoredUvs;
  const data = { ...sourceData, uvs };
  const textureBasis = physical ? WORLD_UV_BASIS : measuredUnits;
  const geometry = createBufferGeometry(data, normals);
  const material = createPrimitiveMaterial(definition4, textureBasis);
  const mesh2 = new Mesh(geometry, material);
  mesh2.name = definition4.id;
  mesh2.visible = definition4.visible !== false;
  mesh2.userData = primitiveUserData(definition4, material, measuredUnits, textureBasis);
  mesh2.setBaseTransform();
  return mesh2;
}
function primitiveColliders(definition4) {
  if (definition4.solid === false) return [];
  const data = createPrimitiveGeometryData(definition4);
  const floor = definition4.walkable === true ? void 0 : false;
  return trianglesFromIndexed(data.vertices, data.indices, {
    floor,
    kind: definition4.id,
    solid: true
  });
}
function primitiveUserData(definition4, material, measuredUnits, textureBasis) {
  return {
    ...definition4.userData || {},
    AwtsmoosMaterialEnforcement: material.mapImage ? "real-mapImage-bound" : "url-only-not-yet-loaded",
    AwtsmoosTextureDensity: {
      bakedWorldUv: material.texturePolicy.nativeTexelDensity,
      measuredUnits,
      native: material.texturePolicy.nativeTexelDensity,
      originalPixelsOnly: true,
      textureBasis
    },
    AwtsmoosTextureUrl: material.textureUrl,
    procedural: isProceduralShape(definition4.shape)
  };
}
function createBufferGeometry(data, normals) {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(
    flattenPrimitiveVertices(data.vertices)
  ), 3));
  geometry.setAttribute("normal", new BufferAttribute(new Float32Array(normals), 3));
  geometry.setAttribute("uv", new BufferAttribute(new Float32Array(data.uvs), 2));
  geometry.setIndex(new BufferAttribute(primitiveIndexArray(data.indices), 1));
  return geometry;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/CanonicalVillageHydrology.js
var CANONICAL_RIVER_CONTROL_POINTS = Object.freeze([
  point2(52, -56),
  point2(49, -44),
  point2(43, -34),
  point2(36, -24),
  point2(29, -14),
  point2(23, -4),
  point2(18, 7),
  point2(15, 22),
  point2(14, 42),
  point2(15, 62),
  point2(18, 82),
  point2(22, 108)
]);
var CANONICAL_RIVER_LAKE_INDEX = 8;
var CANONICAL_RIVER_CASCADES = Object.freeze([
  Object.freeze({ drop: 1.7, t: 0.09 }),
  Object.freeze({ drop: 1.35, t: 0.19 }),
  Object.freeze({ drop: 0.9, t: 0.3 })
]);
function point2(x, z) {
  return Object.freeze([x, z]);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageRiverPath.js
var RIVER_LAKE_T = CANONICAL_RIVER_LAKE_INDEX / (CANONICAL_RIVER_CONTROL_POINTS.length - 1);
function riverCenterAt(t) {
  const clamped = Math.max(0, Math.min(1, Number(t) || 0));
  const scaled = clamped * (CANONICAL_RIVER_CONTROL_POINTS.length - 1);
  const index = Math.min(CANONICAL_RIVER_CONTROL_POINTS.length - 2, Math.floor(scaled));
  const amount = scaled - index;
  const p0 = CANONICAL_RIVER_CONTROL_POINTS[Math.max(0, index - 1)];
  const p1 = CANONICAL_RIVER_CONTROL_POINTS[index];
  const p2 = CANONICAL_RIVER_CONTROL_POINTS[index + 1];
  const p3 = CANONICAL_RIVER_CONTROL_POINTS[Math.min(CANONICAL_RIVER_CONTROL_POINTS.length - 1, index + 2)];
  return {
    x: catmullRom(p0[0], p1[0], p2[0], p3[0], amount),
    z: catmullRom(p0[1], p1[1], p2[1], p3[1], amount)
  };
}
function riverWidthAt(t) {
  const clamped = Math.max(0, Math.min(1, Number(t) || 0));
  const lowerLake = Math.exp(-Math.pow((clamped - RIVER_LAKE_T) / 0.15, 2)) * 8.4;
  const plungePool = Math.exp(-Math.pow((clamped - 0.16) / 0.08, 2)) * 2.8;
  return 3.1 + lowerLake + plungePool + Math.sin(clamped * Math.PI * 3) * 0.28;
}
function sampleRiverPath(samples = 64) {
  const count = Math.max(8, Math.floor(samples));
  return Array.from({ length: count + 1 }, (_, index) => {
    const t = index / count;
    return { ...riverCenterAt(t), t, width: riverWidthAt(t) };
  });
}
function catmullRom(a, b, c, d, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/CanonicalTerrainHydrology.js
var SOURCE_Z = -56;
var OUTLET_Z = 108;
var RIVER_LENGTH_Z = OUTLET_Z - SOURCE_Z;
function canonicalRiverTerrainSample(x, z) {
  const t = clamp2((z - SOURCE_Z) / RIVER_LENGTH_Z);
  const center = riverCenterAt(t);
  const width = riverWidthAt(t);
  return Object.freeze({
    center,
    distance: Math.abs(x - center.x),
    t,
    width
  });
}
function canonicalRiverElevation(t) {
  const clamped = clamp2(t);
  const upper = 12.2 - clamped * 5.4;
  const lower = 6.8 - (clamped - 0.42) * 8.5;
  return clamped < 0.42 ? upper : lower;
}
function clamp2(value) {
  return Math.max(0, Math.min(1, Number(value) || 0));
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/CanonicalHydrologyBankField.js
var BANK_CLEARANCE = 0.65;
var BANK_FULL_MARGIN = 2;
var BANK_SOFT_MARGIN = 6;
function canonicalHydrologyBankHeightAt(x, z, terrainHeight) {
  let bankedHeight = terrainHeight;
  for (let index = 1; index < CANONICAL_RIVER_CONTROL_POINTS.length; index += 1) {
    const sample = segmentBankSample(
      CANONICAL_RIVER_CONTROL_POINTS[index - 1],
      CANONICAL_RIVER_CONTROL_POINTS[index],
      x,
      z
    );
    if (sample.influence <= 0) continue;
    bankedHeight = Math.max(
      bankedHeight,
      raiseToAtLeast(terrainHeight, sample.targetHeight, sample.influence)
    );
  }
  return bankedHeight;
}
function segmentBankSample(first, second, x, z) {
  const projection = segmentProjection(first, second, x, z);
  const center = canonicalRiverTerrainSample(projection.x, projection.z);
  return {
    influence: bankRingInfluence(projection.distance, center.width),
    targetHeight: canonicalRiverElevation(center.t) + BANK_CLEARANCE
  };
}
function segmentProjection(first, second, x, z) {
  const firstX = first[0];
  const firstZ = first[1];
  const dx = second[0] - firstX;
  const dz = second[1] - firstZ;
  const lengthSquared = dx * dx + dz * dz || 1;
  const amount = clamp3(((x - firstX) * dx + (z - firstZ) * dz) / lengthSquared);
  const projectedX = firstX + dx * amount;
  const projectedZ = firstZ + dz * amount;
  return {
    distance: Math.hypot(x - projectedX, z - projectedZ),
    x: projectedX,
    z: projectedZ
  };
}
function bankRingInfluence(distance, width) {
  const outsideBed = smooth(width * 0.62, width * 0.96, distance);
  const outsideBank = 1 - smooth(
    width + BANK_FULL_MARGIN,
    width + BANK_SOFT_MARGIN,
    distance
  );
  return outsideBed * outsideBank;
}
function raiseToAtLeast(current, target, influence) {
  return current >= target ? current : mix(current, target, influence);
}
function smooth(edge0, edge1, value) {
  const amount = clamp3((value - edge0) / (edge1 - edge0 || 1));
  return amount * amount * (3 - 2 * amount);
}
function mix(first, second, amount) {
  return first + (second - first) * clamp3(amount);
}
function clamp3(value) {
  return Math.max(0, Math.min(1, value));
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/CanonicalHydrologyTerrain.js
var BED_DEPTH = 1.35;
function canonicalHydrologyTerrainHeightAt(x, z, terrainHeight) {
  const bankedHeight = canonicalHydrologyBankHeightAt(
    x,
    z,
    terrainHeight
  );
  const river = canonicalRiverTerrainSample(x, z);
  const waterHeight = canonicalRiverElevation(river.t);
  const bedTarget = waterHeight - BED_DEPTH;
  const bedInfluence = 1 - smooth2(
    river.width * 0.44,
    river.width * 0.88,
    river.distance
  );
  return mix2(bankedHeight, bedTarget, bedInfluence);
}
function smooth2(edge0, edge1, value) {
  const amount = clamp4((value - edge0) / (edge1 - edge0 || 1));
  return amount * amount * (3 - 2 * amount);
}
function mix2(first, second, amount) {
  return first + (second - first) * clamp4(amount);
}
function clamp4(value) {
  return Math.max(0, Math.min(1, value));
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/CanonicalTerrainTerraces.js
var TERRACES = Object.freeze([
  terrace("ENTR01", 0, 82, 22, 17, 2.2),
  terrace("BEIS01", -35, 45, 21, 16, 4.4),
  terrace("MARKET01", -26, 12, 25, 19, 5.5),
  terrace("SHUL01", -34, -24, 23, 18, 8.8),
  terrace("upper-residential", -8, -36, 27, 19, 10.4),
  terrace("north-slope", 18, -48, 27, 18, 12.7),
  terrace("east-bank", 38, 4, 22, 18, 7.1),
  terrace("PORTAL01", 52, -42, 18, 15, 12.4),
  terrace("F01-F04", 43, 39, 26, 21, 5.2),
  terrace("riverfront", -5, 36, 22, 18, 4.1)
]);
function canonicalTerraceSample(x, z) {
  let strongest = Object.freeze({ id: null, influence: 0, targetHeight: 0 });
  for (const terraceDefinition of TERRACES) {
    const dx = (x - terraceDefinition.x) / terraceDefinition.radiusX;
    const dz = (z - terraceDefinition.z) / terraceDefinition.radiusZ;
    const distance = Math.hypot(dx, dz);
    const influence = 1 - smooth3(0.42, 1, distance);
    if (influence <= strongest.influence) continue;
    strongest = Object.freeze({
      id: terraceDefinition.id,
      influence,
      targetHeight: terraceDefinition.height
    });
  }
  return strongest;
}
function canonicalTerraceDefinitions() {
  return TERRACES;
}
function terrace(id, x, z, radiusX, radiusZ, height) {
  return Object.freeze({ height, id, radiusX, radiusZ, x, z });
}
function smooth3(edge0, edge1, value) {
  const amount = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0 || 1)));
  return amount * amount * (3 - 2 * amount);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/CanonicalTerrainBase.js
function canonicalTerrainBaseHeightAt(x, z) {
  const river = canonicalRiverTerrainSample(x, z);
  const terrace2 = canonicalTerraceSample(x, z);
  const natural = naturalValleyHeight(x, z, river.center.x);
  const terraced = mix3(
    natural,
    terrace2.targetHeight,
    terrace2.influence * 0.82
  );
  return canonicalHydrologyTerrainHeightAt(x, z, terraced);
}
function naturalValleyHeight(x, z, riverX) {
  const northRise = smooth4(18, -92, z) * 9.5;
  const sideDistance = Math.max(0, Math.abs(x - riverX) - 28);
  const sideRise = Math.pow(sideDistance / 72, 1.55) * 12.5;
  return 1.55 + northRise + sideRise + gaussian(x, z, -112, -35, 94, 13.5) + gaussian(x, z, 124, -42, 100, 15.5) + gaussian(x, z, 4, -148, 132, 18) + detailNoise(x, z);
}
function detailNoise(x, z) {
  return Math.sin(x * 0.047) * 0.22 + Math.cos(z * 0.041) * 0.19 + Math.sin((x + z) * 0.021) * 0.16;
}
function gaussian(x, z, centerX, centerZ, radius, height) {
  const normalized3 = Math.hypot(x - centerX, z - centerZ) / radius;
  return Math.exp(-normalized3 * normalized3) * height;
}
function smooth4(edge0, edge1, value) {
  const amount = clamp5((value - edge0) / (edge1 - edge0 || 1));
  return amount * amount * (3 - 2 * amount);
}
function mix3(first, second, amount) {
  return first + (second - first) * clamp5(amount);
}
function clamp5(value) {
  return Math.max(0, Math.min(1, value));
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/CanonicalRoadSurfaceSampling.js
var ROAD_SURFACE_CLEARANCE = 0.18;
var ROAD_SURFACE_SAMPLE_SPACING = 1;
function denseRoadPoints(points) {
  const output = points.length ? [{ ...points[0] }] : [];
  for (let index = 1; index < points.length; index += 1) {
    appendDenseSegment(output, points[index - 1], points[index]);
  }
  return output;
}
function registerRoadSurfaceNode(point3, nodes) {
  const key = `${point3.x.toFixed(5)}:${point3.z.toFixed(5)}`;
  const minimumHeight = finiteMinimum(point3.minimumHeight);
  if (!nodes.has(key)) {
    const terrainHeight = roadSupportHeight(point3.x, point3.z);
    nodes.set(key, {
      minimumHeight,
      targetHeight: Math.max(
        terrainHeight + ROAD_SURFACE_CLEARANCE,
        minimumHeight ?? -Infinity
      ),
      terrainHeight,
      x: point3.x,
      z: point3.z
    });
  } else if (minimumHeight !== null) {
    mergeMinimumHeight(nodes.get(key), minimumHeight);
  }
  return key;
}
function appendDenseSegment(output, first, second) {
  const distance = Math.hypot(second.x - first.x, second.z - first.z);
  const steps = Math.max(1, Math.ceil(distance / ROAD_SURFACE_SAMPLE_SPACING));
  for (let step = 1; step <= steps; step += 1) {
    const amount = step / steps;
    const point3 = {
      x: first.x + (second.x - first.x) * amount,
      z: first.z + (second.z - first.z) * amount
    };
    if (step === steps && Number.isFinite(second.minimumHeight)) {
      point3.minimumHeight = second.minimumHeight;
    }
    output.push(point3);
  }
}
function mergeMinimumHeight(node, minimumHeight) {
  node.minimumHeight = Math.max(node.minimumHeight ?? -Infinity, minimumHeight);
  node.targetHeight = Math.max(node.targetHeight, node.minimumHeight);
}
function finiteMinimum(value) {
  return Number.isFinite(value) ? value : null;
}
function roadSupportHeight(x, z) {
  const base = canonicalTerrainBaseHeightAt(x, z);
  return canonicalHydrologyTerrainHeightAt(x, z, base);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/CanonicalRoadSurfaceSolver.js
var ROAD_SURFACE_MAXIMUM_GRADE = 0.16;
var RELAXATION_PASSES = 4096;
function createRoadSurfaceEdges(routeKeys, nodes) {
  const edges = [];
  for (const keys of routeKeys) {
    for (let index = 1; index < keys.length; index += 1) {
      const first = nodes.get(keys[index - 1]);
      const second = nodes.get(keys[index]);
      edges.push(createEdge(first, second));
    }
  }
  return edges;
}
function solveRoadSurfaceElevations(edges) {
  for (let pass = 0; pass < RELAXATION_PASSES; pass += 1) {
    let changed = false;
    for (const edge of edges) {
      changed = raiseLowerNode(edge) || changed;
    }
    if (!changed) return pass + 1;
  }
  throw new Error("Canonical road surface grade relaxation did not converge.");
}
function createEdge(first, second) {
  return {
    first,
    maximumDelta: Math.hypot(
      second.x - first.x,
      second.z - first.z
    ) * ROAD_SURFACE_MAXIMUM_GRADE,
    second
  };
}
function raiseLowerNode(edge) {
  const delta = edge.second.targetHeight - edge.first.targetHeight;
  if (Math.abs(delta) <= edge.maximumDelta + 1e-6) return false;
  if (delta > 0) {
    edge.first.targetHeight = edge.second.targetHeight - edge.maximumDelta;
  } else {
    edge.second.targetHeight = edge.first.targetHeight - edge.maximumDelta;
  }
  return true;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageStoneBridgeContract.js
var STONE_BRIDGE_DIMENSIONS = Object.freeze({
  deckRise: 3.25,
  deckThickness: 0.65,
  halfSpan: 7.6,
  width: 5.2
});
function stoneBridgeDeckCenterY(groundY) {
  return groundY + STONE_BRIDGE_DIMENSIONS.deckRise;
}
function stoneBridgeDeckTopY(groundY) {
  return stoneBridgeDeckCenterY(groundY) + STONE_BRIDGE_DIMENSIONS.deckThickness / 2;
}
function canonicalStoneBridgeDeckTopY(center) {
  const baseY = canonicalTerrainBaseHeightAt(center.x, center.z);
  const groundY = canonicalHydrologyTerrainHeightAt(center.x, center.z, baseY);
  return stoneBridgeDeckTopY(groundY);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/CanonicalVillageRoads.js
var BRIDGE_CENTER = Object.freeze({ x: 18, z: 7 });
var BRIDGE_WALKABLE_Y = canonicalStoneBridgeDeckTopY(BRIDGE_CENTER);
var westBridgeApproach = bridgeApproach(10.4);
var eastBridgeApproach = bridgeApproach(25.6);
var ROUTE_POINTS = Object.freeze({
  arrivalMain: [[0, 101], [-2, 88], [-5, 72], [-8, 55], [-11, 39], [-15, 27], [-20, 17], [-12, 13], [2, 10], westBridgeApproach],
  arrivalWestHomes: [[-5, 72], [-14, 64], [-24, 57]],
  arrivalEastHomes: [[-5, 72], [7, 64], [18, 58], [25, 55]],
  beisTerrace: [[-8, 55], [-19, 50], [-35, 45], [-44, 49]],
  riverfront: [[-8, 55], [-9, 45], [-9, 38], [-5, 36]],
  marketLoop: [[-20, 17], [-29, 18], [-38, 18], [-35, 10], [-26, 12], [-18, 5]],
  shulRise: [[-20, 17], [-25, 5], [-29, -9], [-34, -24], [-47, -17]],
  upperHomes: [[-34, -24], [-18, -43], [-8, -36], [1, -31], [10, -52], [26, -44]],
  eastBank: [eastBridgeApproach, [34, -4], [42, 12], [43, 25]],
  farmTerraces: [[43, 25], [43, 39], [36, 34], [51, 39], [50, 53]],
  waterfallPortal: [eastBridgeApproach, [29, -8], [36, -24], [47, -35], [52, -42], [56, -49]]
});
var CANONICAL_ROAD_WIDTHS = Object.freeze({
  main: 5.8,
  residential: 3.6,
  service: 2.4
});
var ROUTE_WIDTH_CLASSES = Object.freeze({
  arrivalMain: "main",
  arrivalWestHomes: "residential",
  arrivalEastHomes: "residential",
  beisTerrace: "residential",
  riverfront: "residential",
  marketLoop: "main",
  shulRise: "residential",
  upperHomes: "residential",
  eastBank: "residential",
  farmTerraces: "service",
  waterfallPortal: "service"
});
function canonicalVillageRoadRoutes() {
  return Object.entries(ROUTE_POINTS).map(([id, coordinates]) => {
    const points = coordinates.map(coordinatePoint);
    const widthClass = ROUTE_WIDTH_CLASSES[id];
    return Object.freeze({
      foldedSegments: Object.freeze([]),
      id: `canonical-${id}`,
      pathfinding: Object.freeze({
        failed: false,
        maximumSampleGap: maximumGap(points),
        method: "authored-canonical-corridor"
      }),
      points: Object.freeze(points),
      terminalDistances: Object.freeze({ from: 0, to: 0 }),
      width: CANONICAL_ROAD_WIDTHS[widthClass],
      widthClass
    });
  });
}
function canonicalRoadNetworkEvidence() {
  const routes = canonicalVillageRoadRoutes();
  return Object.freeze({
    bridgeApproaches: Object.freeze([[10.4, 7], [25.6, 7]]),
    bridgeWalkableY: BRIDGE_WALKABLE_Y,
    connected: true,
    method: "canonical-master-plan-authored-corridors",
    routeCount: routes.length,
    routeIds: Object.freeze(routes.map((route2) => route2.id))
  });
}
function bridgeApproach(x) {
  return Object.freeze([x, BRIDGE_CENTER.z, BRIDGE_WALKABLE_Y]);
}
function coordinatePoint([x, z, minimumHeight]) {
  return Object.freeze(Number.isFinite(minimumHeight) ? { minimumHeight, x, z } : { x, z });
}
function maximumGap(points) {
  let maximum = 0;
  for (let index = 1; index < points.length; index += 1) {
    maximum = Math.max(maximum, Math.hypot(
      points[index].x - points[index - 1].x,
      points[index].z - points[index - 1].z
    ));
  }
  return maximum;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/CanonicalRoadSurfaceNetwork.js
var cachedNetwork = null;
function canonicalRoadSurfaceRoutes() {
  return roadSurfaceNetwork().routes;
}
function canonicalRoadSurfaceEvidence() {
  return roadSurfaceNetwork().evidence;
}
function roadSurfaceNetwork() {
  if (!cachedNetwork) cachedNetwork = buildNetwork();
  return cachedNetwork;
}
function buildNetwork() {
  const sourceRoutes = canonicalVillageRoadRoutes();
  const nodes = /* @__PURE__ */ new Map();
  const routeKeys = sourceRoutes.map((route2) => {
    return denseRoadPoints(route2.points).map((point3) => {
      return registerRoadSurfaceNode(point3, nodes);
    });
  });
  const edges = createRoadSurfaceEdges(routeKeys, nodes);
  const relaxationPasses = solveRoadSurfaceElevations(edges);
  const routes = sourceRoutes.map((route2, index) => {
    return solvedRoute(route2, routeKeys[index], nodes);
  });
  return Object.freeze({
    evidence: Object.freeze({
      clearance: ROAD_SURFACE_CLEARANCE,
      maximumGrade: ROAD_SURFACE_MAXIMUM_GRADE,
      nodeCount: nodes.size,
      relaxationPasses,
      routeCount: routes.length,
      sampleSpacing: ROAD_SURFACE_SAMPLE_SPACING
    }),
    routes: Object.freeze(routes)
  });
}
function solvedRoute(route2, keys, nodes) {
  return Object.freeze({
    ...route2,
    pathfinding: Object.freeze({
      ...route2.pathfinding,
      gradeAuthority: "dense-shared-raised-road-surface",
      maximumGrade: ROAD_SURFACE_MAXIMUM_GRADE,
      maximumSampleGap: ROAD_SURFACE_SAMPLE_SPACING
    }),
    points: Object.freeze(keys.map((key) => {
      return Object.freeze({ ...nodes.get(key) });
    }))
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/road/RoadMeshWriter.js
function createRoadMesh(tileWorld) {
  return {
    tileWorld,
    vertices: [],
    faces: [],
    uvs: [],
    topFaceIndices: []
  };
}
function addRoadVertex(mesh2, point3) {
  mesh2.vertices.push([point3.x, point3.y, point3.z]);
  mesh2.uvs.push(
    point3.x / mesh2.tileWorld,
    point3.z / mesh2.tileWorld
  );
  return mesh2.vertices.length - 1;
}
function addRoadFace(mesh2, indices, top = false) {
  if (top) {
    mesh2.topFaceIndices.push(mesh2.faces.length);
  }
  mesh2.faces.push(indices);
  return mesh2.faces.length - 1;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/road/RoadJunctionGeometry.js
var TOP_LIFT = 0.135;
var MINIMUM_THICKNESS = 0.085;
var SUPPORT_LIFT = 0.02;
function appendRoadJunctions(mesh2, routes, surfaceSampler, width, supportSampler = surfaceSampler) {
  const points = uniqueTerminalPoints(routes);
  const radius = width * 0.505;
  for (const point3 of points) {
    appendJunction(
      mesh2,
      point3,
      surfaceSampler,
      supportSampler,
      radius,
      18
    );
  }
  return points;
}
function uniqueTerminalPoints(routes) {
  const map = /* @__PURE__ */ new Map();
  for (const route2 of routes) {
    for (const point3 of [route2.points[0], route2.points.at(-1)]) {
      if (!point3) continue;
      map.set(`${point3.x.toFixed(3)},${point3.z.toFixed(3)}`, point3);
    }
  }
  return [...map.values()];
}
function appendJunction(mesh2, center, surfaceSampler, supportSampler, radius, segments) {
  const topY = surfaceHeight(center, surfaceSampler) + TOP_LIFT;
  const supportY = supportSampler.heightAt(center.x, center.z).y + SUPPORT_LIFT;
  const bottomY = Math.min(topY - MINIMUM_THICKNESS, supportY);
  const topCenter = addRoadVertex(mesh2, { ...center, y: topY });
  const bottomCenter = addRoadVertex(mesh2, { ...center, y: bottomY });
  const rings = junctionRings(
    mesh2,
    center,
    supportSampler,
    radius,
    segments,
    topY
  );
  appendJunctionFaces(mesh2, topCenter, bottomCenter, rings, segments);
}
function junctionRings(mesh2, center, sampler, radius, segments, topY) {
  const top = [];
  const bottom = [];
  for (let index = 0; index < segments; index += 1) {
    const angle = index / segments * Math.PI * 2;
    const x = center.x + Math.cos(angle) * radius;
    const z = center.z + Math.sin(angle) * radius;
    const supportY = sampler.heightAt(x, z).y + SUPPORT_LIFT;
    top.push(addRoadVertex(mesh2, { x, y: topY, z }));
    bottom.push(addRoadVertex(mesh2, {
      x,
      y: Math.min(topY - MINIMUM_THICKNESS, supportY),
      z
    }));
  }
  return { bottom, top };
}
function appendJunctionFaces(mesh2, topCenter, bottomCenter, rings, segments) {
  for (let index = 0; index < segments; index += 1) {
    const next = (index + 1) % segments;
    addRoadFace(mesh2, [topCenter, rings.top[next], rings.top[index]], true);
    addRoadFace(mesh2, [bottomCenter, rings.bottom[index], rings.bottom[next]]);
    addRoadFace(mesh2, [
      rings.top[index],
      rings.top[next],
      rings.bottom[next],
      rings.bottom[index]
    ]);
  }
}
function surfaceHeight(point3, sampler) {
  if (Number.isFinite(point3.targetHeight)) return point3.targetHeight;
  return sampler.heightAt(point3.x, point3.z).y;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/materials/MaterialStackRecipe.js
var MATERIAL_STACK_LOGICAL_LIMIT = 16;
var MATERIAL_STACK_TARGET_ACTIVE = 10;
function materialStackRecipe(name, options = {}) {
  const layers = [...options.layers || []].sort(compareLayers).slice(0, MATERIAL_STACK_LOGICAL_LIMIT);
  if (layers.length === 0) {
    throw new Error(`Material stack ${name} requires at least one layer.`);
  }
  return Object.freeze({
    fallbackColor: Object.freeze(color4(options.fallbackColor)),
    layers: Object.freeze(layers),
    logicalLayerCount: layers.length,
    name,
    shader: options.shader || "material-stack-zone-slope-height-wetness",
    targetActiveLayers: Math.min(
      MATERIAL_STACK_TARGET_ACTIVE,
      layers.length
    )
  });
}
function materialStackPage(recipe, capacity, pageIndex = 0) {
  const pageSize = Math.max(1, Math.floor(Number(capacity) || 1));
  const start = Math.max(0, Math.floor(Number(pageIndex) || 0)) * pageSize;
  const layers = recipe.layers.slice(start, start + pageSize);
  return Object.freeze({
    layers: Object.freeze(layers),
    pageCount: Math.ceil(recipe.layers.length / pageSize),
    pageIndex: Math.floor(start / pageSize),
    pageSize,
    recipe: recipe.name
  });
}
function materialStackDiagnostics(recipe, activeCapacity) {
  const capacity = Math.max(0, Math.floor(Number(activeCapacity) || 0));
  return Object.freeze({
    activeCapacity: capacity,
    activeLayerCount: Math.min(capacity, recipe.layers.length),
    logicalLayerCount: recipe.layers.length,
    pageCount: capacity > 0 ? Math.ceil(recipe.layers.length / capacity) : recipe.layers.length,
    recipe: recipe.name
  });
}
function compareLayers(left, right) {
  return right.priority - left.priority || left.role.localeCompare(right.role);
}
function color4(value = [0.45, 0.42, 0.34, 1]) {
  return Array.from({ length: 4 }, (_, index) => {
    const fallback = index === 3 ? 1 : 0.45;
    const number = Number(value[index]);
    return Math.max(0, Math.min(1, Number.isFinite(number) ? number : fallback));
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/materials/MaterialStackBinding.js
function bindMaterialStack(fields, recipe, activeCapacity = 10) {
  const page = materialStackPage(recipe, activeCapacity, 0);
  return {
    ...fields,
    materialStack: recipe,
    textureLayers: page.layers.map((layer) => ({
      ...layer,
      image: cachedTextureImage(layer.url)
    })),
    texturePolicy: {
      ...fields.texturePolicy || {},
      fallbackFirst: true,
      materialStack: materialStackDiagnostics(recipe, activeCapacity),
      publicFirebase: true,
      shader: "terrain-layered-ten-stage-material-stack"
    }
  };
}
function bindMaterialPair(fields, primaryLayer, secondaryLayer) {
  return {
    ...fields,
    mapImage: cachedTextureImage(primaryLayer.url) || fields.mapImage || null,
    mapRepeat: primaryLayer.repeat,
    mixImage: cachedTextureImage(secondaryLayer.url),
    mixRepeat: secondaryLayer.repeat,
    mixStrength: secondaryLayer.strength,
    mixTextureUrl: secondaryLayer.url,
    textureUrl: primaryLayer.url,
    texturePolicy: {
      ...fields.texturePolicy || {},
      fallbackFirst: true,
      materialRoles: [primaryLayer.role, secondaryLayer.role],
      publicFirebase: true,
      shader: "world-space-two-source-physical-mix"
    }
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/materials/MaterialStackLayer.js
function materialStackLayer(role, url, options = {}) {
  const repeat = pair(options.repeat, [1, 1]);
  const slope = orderedPair(options.slope, [0, 1]);
  const height = orderedPair(options.height, [-1e4, 1e4]);
  const zones = vector4(options.zones, [1, 1, 1, 1]);
  return Object.freeze({
    angle: finite(options.angle, 0),
    height: Object.freeze(height),
    priority: finite(options.priority, 0),
    repeat: Object.freeze(repeat),
    role,
    slope: Object.freeze(slope),
    strength: clamp6(finite(options.strength, 1), 0, 1),
    url: assertProductionMaterialUrl(url, role),
    wetness: clamp6(finite(options.wetness, 0), 0, 1),
    zones: Object.freeze(zones)
  });
}
function pair(value, fallback) {
  if (!Array.isArray(value) || value.length < 2) return [...fallback];
  return [finite(value[0], fallback[0]), finite(value[1], fallback[1])];
}
function orderedPair(value, fallback) {
  const pairValue = pair(value, fallback);
  return pairValue[0] <= pairValue[1] ? pairValue : [pairValue[1], pairValue[0]];
}
function vector4(value, fallback) {
  if (!Array.isArray(value)) return [...fallback];
  return Array.from({ length: 4 }, (_, index) => {
    return clamp6(finite(value[index], fallback[index]), 0, 1);
  });
}
function finite(value, fallback) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
function clamp6(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/materials/MaterialPresetLayer.js
function presetLayer(role, url, options = {}) {
  return materialStackLayer(role, url, {
    angle: options.angle ?? deterministicAngle(role),
    height: options.height || [-1e4, 1e4],
    priority: options.priority ?? 0,
    repeat: options.repeat || [16, 16],
    slope: options.slope || [0, 1],
    strength: options.strength ?? 0.4,
    wetness: options.wetness ?? 0,
    zones: options.zones || [1, 1, 1, 1]
  });
}
function deterministicAngle(role) {
  let hash = 0;
  for (const character of role) {
    hash = hash * 31 + character.charCodeAt(0) >>> 0;
  }
  return hash % 628 / 100;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/assets/HighestResolutionSurfaceCatalog.js
function chaiForestSource(path) {
  return assertProductionMaterialUrl(
    exactMaterialUrl(`awtsmoos-nature/chai-forest/${path}`),
    `terrain source ${path}`
  );
}
var HIGHEST_RESOLUTION_SURFACES = Object.freeze({
  baseGrass: chaiForestSource("textures/ground/grass.jpg"),
  dirt: chaiForestSource("textures/ground/dirt_color.jpg"),
  dryGrass: verified(TEXTURE_URLS.terrain.dirt1, "dry meadow substrate"),
  forestFloor: verified(TEXTURE_URLS.terrain.darkForestFloor, "forestFloor"),
  marsh: verified(TEXTURE_URLS.terrain.marshGrass, "marsh"),
  mud: verified(TEXTURE_URLS.terrain.dirt2, "damp soil substitute"),
  sand: verified(TEXTURE_URLS.terrain.tilledSoil, "shore mineral soil"),
  stone: verified(TEXTURE_URLS.stone.stone1, "stone")
});
function highestResolutionSurface(role) {
  const url = HIGHEST_RESOLUTION_SURFACES[role];
  if (!url) throw new Error(`Unknown terrain surface role: ${role}`);
  return assertProductionMaterialUrl(url, role);
}
function verified(url, role) {
  return assertProductionMaterialUrl(url, role);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/materials/MountainVillageTerrainSources.js
var MOUNTAIN_VILLAGE_SOURCES = Object.freeze({
  bark: roleUrl("forest.bark"),
  bluestone: SURFACE_TEXTURE_FAMILIES.stone.bluestone1,
  cobblestone: SURFACE_TEXTURE_FAMILIES.stone.cobblestone,
  darkForestFloor: SURFACE_TEXTURE_FAMILIES.terrain.darkForestFloor,
  dirt: highestResolutionSurface("dirt"),
  dryGrass: highestResolutionSurface("dryGrass"),
  fieldstone: roleUrl("stone.fieldstone"),
  forestFloor: highestResolutionSurface("forestFloor"),
  gold: roleUrl("metal.gold"),
  granite: SURFACE_TEXTURE_FAMILIES.stone.granite1,
  grass: highestResolutionSurface("baseGrass"),
  iron: roleUrl("metal.iron"),
  marsh: highestResolutionSurface("marsh"),
  mud: highestResolutionSurface("mud"),
  parchment: roleUrl("sign.parchment"),
  roofTile: roleUrl("roof.tile"),
  sand: highestResolutionSurface("sand"),
  soilDirtFive: SURFACE_TEXTURE_FAMILIES.terrain.dirt5,
  stone: highestResolutionSurface("stone"),
  stoneFloor: SURFACE_TEXTURE_FAMILIES.stone.floor2,
  stoneOne: SURFACE_TEXTURE_FAMILIES.stone.stone1,
  waterLake: roleUrl("water.lake"),
  waterStill: roleUrl("water.still"),
  waterStream: roleUrl("water.stream"),
  wildGrass: roleUrl("vegetation.wildGrass"),
  wood: roleUrl("village.woodPlanks"),
  yellowBrick: roleUrl("road.yellowBrick")
});
var MOUNTAIN_VILLAGE_TERRAIN_VARIANTS = Object.freeze({
  baseGrass: MOUNTAIN_VILLAGE_SOURCES.grass,
  dirtGrassOne: SURFACE_TEXTURE_FAMILIES.terrain.dirtGrass1,
  dirtGrassThree: SURFACE_TEXTURE_FAMILIES.terrain.dirtGrass3,
  dirtGrassTwo: SURFACE_TEXTURE_FAMILIES.terrain.dirtGrass2,
  forestLeaves: SURFACE_TEXTURE_FAMILIES.terrain.forestLeaves,
  grassEight: SURFACE_TEXTURE_FAMILIES.terrain.grass8,
  grassFive: SURFACE_TEXTURE_FAMILIES.terrain.grass5,
  grassFour: SURFACE_TEXTURE_FAMILIES.terrain.grass4,
  grassOne: SURFACE_TEXTURE_FAMILIES.terrain.grass1,
  grassSeven: SURFACE_TEXTURE_FAMILIES.terrain.grass7,
  marshGrass: SURFACE_TEXTURE_FAMILIES.terrain.marshGrass,
  wildGrass: MOUNTAIN_VILLAGE_SOURCES.wildGrass
});
function roleUrl(role) {
  const record = runtimeMaterialByRole(role);
  if (!record?.primaryUrl) throw new Error(`Missing canonical material role: ${role}`);
  return record.primaryUrl;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/materials/MountainVillageMaterialSources.js
var MOUNTAIN_VILLAGE_FAMILIES = Object.freeze({
  bricks: family("bricks", Object.values(SURFACE_TEXTURE_FAMILIES.bricks)),
  earth: family("earth", [
    MOUNTAIN_VILLAGE_SOURCES.dirt,
    SURFACE_TEXTURE_FAMILIES.terrain.dirt1,
    SURFACE_TEXTURE_FAMILIES.terrain.dirt2,
    SURFACE_TEXTURE_FAMILIES.terrain.dirt5,
    SURFACE_TEXTURE_FAMILIES.terrain.dirt6,
    SURFACE_TEXTURE_FAMILIES.terrain.tilledSoil,
    SURFACE_TEXTURE_FAMILIES.terrain.mud,
    SURFACE_TEXTURE_FAMILIES.terrain.sand1
  ]),
  forest: family("forest", [
    SURFACE_TEXTURE_FAMILIES.terrain.darkForestFloor,
    MOUNTAIN_VILLAGE_TERRAIN_VARIANTS.forestLeaves,
    MOUNTAIN_VILLAGE_TERRAIN_VARIANTS.marshGrass,
    MOUNTAIN_VILLAGE_SOURCES.bark
  ]),
  grass: family("grass", [
    MOUNTAIN_VILLAGE_TERRAIN_VARIANTS.baseGrass,
    MOUNTAIN_VILLAGE_TERRAIN_VARIANTS.grassOne,
    MOUNTAIN_VILLAGE_TERRAIN_VARIANTS.grassFour,
    MOUNTAIN_VILLAGE_TERRAIN_VARIANTS.grassFive,
    MOUNTAIN_VILLAGE_TERRAIN_VARIANTS.grassSeven,
    MOUNTAIN_VILLAGE_TERRAIN_VARIANTS.grassEight,
    MOUNTAIN_VILLAGE_SOURCES.dryGrass,
    MOUNTAIN_VILLAGE_TERRAIN_VARIANTS.marshGrass
  ]),
  grassTransitions: family("grass-transition", [
    MOUNTAIN_VILLAGE_TERRAIN_VARIANTS.dirtGrassOne,
    MOUNTAIN_VILLAGE_TERRAIN_VARIANTS.dirtGrassTwo,
    MOUNTAIN_VILLAGE_TERRAIN_VARIANTS.dirtGrassThree
  ]),
  roof: family("roof", Object.values(SURFACE_TEXTURE_FAMILIES.roof)),
  stone: family("stone", [MOUNTAIN_VILLAGE_SOURCES.fieldstone, ...Object.values(SURFACE_TEXTURE_FAMILIES.stone)]),
  water: family("water", Object.values(SURFACE_TEXTURE_FAMILIES.water)),
  wood: family("wood", [MOUNTAIN_VILLAGE_SOURCES.wood, ...Object.values(SURFACE_TEXTURE_FAMILIES.wood)])
});
function family(role, urls) {
  return Object.freeze([...new Set(urls)].map((url) => assertProductionMaterialUrl(url, `${role} family`)));
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/materials/RoadMaterialStackPreset.js
function villageRoadStack() {
  return materialStackRecipe("village-road", {
    fallbackColor: [0.31, 0.27, 0.21, 1],
    layers: [
      road("road-fieldstone", MOUNTAIN_VILLAGE_SOURCES.fieldstone, 100, [9, 10], 0.64),
      road("road-cobblestone", MOUNTAIN_VILLAGE_FAMILIES.stone[3], 99, [12, 11], 0.46),
      road("road-yellow-brick", MOUNTAIN_VILLAGE_SOURCES.yellowBrick, 98, [14, 12], 0.27),
      road("road-stone-floor", MOUNTAIN_VILLAGE_FAMILIES.stone[4], 97, [15, 13], 0.3),
      road("road-worn-dirt", MOUNTAIN_VILLAGE_FAMILIES.earth[1], 96, [17, 19], 0.43),
      road("road-dirt-grass", MOUNTAIN_VILLAGE_FAMILIES.grassTransitions[1], 95, [19, 17], 0.34),
      road("road-wet-mud", MOUNTAIN_VILLAGE_SOURCES.mud, 94, [14, 16], 0.48, 0.82),
      road("road-leaf-moss", MOUNTAIN_VILLAGE_FAMILIES.forest[0], 93, [20, 18], 0.3),
      road("road-grass-joints", MOUNTAIN_VILLAGE_FAMILIES.grass[5], 92, [25, 23], 0.24),
      road("road-pale-dust", MOUNTAIN_VILLAGE_SOURCES.sand, 91, [22, 20], 0.26)
    ]
  });
}
function road(role, url, priority, repeat, strength, wetness = 0) {
  return presetLayer(role, url, {
    priority,
    repeat,
    slope: [0, 0.55],
    strength,
    wetness,
    zones: [1, wetness > 0 ? 0.58 : 0.18, wetness > 0 ? 0.64 : 0.18, 0.06]
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/materials/TerrainMaterialStackPreset.js
function mountainTerrainStack() {
  return materialStackRecipe("mountain-terrain", {
    fallbackColor: [0.31, 0.34, 0.2, 1],
    layers: [
      meadow("meadow-source-grass", MOUNTAIN_VILLAGE_TERRAIN_VARIANTS.baseGrass, 100, [29, 27], 0.34),
      meadow("meadow-grass-one", MOUNTAIN_VILLAGE_TERRAIN_VARIANTS.grassOne, 99, [21, 25], 0.28),
      meadow("meadow-grass-four", MOUNTAIN_VILLAGE_TERRAIN_VARIANTS.grassFour, 98, [34, 30], 0.24),
      meadow("meadow-dry-grass", MOUNTAIN_VILLAGE_SOURCES.dryGrass, 97, [27, 32], 0.22),
      meadow("meadow-wet-grass", MOUNTAIN_VILLAGE_TERRAIN_VARIANTS.grassFive, 96, [19, 23], 0.27),
      meadow("meadow-dirt-grass-one", MOUNTAIN_VILLAGE_TERRAIN_VARIANTS.dirtGrassOne, 95, [18, 20], 0.34),
      meadow("meadow-dirt-grass-two", MOUNTAIN_VILLAGE_TERRAIN_VARIANTS.dirtGrassTwo, 94, [23, 19], 0.31),
      earthLayer("worn-earth", MOUNTAIN_VILLAGE_SOURCES.dirt, 93, [17, 19], 0.48),
      streamMudLayer(),
      mountainStoneLayer(),
      meadow("meadow-grass-eight", MOUNTAIN_VILLAGE_TERRAIN_VARIANTS.grassEight, 90, [25, 28], 0.2),
      meadow("meadow-wild-grass", MOUNTAIN_VILLAGE_TERRAIN_VARIANTS.grassSeven, 89, [31, 26], 0.19),
      meadow("meadow-marsh-grass", MOUNTAIN_VILLAGE_TERRAIN_VARIANTS.marshGrass, 88, [22, 35], 0.18),
      meadow("meadow-dirt-grass-three", MOUNTAIN_VILLAGE_TERRAIN_VARIANTS.dirtGrassThree, 87, [20, 24], 0.28),
      forestFloorLayer(),
      shoreSandLayer()
    ]
  });
}
function meadow(role, url, priority, repeat, strength) {
  return presetLayer(role, url, {
    priority,
    repeat,
    slope: [0, 0.52],
    strength,
    zones: [1, 0.03, 0, 0.16]
  });
}
function earthLayer(role, url, priority, repeat, strength) {
  return presetLayer(role, url, {
    priority,
    repeat,
    slope: [0, 0.62],
    strength,
    zones: [1, 0.25, 0.22, 0.18]
  });
}
function streamMudLayer() {
  return presetLayer("stream-bank-mud", MOUNTAIN_VILLAGE_SOURCES.mud, {
    priority: 92,
    repeat: [15, 18],
    slope: [0, 0.48],
    strength: 0.56,
    wetness: 0.9,
    zones: [0.18, 1, 1, 0]
  });
}
function mountainStoneLayer() {
  return presetLayer("mountain-stone", MOUNTAIN_VILLAGE_SOURCES.stone, {
    priority: 91,
    repeat: [11, 14],
    slope: [0.22, 1],
    strength: 0.78,
    zones: [0.05, 0, 0, 1]
  });
}
function forestFloorLayer() {
  return presetLayer("forest-leaf-floor", MOUNTAIN_VILLAGE_TERRAIN_VARIANTS.forestLeaves, {
    priority: 86,
    repeat: [14, 17],
    slope: [0, 0.64],
    strength: 0.52,
    zones: [0.08, 0, 0, 1]
  });
}
function shoreSandLayer() {
  return presetLayer("shore-sand", MOUNTAIN_VILLAGE_SOURCES.sand, {
    priority: 85,
    repeat: [18, 22],
    slope: [0, 0.34],
    strength: 0.5,
    wetness: 0.18,
    zones: [0, 1, 1, 0]
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/materials/StructureMaterialStackPreset.js
function mountainRockStack() {
  return materialStackRecipe("mountain-rock", {
    fallbackColor: [0.32, 0.33, 0.31, 1],
    layers: [
      rock("rock-fieldstone", MOUNTAIN_VILLAGE_SOURCES.fieldstone, 100, [8, 10], 0.72, [0.2, 1]),
      rock("rock-stone-one", MOUNTAIN_VILLAGE_SOURCES.stoneOne, 99, [11, 9], 0.54, [0.28, 1]),
      rock("rock-bluestone", MOUNTAIN_VILLAGE_SOURCES.bluestone, 98, [12, 10], 0.34, [0.34, 1]),
      rock("rock-cobble-breakup", MOUNTAIN_VILLAGE_SOURCES.cobblestone, 97, [14, 12], 0.28, [0.36, 1]),
      rock("rock-floor-strata", MOUNTAIN_VILLAGE_SOURCES.stoneFloor, 96, [7, 13], 0.31, [0.42, 1]),
      rock("rock-granite", MOUNTAIN_VILLAGE_SOURCES.granite, 95, [9, 15], 0.25, [0.56, 1]),
      rock("rock-scree-sand", MOUNTAIN_VILLAGE_SOURCES.sand, 94, [18, 20], 0.3, [0.38, 1]),
      rock("rock-shelf-soil", MOUNTAIN_VILLAGE_SOURCES.soilDirtFive, 93, [20, 18], 0.35, [0, 0.48]),
      rock("rock-forest-moss", MOUNTAIN_VILLAGE_SOURCES.darkForestFloor, 92, [16, 19], 0.32, [0, 0.38]),
      rock("rock-dry-grass", MOUNTAIN_VILLAGE_SOURCES.dryGrass, 91, [24, 22], 0.23, [0, 0.3])
    ]
  });
}
function cottageSurfaceStack() {
  return materialStackRecipe("cottage-surface", {
    fallbackColor: [0.45, 0.39, 0.31, 1],
    layers: [
      building("cottage-fieldstone", MOUNTAIN_VILLAGE_SOURCES.fieldstone, 100, [5, 5], 0.68),
      building("cottage-limestone", MOUNTAIN_VILLAGE_FAMILIES.bricks[6], 99, [6, 7], 0.36),
      building("cottage-white-brick", MOUNTAIN_VILLAGE_FAMILIES.bricks[0], 98, [8, 7], 0.28),
      building("cottage-weathered-brick", MOUNTAIN_VILLAGE_FAMILIES.bricks[5], 97, [7, 9], 0.22),
      building("cottage-timber", MOUNTAIN_VILLAGE_SOURCES.wood, 96, [4, 8], 0.52),
      building("cottage-oak-variation", MOUNTAIN_VILLAGE_FAMILIES.wood[2], 95, [5, 9], 0.28),
      building("cottage-roof", MOUNTAIN_VILLAGE_SOURCES.roofTile, 94, [6, 4], 0.58),
      building("cottage-roof-small-tile", MOUNTAIN_VILLAGE_FAMILIES.roof[2], 93, [8, 5], 0.31),
      building("cottage-bark-trim", MOUNTAIN_VILLAGE_SOURCES.bark, 92, [3, 10], 0.26),
      building("cottage-iron", MOUNTAIN_VILLAGE_SOURCES.iron, 91, [3, 3], 0.18),
      building("cottage-gold", MOUNTAIN_VILLAGE_SOURCES.gold, 90, [2, 2], 0.14)
    ]
  });
}
function rock(role, url, priority, repeat, strength, slope) {
  return presetLayer(role, url, {
    priority,
    repeat,
    slope,
    strength,
    zones: [0.04, 0, 0, 1]
  });
}
function building(role, url, priority, repeat, strength) {
  return presetLayer(role, url, {
    priority,
    repeat,
    strength,
    zones: [1, 1, 1, 1]
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/road/RoadMaterialContract.js
var ROAD_STACK = villageRoadStack();
var YELLOW_BRICK_LAYER = ROAD_STACK.layers.find((layer) => layer.role === "road-yellow-brick");
var ROAD_YELLOW_BRICK_URL = YELLOW_BRICK_LAYER.url;
function roadMaterialFields(texture = null) {
  const primary = ROAD_STACK.layers[0];
  const fields = {
    anisotropy: 8,
    mapImage: validImage(texture) ? texture : cachedTextureImage(primary.url),
    mapRepeat: primary.repeat,
    texturePolicy: {
      fallbackApplied: false,
      fullResolution: true,
      projection: "world-planar-continuous-network",
      repeatMode: "mirror-pingpong",
      role: "road.mountainVillageCobble",
      tileWorld: REPEAT_HOOKS.roadTileWorld
    },
    textureUrl: primary.url
  };
  return bindMaterialStack(fields, ROAD_STACK, 10);
}
function roadMaterialEvidence(texture = null) {
  const fields = roadMaterialFields(texture);
  const image = fields.mapImage;
  return {
    activeLayers: fields.textureLayers.length,
    anisotropy: fields.anisotropy,
    decoded: Boolean(image),
    fallbackApplied: fields.texturePolicy.fallbackApplied,
    fullResolution: fields.textureLayers.every((layer) => {
      return !/half-resolution|quarter-resolution|chai-forest-half/.test(layer.url);
    }),
    height: image?.naturalHeight || 0,
    logicalLayers: fields.materialStack.logicalLayerCount,
    role: fields.texturePolicy.role,
    url: fields.textureUrl,
    width: image?.naturalWidth || 0
  };
}
function validImage(image) {
  if (!image) return false;
  if (image.naturalWidth === void 0) return true;
  return image.naturalWidth > 0 && image.naturalHeight > 0;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/road/RoadSurfaceSection.js
var ROAD_MINIMUM_THICKNESS = 0.08;
var ROAD_SUPPORT_LIFT = 0.02;
function roadSurfaceHeight(point3, sampler) {
  if (Number.isFinite(point3.targetHeight)) return point3.targetHeight;
  return sampler.heightAt(point3.x, point3.z).y;
}
function roadSectionEdges(points, index, width, supportSampler) {
  const normal = pointNormal(points, index);
  const center = points[index];
  return {
    left: edgePoint(center, normal, width / 2, supportSampler),
    right: edgePoint(center, normal, -width / 2, supportSampler)
  };
}
function roadBottomPoint(point3, topY) {
  return {
    x: point3.x,
    y: Math.min(
      topY - ROAD_MINIMUM_THICKNESS,
      point3.supportY + ROAD_SUPPORT_LIFT
    ),
    z: point3.z
  };
}
function edgePoint(point3, normal, offset, sampler) {
  const x = point3.x + normal.x * offset;
  const z = point3.z + normal.z * offset;
  return {
    supportY: sampler.heightAt(x, z).y,
    x,
    z
  };
}
function pointNormal(points, index) {
  const before = points[Math.max(0, index - 1)];
  const after = points[Math.min(points.length - 1, index + 1)];
  const dx = after.x - before.x;
  const dz = after.z - before.z;
  const length3 = Math.hypot(dx, dz) || 1;
  return { x: -dz / length3, z: dx / length3 };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/road/RoadRibbonGeometry.js
var ROAD_TOP_LIFT = 0.12;
function appendRoadRibbon(mesh2, route2, surfaceSampler, width, supportSampler = surfaceSampler) {
  const sections = route2.points.map((point3, index) => {
    return createSection(
      mesh2,
      route2.points,
      index,
      surfaceSampler,
      supportSampler,
      width
    );
  });
  for (let index = 0; index < sections.length - 1; index += 1) {
    appendSegment(mesh2, sections[index], sections[index + 1]);
  }
  if (sections.length) {
    appendCap(mesh2, sections[0], true);
    appendCap(mesh2, sections.at(-1), false);
  }
  return routeStatistics(route2, sections.length);
}
function createSection(mesh2, points, index, surfaceSampler, supportSampler, width) {
  const center = points[index];
  const topY = roadSurfaceHeight(center, surfaceSampler) + ROAD_TOP_LIFT;
  const edges = roadSectionEdges(points, index, width, supportSampler);
  return {
    bottomLeft: addRoadVertex(mesh2, roadBottomPoint(edges.left, topY)),
    bottomRight: addRoadVertex(mesh2, roadBottomPoint(edges.right, topY)),
    topLeft: addRoadVertex(mesh2, { x: edges.left.x, y: topY, z: edges.left.z }),
    topRight: addRoadVertex(mesh2, { x: edges.right.x, y: topY, z: edges.right.z })
  };
}
function appendSegment(mesh2, current, next) {
  addRoadFace(mesh2, [
    current.topLeft,
    next.topLeft,
    next.topRight,
    current.topRight
  ], true);
  addRoadFace(mesh2, [
    current.bottomLeft,
    current.topLeft,
    next.topLeft,
    next.bottomLeft
  ]);
  addRoadFace(mesh2, [
    current.topRight,
    current.bottomRight,
    next.bottomRight,
    next.topRight
  ]);
  addRoadFace(mesh2, [
    current.bottomRight,
    current.bottomLeft,
    next.bottomLeft,
    next.bottomRight
  ]);
}
function appendCap(mesh2, section3, start) {
  const face2 = start ? [section3.bottomRight, section3.bottomLeft, section3.topLeft, section3.topRight] : [section3.bottomLeft, section3.bottomRight, section3.topRight, section3.topLeft];
  addRoadFace(mesh2, face2);
}
function routeStatistics(route2, sectionCount) {
  return {
    id: route2.id,
    maximumSampleGap: route2.pathfinding.maximumSampleGap,
    sections: sectionCount,
    segments: Math.max(0, sectionCount - 1),
    supportMode: "retaining-sides-to-live-terrain",
    terminalDistances: route2.terminalDistances
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/road/RoadStripGeometry.js
function createRoadStrip(routes, surfaceSampler, texture, width = 6.2, supportSampler = surfaceSampler) {
  const mesh2 = createRoadMesh(REPEAT_HOOKS.roadTileWorld);
  const routeStats = routes.map((route2) => {
    return appendRoadRibbon(
      mesh2,
      route2,
      surfaceSampler,
      width,
      supportSampler
    );
  });
  const junctions = appendRoadJunctions(
    mesh2,
    routes,
    surfaceSampler,
    width,
    supportSampler
  );
  const material = roadMaterialFields(texture);
  const network = roadNetworkDefinition(mesh2, routes, junctions, material);
  return {
    collider: network,
    stats: roadStripStatistics(mesh2, routeStats, junctions, material),
    visual: network
  };
}
function roadNetworkDefinition(mesh2, routes, junctions, material) {
  return {
    ...material,
    color: "#7f776a",
    faces: mesh2.faces,
    id: "Awtsmoos-grade-solved-mountain-village-cobble-road-network",
    noEdge: true,
    position: { x: 0, y: 0, z: 0 },
    rotation: { y: 0 },
    shape: "manual",
    solid: true,
    userData: {
      AwtsmoosRoadMaterial: roadMaterialEvidence(material.mapImage),
      AwtsmoosRoadSurface: {
        gradeAuthority: "dense-shared-raised-road-surface",
        junctionCount: junctions.length,
        retainingSides: true,
        routeCount: routes.length,
        topFaceIndices: mesh2.topFaceIndices,
        visibleEqualsCollision: true
      },
      family: "full-quality-mountain-cobble-road-network"
    },
    uvs: mesh2.uvs,
    vertices: mesh2.vertices,
    walkable: true,
    zones: mesh2.vertices.map((_, index) => roadZone(index))
  };
}
function roadStripStatistics(mesh2, routes, junctions, material) {
  const visualSegments = routes.reduce((sum, route2) => sum + route2.segments, 0);
  return {
    collisionSegments: visualSegments,
    junctionCount: junctions.length,
    material: roadMaterialEvidence(material.mapImage),
    retainingSides: true,
    routes,
    surfaceAuthority: "dense-shared-raised-road-surface",
    topFaceCount: mesh2.topFaceIndices.length,
    visibleEqualsCollision: true,
    visualSegments
  };
}
function roadZone(index) {
  const wave = Math.sin(index * 1.73) * 0.5 + 0.5;
  return [1, 0.22 + wave * 0.26, 0.12, 0.18];
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/road/ObstacleGeometry.js
function pointInsideObstacle(point3, obstacle) {
  if (obstacle.type === "capsule") {
    return pointSegmentDistance(point3, obstacle.start, obstacle.end) < obstacle.radius;
  }
  return pointInsidePolygon(point3, obstacle.points);
}
function segmentHitsObstacle(start, end, obstacle) {
  if (obstacle.type === "capsule") {
    return segmentDistance(start, end, obstacle.start, obstacle.end) < obstacle.radius;
  }
  if (pointInsidePolygon(start, obstacle.points) || pointInsidePolygon(end, obstacle.points)) {
    return true;
  }
  return polygonEdges(obstacle.points).some(([left, right]) => segmentsIntersect(start, end, left, right));
}
function polygonHitsObstacle(polygon, obstacle) {
  if (polygon.some((point3) => pointInsideObstacle(point3, obstacle))) {
    return true;
  }
  if (obstacle.type === "capsule") {
    if (pointInsidePolygon(obstacle.start, polygon) || pointInsidePolygon(obstacle.end, polygon)) {
      return true;
    }
    return polygonEdges(polygon).some(([start, end]) => segmentHitsObstacle(start, end, obstacle));
  }
  if (obstacle.points.some((point3) => pointInsidePolygon(point3, polygon))) {
    return true;
  }
  return polygonEdges(polygon).some(([start, end]) => segmentHitsObstacle(start, end, obstacle));
}
function obstacleBounds(obstacle) {
  if (obstacle.type === "capsule") {
    return {
      minX: Math.min(obstacle.start.x, obstacle.end.x) - obstacle.radius,
      maxX: Math.max(obstacle.start.x, obstacle.end.x) + obstacle.radius,
      minZ: Math.min(obstacle.start.z, obstacle.end.z) - obstacle.radius,
      maxZ: Math.max(obstacle.start.z, obstacle.end.z) + obstacle.radius
    };
  }
  return {
    minX: Math.min(...obstacle.points.map((point3) => point3.x)),
    maxX: Math.max(...obstacle.points.map((point3) => point3.x)),
    minZ: Math.min(...obstacle.points.map((point3) => point3.z)),
    maxZ: Math.max(...obstacle.points.map((point3) => point3.z))
  };
}
function pointInsidePolygon(point3, polygon) {
  let inside = false;
  for (let current = 0, previous = polygon.length - 1; current < polygon.length; previous = current++) {
    const a = polygon[current];
    const b = polygon[previous];
    const crosses = a.z > point3.z !== b.z > point3.z && point3.x < (b.x - a.x) * (point3.z - a.z) / (b.z - a.z || 1e-9) + a.x;
    if (crosses) inside = !inside;
  }
  return inside;
}
function polygonEdges(polygon) {
  return polygon.map((point3, index) => [point3, polygon[(index + 1) % polygon.length]]);
}
function pointSegmentDistance(point3, start, end) {
  const dx = end.x - start.x;
  const dz = end.z - start.z;
  const denominator = dx * dx + dz * dz || 1;
  const ratio = Math.max(0, Math.min(1, ((point3.x - start.x) * dx + (point3.z - start.z) * dz) / denominator));
  return Math.hypot(point3.x - start.x - dx * ratio, point3.z - start.z - dz * ratio);
}
function segmentDistance(a, b, c, d) {
  if (segmentsIntersect(a, b, c, d)) {
    return 0;
  }
  return Math.min(
    pointSegmentDistance(a, c, d),
    pointSegmentDistance(b, c, d),
    pointSegmentDistance(c, a, b),
    pointSegmentDistance(d, a, b)
  );
}
function segmentsIntersect(a, b, c, d) {
  const abC = cross2(a, b, c);
  const abD = cross2(a, b, d);
  const cdA = cross2(c, d, a);
  const cdB = cross2(c, d, b);
  if (opposite(abC, abD) && opposite(cdA, cdB)) {
    return true;
  }
  return nearZero(abC) && onSegment(a, b, c) || nearZero(abD) && onSegment(a, b, d) || nearZero(cdA) && onSegment(c, d, a) || nearZero(cdB) && onSegment(c, d, b);
}
function cross2(a, b, c) {
  return (b.x - a.x) * (c.z - a.z) - (b.z - a.z) * (c.x - a.x);
}
function opposite(left, right) {
  return left > 1e-9 && right < -1e-9 || left < -1e-9 && right > 1e-9;
}
function nearZero(value) {
  return Math.abs(value) <= 1e-9;
}
function onSegment(start, end, point3) {
  return point3.x >= Math.min(start.x, end.x) - 1e-9 && point3.x <= Math.max(start.x, end.x) + 1e-9 && point3.z >= Math.min(start.z, end.z) - 1e-9 && point3.z <= Math.max(start.z, end.z) + 1e-9;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/road/RoadStripClearance.js
function inspectRoadStripClearance(visual, obstacleField) {
  const topFaceIndices = visual.userData?.AwtsmoosRoadSurface?.topFaceIndices || [];
  const intersections = [];
  for (const faceIndex of topFaceIndices) {
    const face2 = visual.faces[faceIndex];
    if (!face2) continue;
    const polygon = face2.map((index) => {
      const vertex = visual.vertices[index];
      return {
        x: vertex[0] ?? vertex.x,
        z: vertex[2] ?? vertex.z
      };
    });
    for (const obstacle of obstacleField.obstacles) {
      if (polygonHitsObstacle(polygon, obstacle)) {
        intersections.push({ faceIndex, obstacleId: obstacle.id });
      }
    }
  }
  return {
    finalStripIntersections: intersections,
    clear: intersections.length === 0,
    checkedTopFaces: topFaceIndices.length
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/house/HouseGroundMeasurement.js
function measureHouseGround(specification, sampler) {
  const fallback = specification.floorY ?? 0;
  if (!sampler) {
    return { floorY: fallback, groundMin: fallback, groundEvidence: [] };
  }
  const corners = [
    [-specification.width / 2, -specification.depth / 2],
    [specification.width / 2, -specification.depth / 2],
    [-specification.width / 2, specification.depth / 2],
    [specification.width / 2, specification.depth / 2]
  ];
  const samples = corners.map(([localX, localZ]) => {
    const point3 = localToWorld(specification, localX, localZ);
    return sampler.heightAt(point3.x, point3.z);
  });
  return {
    floorY: Math.max(...samples.map((sample) => sample.y)),
    groundMin: Math.min(...samples.map((sample) => sample.y)),
    groundEvidence: samples.map((sample) => sample.source)
  };
}
function localToWorld(specification, localX, localZ) {
  const cosine = Math.cos(specification.yaw);
  const sine = Math.sin(specification.yaw);
  return {
    x: specification.x + localX * cosine - localZ * sine,
    z: specification.z + localX * sine + localZ * cosine
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/house/HouseSpec.js
var PLAYER_CAPSULE = Object.freeze({ radius: 0.38, height: 1.72 });
var HOUSE_ARCHITECTURE = Object.freeze({
  floorThickness: 0.2,
  storyHeight: 9.2,
  doorWidth: 3.1,
  doorHeight: 3.8,
  wallThickness: 0.9,
  roofClearance: 0.8
});
var DEFAULT_HOUSE_SPEC = Object.freeze({
  id: "Awtsmoos-main-house",
  x: 58,
  z: -64,
  yaw: 0,
  width: 60,
  depth: 46,
  wallH: 19.2,
  wallT: HOUSE_ARCHITECTURE.wallThickness,
  doorW: HOUSE_ARCHITECTURE.doorWidth,
  doorH: HOUSE_ARCHITECTURE.doorHeight,
  roofRise: 8,
  roofOver: 3.4,
  floors: 2,
  fence: true,
  storyHeight: HOUSE_ARCHITECTURE.storyHeight,
  floorThickness: HOUSE_ARCHITECTURE.floorThickness
});
function resolveHouseSpec(specification = {}, sampler) {
  const merged = { ...DEFAULT_HOUSE_SPEC, ...specification };
  const floors = Math.max(1, Math.round(merged.floors || 1));
  const storyHeight = Math.max(8.8, merged.storyHeight || HOUSE_ARCHITECTURE.storyHeight);
  const floorThickness = merged.floorThickness || HOUSE_ARCHITECTURE.floorThickness;
  const minimumWallHeight = floors * storyHeight + HOUSE_ARCHITECTURE.roofClearance;
  const measured = measureHouseGround(merged, sampler);
  return Object.freeze({
    ...merged,
    ...measured,
    floors,
    storyHeight,
    floorThickness,
    wallH: Math.max(merged.wallH || 0, minimumWallHeight),
    doorW: Math.max(merged.doorW || 0, HOUSE_ARCHITECTURE.doorWidth),
    doorH: Math.max(merged.doorH || 0, HOUSE_ARCHITECTURE.doorHeight)
  });
}
function floorBottomY(specification, level) {
  return specification.floorY + level * specification.storyHeight;
}
function floorTopY(specification, level) {
  return floorBottomY(specification, level) + specification.floorThickness;
}
function storyCeilingY(specification, level) {
  if (level + 1 < specification.floors) {
    return floorBottomY(specification, level + 1);
  }
  return specification.floorY + specification.wallH;
}
function localToWorld2(specification, localX, localZ) {
  const cosine = Math.cos(specification.yaw);
  const sine = Math.sin(specification.yaw);
  return {
    x: specification.x + localX * cosine - localZ * sine,
    z: specification.z + localX * sine + localZ * cosine
  };
}
function houseBasis(yaw) {
  const cosine = Math.cos(yaw);
  const sine = Math.sin(yaw);
  const right = Object.freeze({ x: cosine, y: 0, z: sine });
  return Object.freeze({
    right,
    entryRight: right,
    outward: Object.freeze({ x: -sine, y: 0, z: cosine }),
    inward: Object.freeze({ x: sine, y: 0, z: -cosine }),
    up: Object.freeze({ x: 0, y: 1, z: 0 })
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/house/HouseFenceSystem.js
var HOUSE_GATE_WIDTH = 8.4;
var YARD_PADDING = Object.freeze({
  side: 4.5,
  front: 13,
  back: 14
});
function createHouseFenceSegments(spec) {
  const halfWidth = spec.width / 2 + YARD_PADDING.side;
  const backZ = -spec.depth / 2 - YARD_PADDING.back;
  const frontZ = spec.depth / 2 + YARD_PADDING.front;
  const gateWidth = Math.max(HOUSE_GATE_WIDTH, spec.doorW + 5.2);
  const backLeft = localToWorld2(spec, -halfWidth, backZ);
  const backRight = localToWorld2(spec, halfWidth, backZ);
  const frontRight = localToWorld2(spec, halfWidth, frontZ);
  const frontLeft = localToWorld2(spec, -halfWidth, frontZ);
  const gateLeft = localToWorld2(spec, -gateWidth / 2, frontZ);
  const gateRight = localToWorld2(spec, gateWidth / 2, frontZ);
  return [
    [backLeft, backRight],
    [backRight, frontRight],
    [frontRight, gateRight],
    [gateLeft, frontLeft],
    [frontLeft, backLeft]
  ];
}
function createHouseYardPatches(spec) {
  const sideInset = 0.8;
  const halfWidth = spec.width / 2 + YARD_PADDING.side - sideInset;
  const gateHalf = Math.max(HOUSE_GATE_WIDTH, spec.doorW + 5.2) / 2 + 1.1;
  const frontNear = spec.depth / 2 + 1.2;
  const frontFar = spec.depth / 2 + YARD_PADDING.front - 0.8;
  const backNear = -spec.depth / 2 - 1.2;
  const backFar = -spec.depth / 2 - YARD_PADDING.back + 0.8;
  return Object.freeze([
    patch("front-left", -halfWidth, -gateHalf, frontNear, frontFar),
    patch("front-right", gateHalf, halfWidth, frontNear, frontFar),
    patch("back-yard", -halfWidth, halfWidth, backFar, backNear)
  ]);
}
function patch(id, minX, maxX, minZ, maxZ) {
  return Object.freeze({
    id,
    minX: Math.min(minX, maxX),
    maxX: Math.max(minX, maxX),
    minZ: Math.min(minZ, maxZ),
    maxZ: Math.max(minZ, maxZ)
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/road/StaticObstacleFactories.js
function createObstacleDefinitions(definitions, houseSpecs, clearance) {
  const houseIds = new Set(houseSpecs.map((spec) => spec.id));
  return [
    ...houseSpecs.map((spec) => houseObstacle(spec, clearance)),
    ...houseSpecs.flatMap((spec) => fenceObstacles(spec, clearance)),
    ...definitions.filter((definition4) => staticExternalDefinition(definition4, houseIds)).map((definition4) => definitionObstacle(definition4, clearance)).filter(Boolean)
  ];
}
function obstacleFieldBounds(obstacles) {
  const bounds = obstacles.map(obstacleBounds);
  return {
    minX: Math.min(...bounds.map((item) => item.minX), -120),
    maxX: Math.max(...bounds.map((item) => item.maxX), 160),
    minZ: Math.min(...bounds.map((item) => item.minZ), -160),
    maxZ: Math.max(...bounds.map((item) => item.maxZ), 120)
  };
}
function houseObstacle(spec, clearance) {
  const halfWidth = spec.width / 2 + clearance;
  const halfDepth = spec.depth / 2 + clearance;
  return polygonObstacle(`${spec.id}-footprint`, [
    localToWorld2(spec, -halfWidth, -halfDepth),
    localToWorld2(spec, halfWidth, -halfDepth),
    localToWorld2(spec, halfWidth, halfDepth),
    localToWorld2(spec, -halfWidth, halfDepth)
  ], "house");
}
function fenceObstacles(spec, clearance) {
  return createHouseFenceSegments(spec).map(([start, end], index) => Object.freeze({
    id: `${spec.id}-fence-${index + 1}`,
    type: "capsule",
    source: "fence",
    start,
    end,
    radius: clearance + 0.14
  }));
}
function staticExternalDefinition(definition4, houseIds) {
  if (definition4.solid === false || definition4.walkable === true || definition4.userData?.AwtsmoosFence) {
    return false;
  }
  return ![...houseIds].some((houseId) => definition4.id?.startsWith(houseId));
}
function definitionObstacle(definition4, clearance) {
  if (definition4.size) {
    return orientedBoxObstacle(definition4, clearance);
  }
  const points = (definition4.vertices || []).map((point3) => transform(point3, definition4));
  if (!points.length) return null;
  return polygonObstacle(definition4.id, rectanglePoints(boundsOf(points, clearance)), "static");
}
function orientedBoxObstacle(definition4, clearance) {
  const halfX = definition4.size.x / 2 + clearance;
  const halfZ = definition4.size.z / 2 + clearance;
  return polygonObstacle(definition4.id, [
    transform([-halfX, 0, -halfZ], definition4),
    transform([halfX, 0, -halfZ], definition4),
    transform([halfX, 0, halfZ], definition4),
    transform([-halfX, 0, halfZ], definition4)
  ], "static");
}
function transform(point3, definition4) {
  const [x, , z] = Array.isArray(point3) ? point3 : [point3.x, point3.y, point3.z];
  const yaw = definition4.rotation?.y || definition4.yaw || 0;
  const cosine = Math.cos(yaw);
  const sine = Math.sin(yaw);
  return {
    x: (definition4.position?.x || 0) + x * cosine - z * sine,
    z: (definition4.position?.z || 0) + x * sine + z * cosine
  };
}
function polygonObstacle(id, points, source) {
  return Object.freeze({ id, type: "polygon", source, points: Object.freeze(points) });
}
function boundsOf(points, clearance) {
  return {
    minX: Math.min(...points.map((point3) => point3.x)) - clearance,
    maxX: Math.max(...points.map((point3) => point3.x)) + clearance,
    minZ: Math.min(...points.map((point3) => point3.z)) - clearance,
    maxZ: Math.max(...points.map((point3) => point3.z)) + clearance
  };
}
function rectanglePoints(bounds) {
  return [
    { x: bounds.minX, z: bounds.minZ },
    { x: bounds.maxX, z: bounds.minZ },
    { x: bounds.maxX, z: bounds.maxZ },
    { x: bounds.minX, z: bounds.maxZ }
  ];
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/road/StaticObstacleField.js
function createStaticObstacleField(definitions, houseSpecs, clearance) {
  const obstacles = createObstacleDefinitions(definitions, houseSpecs, clearance);
  return Object.freeze({
    clearance,
    obstacles: Object.freeze(obstacles),
    bounds: obstacleFieldBounds(obstacles)
  });
}
function routeIntersections(field, routes) {
  const intersections = [];
  for (const route2 of routes) {
    for (let index = 0; index < route2.points.length - 1; index += 1) {
      for (const obstacle of field.obstacles) {
        if (segmentHitsObstacle(route2.points[index], route2.points[index + 1], obstacle)) {
          intersections.push({
            routeId: route2.id,
            segment: index,
            obstacleId: obstacle.id
          });
        }
      }
    }
  }
  return intersections;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/road/PathRoadStatistics.js
function createPathRoadStatistics(context) {
  const graph = roadGraph(context.routes, context.networkEvidence);
  const clearance = inspectRoadStripClearance(
    context.strip.visual,
    context.obstacleField
  );
  return {
    ...graph.validation,
    ...context.strip.stats,
    ...clearance,
    foldedSegments: [],
    maxTurnAngle: maximumTurnAngle(context.routes),
    obstacleCount: context.obstacleField.obstacles.length,
    pathFailures: [],
    pathfindingMethod: "dense-grade-constrained-canonical-corridors",
    planningClearance: context.obstacleField.clearance,
    roadSurface: context.surfaceEvidence,
    routeEvidence: context.routes.map((route2) => ({
      id: route2.id,
      ...route2.pathfinding
    })),
    routeIntersections: routeIntersections(
      context.obstacleField,
      context.routes
    ),
    terminalGaps: []
  };
}
function roadGraph(routes, evidence) {
  const nodes = uniqueRoutePoints(routes);
  return Object.freeze({
    edges: Object.freeze(routes.map((route2) => route2.id)),
    nodes: Object.freeze(nodes),
    validation: Object.freeze({
      connected: evidence.connected,
      edgeCount: routes.length,
      method: evidence.method,
      nodeCount: nodes.length
    })
  });
}
function uniqueRoutePoints(routes) {
  const points = /* @__PURE__ */ new Map();
  for (const route2 of routes) {
    for (const point3 of route2.points) {
      points.set(`${point3.x.toFixed(5)},${point3.z.toFixed(5)}`, point3);
    }
  }
  return [...points.values()];
}
function maximumTurnAngle(routes) {
  let maximum = 0;
  for (const route2 of routes) {
    for (let index = 1; index < route2.points.length - 1; index += 1) {
      const previous = direction(route2.points[index - 1], route2.points[index]);
      const next = direction(route2.points[index], route2.points[index + 1]);
      const dot2 = Math.max(
        -1,
        Math.min(1, previous.x * next.x + previous.z * next.z)
      );
      maximum = Math.max(maximum, Math.acos(dot2));
    }
  }
  return maximum;
}
function direction(from, to) {
  const x = to.x - from.x;
  const z = to.z - from.z;
  const length3 = Math.hypot(x, z) || 1;
  return { x: x / length3, z: z / length3 };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/CanonicalHouseArchetypes.js
var FORMER_BASE_VOLUME = 7.6 * 5.9 * 5.5;
var PLAYER_REFERENCE_VOLUME = 0.61;
var ARCHETYPES = Object.freeze({
  "family-house": preset(14.6, 11.4, 2, 3.25, 4.2, ["entry", "kitchen-dining", "living-room", "bedroom", "study"]),
  "guest-house": preset(17.2, 12.8, 2, 3.35, 4.8, ["entry", "communal-room", "kitchen-dining", "guest-bedroom", "guest-bedroom", "Torah-library"]),
  "hillside-split-level": preset(12.8, 10.2, 2, 3.15, 3.8, ["entry", "living-room", "kitchen-dining", "bedroom", "storage-room"]),
  "merchant-shop": preset(13.8, 10.8, 2, 3.3, 4.1, ["shop", "storage-room", "kitchen-dining", "living-room", "bedroom"]),
  "small-stone-cottage": preset(11.4, 9.2, 1, 3.45, 3.3, ["entry", "living-room", "kitchen-dining", "bedroom"]),
  "workshop-barn": preset(15.6, 12.2, 1, 3.9, 3.7, ["workshop", "storage-room", "kitchen-dining", "study"])
});
function canonicalHouseArchitecture(archetype, variant = 0) {
  const source = ARCHETYPES[archetype];
  if (!source) throw new Error(`Unknown canonical house archetype: ${archetype}`);
  const safeVariant = Math.abs(Math.trunc(Number(variant) || 0));
  const width = source.width + safeVariant % 3 * 0.55;
  const depth = source.depth + safeVariant % 2 * 0.45;
  const storyHeight = source.storyHeight + safeVariant % 2 * 0.08;
  const wallHeight = source.stories * storyHeight;
  const volume = width * depth * wallHeight;
  return Object.freeze({
    archetype,
    balcony: source.stories > 1 && safeVariant % 3 !== 1,
    chimney: archetype !== "workshop-barn" || safeVariant % 2 === 0,
    depth,
    expansionRatio: volume / FORMER_BASE_VOLUME,
    foundationStyle: safeVariant % 2 ? "stepped-stone" : "retaining-plinth",
    gardenType: ["herbs", "flowers", "orchard-edge"][safeVariant % 3],
    minimumExpansion: 1,
    porch: archetype !== "hillside-split-level" || safeVariant % 2 === 0,
    roofMaterial: safeVariant % 3 === 2 ? "clay-tile" : "slate",
    roofRise: source.roofRise + safeVariant % 3 * 0.22,
    roomTypes: Object.freeze([...source.roomTypes]),
    stories: source.stories,
    storyHeight,
    volume,
    volumeRatio: volume / PLAYER_REFERENCE_VOLUME,
    wallHeight,
    width,
    windowPattern: ["paired", "irregular", "deep-set"][safeVariant % 3]
  });
}
function preset(width, depth, stories, storyHeight, roofRise, roomTypes) {
  return Object.freeze({ depth, roofRise, roomTypes: Object.freeze(roomTypes), stories, storyHeight, width });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/CanonicalVillageHouses.js
var CANONICAL_VILLAGE_HOUSES = Object.freeze([
  house("H10", "arrival-meadow", "small-stone-cottage", -50, 116, 1.3, 0),
  house("H11", "arrival-meadow", "family-house", 54, 106, -1.24, 1),
  house("H12", "beis-chabad-terrace", "guest-house", -102, 78, 0.62, 2),
  house("H13", "beis-chabad-terrace", "hillside-split-level", -64, 80, -0.48, 3),
  house("H14", "market-quarter", "merchant-shop", -88, 34, 0.82, 4),
  house("H15", "market-quarter", "merchant-shop", -48, 48, -0.72, 5),
  house("H16", "market-quarter", "workshop-barn", -43, 8, 2.46, 6),
  house("H17", "shul-terrace", "family-house", -105, -38, 0.68, 7),
  house("H18", "shul-terrace", "small-stone-cottage", -62, -62, -0.64, 8),
  house("H19", "upper-residential", "hillside-split-level", -40, -103, 0.54, 9),
  house("H20", "upper-residential", "family-house", 3, -70, -0.46, 10),
  house("H21", "north-slope-residential", "hillside-split-level", 23, -118, 0.38, 11),
  house("H22", "north-slope-residential", "family-house", 68, -94, -0.52, 12),
  house("H23", "east-bank-homes", "small-stone-cottage", 81, -14, 2.72, 13),
  house("H24", "east-bank-homes", "family-house", 106, 28, -2.56, 14),
  house("H25", "waterfall-portal", "hillside-split-level", 114, -72, 2.92, 15),
  house("H26", "farm-terraces", "workshop-barn", 112, 76, -2.44, 16),
  house("H27", "riverfront-gardens", "guest-house", -16, 76, 1.18, 17)
]);
var CANONICAL_HOUSES_BY_ID = Object.freeze(Object.fromEntries(
  CANONICAL_VILLAGE_HOUSES.map((definition4) => [definition4.id, definition4])
));
function house(id, districtId, archetype, x, z, yaw, variant) {
  return Object.freeze({
    ...canonicalHouseArchitecture(archetype, variant),
    districtId,
    id,
    number: id,
    variant,
    x,
    yaw,
    z
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/CanonicalVillageFootprints.js
var LANDMARK_FOOTPRINTS = Object.freeze([
  footprint("SHUL01", "shul", -34, -24, 9, 7, 0.08, 8.8),
  footprint("BEIS01", "beis-chabad", -35, 45, 10, 7.5, -0.08, 4.4),
  footprint("MARKET01", "market-hall", -26, 12, 11, 7.5, 0.03, 5.5),
  footprint("BRIDGE01", "stone-bridge", 18, 7, 15.2, 5.2, 0, 6.3),
  footprint("PORTAL01", "waterfall-portal", 56, -49, 7.5, 3, -0.3, 12.4),
  footprint("ENTR01", "arrival-threshold", 0, 101, 8, 12, 0, 2.2),
  footprint("F01", "farm-terrace", 36, 34, 13, 11, -0.08, 5.2),
  footprint("F02", "farm-terrace", 51, 39, 13, 11, 0.08, 5.4),
  footprint("F03", "orchard", 35, 49, 11, 9, -0.04, 5.7),
  footprint("F04", "orchard", 50, 53, 11, 9, 0.04, 5.9)
]);
var HOUSE_ARCHETYPES = Object.freeze([
  "small-cottage",
  "family-house",
  "hillside-house",
  "inn-house",
  "workshop-house"
]);
var CANONICAL_VILLAGE_FOOTPRINTS = Object.freeze([
  ...LANDMARK_FOOTPRINTS,
  ...CANONICAL_VILLAGE_HOUSES.map((house2, index) => {
    const wide = index % 4 === 1;
    return footprint(
      house2.id,
      HOUSE_ARCHETYPES[index % HOUSE_ARCHETYPES.length],
      house2.x,
      house2.z,
      wide ? 8.5 : 7.2,
      wide ? 6.5 : 5.8,
      house2.yaw,
      house2.baseElevation || null
    );
  })
]);
var CANONICAL_FOOTPRINTS_BY_ID = Object.freeze(Object.fromEntries(
  CANONICAL_VILLAGE_FOOTPRINTS.map((definition4) => [definition4.id, definition4])
));
function footprint(id, archetype, x, z, width, depth, yaw, baseElevation) {
  return Object.freeze({
    archetype,
    baseElevation,
    depth,
    id,
    width,
    x,
    yaw,
    z
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/PathRoadSystem.js
var ROAD_WIDTH = 5.8;
var ROAD_SAFETY_MARGIN = 0.35;
function houseRoadSystem(assets, groundSampler, staticDefinitions = []) {
  const routes = canonicalRoadSurfaceRoutes();
  const surfaceEvidence = canonicalRoadSurfaceEvidence();
  const strip = createRoadStrip(
    routes,
    groundSampler,
    null,
    ROAD_WIDTH,
    groundSampler
  );
  const obstacleField = createStaticObstacleField(
    staticDefinitions,
    [],
    ROAD_SAFETY_MARGIN
  );
  const stats = createPathRoadStatistics({
    networkEvidence: canonicalRoadNetworkEvidence(),
    obstacleField,
    routes,
    strip,
    surfaceEvidence
  });
  strip.visual.userData.AwtsmoosRoad = {
    ...stats,
    legacyYellowBrickIgnored: Boolean(assets?.yellowBrickImage),
    materialAuthority: "mountain-village-cobble-stack"
  };
  return {
    anchors: roadAnchors(),
    colliders: [strip.visual],
    graph: roadGraphEvidence(routes, stats),
    routes: routes.map((route2) => route2.id),
    stats,
    visual: strip.visual
  };
}
function roadAnchors() {
  const houses = CANONICAL_VILLAGE_FOOTPRINTS.filter((definition4) => /^H\d+$/.test(definition4.id)).map((definition4) => Object.freeze({
    id: definition4.id,
    x: definition4.x,
    z: definition4.z
  }));
  return Object.freeze({
    houses: Object.freeze(houses),
    plaza: Object.freeze({ id: "PLAZA01", x: -12, z: 14 })
  });
}
function roadGraphEvidence(routes, stats) {
  return Object.freeze({
    edges: Object.freeze(routes.map((route2) => route2.id)),
    nodes: Object.freeze(routes.flatMap((route2) => route2.points)),
    validation: Object.freeze({
      connected: stats.connected,
      edgeCount: stats.edgeCount,
      method: stats.method,
      nodeCount: stats.nodeCount
    })
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/DeferredTerrainFeatureState.js
function createDeferredForestState() {
  const group = new Group();
  group.name = "Awtsmoos_deferred_forest_vessel";
  return {
    colliders: [],
    group,
    records: [],
    stats: {
      drawCalls: 0,
      generationMilliseconds: 0,
      generatorAuthority: "deferred-after-movement",
      mobilePolicy: "stream-after-first-movement",
      rendering: { drawCalls: 0, triangles: 0 },
      state: "deferred",
      treeCount: 0,
      unsupported: { wind: "disabled-before-enrichment" }
    }
  };
}
function createDeferredTextLandmarkState() {
  const mesh2 = new Group();
  mesh2.name = "Awtsmoos_deferred_text_landmark_vessel";
  return {
    artifact: null,
    colliders: [],
    definition: null,
    mesh: mesh2,
    stats: {
      colliders: 0,
      deterministic: true,
      generationMilliseconds: 0,
      state: "deferred",
      triangles: 0,
      vertices: 0
    }
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/terrain/LocalTerrainTextureCatalog.js
var ROOT = "./assets/materials/local/terrain/";
var LOCAL_TERRAIN_TEXTURES = Object.freeze({
  forestLeafFloor: `${ROOT}forest-leaf-floor.png`,
  meadowWetGrass: `${ROOT}meadow-wet-grass.png`,
  mountainStone: `${ROOT}mountain-stone.png`,
  shoreSand: `${ROOT}shore-sand.png`,
  streamBankMud: `${ROOT}stream-bank-mud.png`,
  wornEarth: `${ROOT}worn-earth.jpg`
});
var URL_BY_ROLE = Object.freeze({
  "forest-leaf-floor": LOCAL_TERRAIN_TEXTURES.forestLeafFloor,
  "meadow-source-grass": LOCAL_TERRAIN_TEXTURES.meadowWetGrass,
  "meadow-wet-grass": LOCAL_TERRAIN_TEXTURES.meadowWetGrass,
  "mountain-stone": LOCAL_TERRAIN_TEXTURES.mountainStone,
  "shore-sand": LOCAL_TERRAIN_TEXTURES.shoreSand,
  "stream-bank-mud": LOCAL_TERRAIN_TEXTURES.streamBankMud,
  "worn-earth": LOCAL_TERRAIN_TEXTURES.wornEarth
});
function localTerrainTextureUrl(role) {
  const url = URL_BY_ROLE[role];
  if (!url) throw new Error(`Missing local terrain texture role: ${role}`);
  return url;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/terrain/TerrainLayerRecipe.js
var QUALITY_ROLES = Object.freeze({
  low: Object.freeze([
    "meadow-source-grass",
    "worn-earth",
    "mountain-stone"
  ]),
  medium: Object.freeze([
    "meadow-wet-grass",
    "worn-earth",
    "stream-bank-mud",
    "mountain-stone",
    "forest-leaf-floor"
  ]),
  high: Object.freeze([
    "meadow-wet-grass",
    "worn-earth",
    "stream-bank-mud",
    "mountain-stone",
    "forest-leaf-floor",
    "shore-sand"
  ]),
  cinematic: Object.freeze([
    "meadow-wet-grass",
    "worn-earth",
    "stream-bank-mud",
    "mountain-stone",
    "forest-leaf-floor",
    "shore-sand"
  ])
});
function terrainLayerRecipe(quality = "medium") {
  const stack = mountainTerrainStack();
  const activeRoles = QUALITY_ROLES[quality] || QUALITY_ROLES.medium;
  const layers = activeRoles.map((role) => localizeLayer(requiredLayer(stack, role)));
  return Object.freeze({
    activeLayerCount: layers.length,
    activeRoles,
    baseUrl: localTerrainTextureUrl("meadow-source-grass"),
    dirtUrl: localTerrainTextureUrl("worn-earth"),
    layers: Object.freeze(layers),
    logicalLayerCount: stack.logicalLayerCount,
    pageCount: Math.ceil(stack.logicalLayerCount / layers.length),
    quality,
    shader: "terrain-layered-six-stage-material-stack",
    stack
  });
}
function requiredLayer(stack, role) {
  const layer = stack.layers.find((candidate) => candidate.role === role);
  if (!layer) throw new Error(`Missing canonical terrain role: ${role}`);
  return layer;
}
function localizeLayer(layer) {
  return Object.freeze({
    ...layer,
    publicUrl: layer.url,
    url: localTerrainTextureUrl(layer.role)
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/terrain/TerrainMaterialFactory.js
var TERRAIN_SOURCE_TINT = Object.freeze([1, 1, 1, 1]);
var TERRAIN_UV_UNITS_PER_WORLD = Object.freeze([0.035, 0.035]);
function createTerrainMaterial(options) {
  const recipe = terrainLayerRecipe(options.quality);
  const grassImage = options.grassImage || cachedTextureImage(recipe.baseUrl);
  const dirtImage = options.dirtImage || cachedTextureImage(recipe.dirtUrl);
  const textureUrl = grassImage?.src || recipe.baseUrl;
  const material = new MeshStandardMaterial({
    color: TERRAIN_SOURCE_TINT,
    metalness: 0,
    name: "Awtsmoos_canonical_textured_alpine_valley",
    roughness: 0.96
  });
  Object.assign(material, {
    anisotropy: 8,
    mapImage: grassImage,
    mapRepeat: terrainRepeat(options.size, grassImage),
    materialStack: recipe.stack,
    mixImage: dirtImage,
    mixPatchScale: 0.017,
    mixPatchSharpness: 0.62,
    mixRepeat: terrainRepeat(options.size, dirtImage),
    mixStrength: 0.64,
    mixTextureUrl: recipe.dirtUrl,
    textureLayers: recipe.layers.map(hydratableLayer),
    texturePolicy: terrainTexturePolicy(recipe, grassImage, dirtImage, textureUrl),
    textureUrl
  });
  return material;
}
function hydratableLayer(layer) {
  return {
    ...layer,
    image: cachedTextureImage(layer.url)
  };
}
function terrainTexturePolicy(recipe, grassImage, dirtImage, textureUrl) {
  return {
    baseSource: "trusted-local-high-resolution-meadow",
    fullResolutionEcologicalLayers: true,
    hydration: grassImage && dirtImage ? "ready-at-construction" : "local-preload-required",
    layerCount: recipe.layers.length,
    logicalLayerCount: recipe.logicalLayerCount,
    materialStackDiagnostics: materialStackDiagnostics(recipe.stack, 10),
    mix: "base-meadow-earth-plus-zone-slope-height-wetness",
    nativeTexelDensity: true,
    publicFirebase: false,
    realBaseImage: Boolean(grassImage),
    realMixImage: Boolean(dirtImage),
    repeatMode: "fractional-mirror-original-pixel-density",
    shader: recipe.shader,
    sourcePixels: textureSize(grassImage),
    texelsPerWorld: REPEAT_HOOKS.terrainTexelsPerWorld,
    textureUrl,
    uvUnitsPerWorld: TERRAIN_UV_UNITS_PER_WORLD
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/TerrainMesh.js
function createTerrainMesh(data, grassImage, dirtImage, fallbackUrl, quality = "medium") {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(
    data.vertices.flatMap((point3) => [point3.x, point3.y, point3.z])
  ), 3));
  geometry.setAttribute("normal", new BufferAttribute(new Float32Array(data.normals), 3));
  geometry.setAttribute("uv", new BufferAttribute(new Float32Array(data.uvs), 2));
  geometry.setAttribute("zone", new BufferAttribute(new Float32Array(zoneWeights(data.zones)), 4));
  geometry.setIndex(new BufferAttribute(indexArray(data.indices), 1));
  const material = createTerrainMaterial({
    dirtImage,
    fallbackUrl,
    grassImage,
    quality,
    size: data.size
  });
  material.visible = true;
  material.transparent = false;
  material.opacity = 1;
  const mesh2 = new Mesh(geometry, material);
  mesh2.name = "Awtsmoos_canonical_alpine_valley_terrain";
  mesh2.visible = true;
  mesh2.frustumCulled = false;
  mesh2.userData.AwtsmoosTerrainValley = {
    ...data.AwtsmoosTerrainValley,
    indexCount: data.indices.length,
    layerCount: material.textureLayers.length,
    shader: material.texturePolicy.shader,
    visibleAtBoot: true,
    vertexCount: data.vertices.length
  };
  mesh2.setBaseTransform();
  return mesh2;
}
function zoneWeights(zones = []) {
  return zones.flatMap(zoneToWeight);
}
function zoneToWeight(zone) {
  if (zone === "village-plaza") return [1, 0, 0, 0.45];
  if (zone === "lake-basin") return [0.05, 0.72, 0.23, 0];
  if (zone === "stream-channel") return [0.05, 0.72, 0.23, 0];
  if (zone === "river-bank") return [0.22, 0.43, 0.35, 0];
  if (zone === "village-terrace") return [0.48, 0.12, 0.1, 0.3];
  if (zone === "alpine-rock") return [0.12, 0.05, 0.08, 0.75];
  return [0.82, 0.04, 0.12, 0.02];
}
function indexArray(indices) {
  return dataMaximum(indices) > 65535 ? new Uint32Array(indices) : new Uint16Array(indices);
}
function dataMaximum(indices) {
  let maximum = 0;
  for (const index of indices) maximum = Math.max(maximum, index);
  return maximum;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/TerrainGroupAssembly.js
async function createTerrainGroupAsync(options, grassTextureUrl, settings = {}) {
  const group = createBaseGroup(options, grassTextureUrl);
  const yieldWork = settings.yieldWork || browserYield;
  await addDefinitionsAsync(group, options.obstacles, yieldWork, 0.9, settings.onProgress);
  await addDefinitionsAsync(group, options.village.definitions, yieldWork, 0.94, settings.onProgress);
  finishGroup(group, options);
  await yieldWork();
  return group;
}
function createBaseGroup(options, grassTextureUrl) {
  const group = new Group();
  group.name = "Awtsmoos_Eretz_full_village_water_forest_houses";
  group.add(createTerrainMesh(
    options.terrain,
    options.grassImage,
    options.dirtImage,
    grassTextureUrl,
    options.quality
  ));
  group.add(createPrimitiveMesh(options.road.visual));
  return group;
}
async function addDefinitionsAsync(group, definitions, yieldWork, progress, onProgress) {
  for (let index = 0; index < definitions.length; index += 1) {
    addDefinition(group, definitions[index]);
    if ((index + 1) % 8 !== 0) continue;
    onProgress?.({ message: "Assembling visible village forms\u2026", progress });
    await yieldWork();
  }
}
function finishGroup(group, options) {
  group.add(options.textLandmark.mesh);
  group.add(options.forest.group);
}
function addDefinition(group, definition4) {
  group.add(createPrimitiveMesh(definition4));
}
function browserYield() {
  if (typeof globalThis.scheduler?.yield === "function") return globalThis.scheduler.yield();
  return new Promise((resolve) => setTimeout(resolve, 0));
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/CanonicalRoadGraph.js
var MAXIMUM_GRAPH_GRADE = 0.16;
var RELAXATION_PASSES2 = 512;
var cachedGraph = null;
function canonicalRoadGraph(baseHeightAt) {
  if (!cachedGraph) {
    cachedGraph = buildRoadGraph(baseHeightAt);
  }
  return cachedGraph;
}
function buildRoadGraph(baseHeightAt) {
  const sourceRoutes = canonicalVillageRoadRoutes();
  const nodes = createNodes(sourceRoutes, baseHeightAt);
  const edges = createEdges(sourceRoutes, nodes);
  relaxElevations(edges);
  const routes = sourceRoutes.map((route2) => {
    return Object.freeze({
      ...route2,
      points: Object.freeze(route2.points.map((point3) => {
        return Object.freeze(nodes.get(pointKey(point3)));
      }))
    });
  });
  return Object.freeze({
    nodes,
    routes: Object.freeze(routes)
  });
}
function createNodes(routes, baseHeightAt) {
  const nodes = /* @__PURE__ */ new Map();
  for (const route2 of routes) {
    for (const point3 of route2.points) {
      const key = pointKey(point3);
      if (!nodes.has(key)) {
        nodes.set(key, {
          targetHeight: baseHeightAt(point3.x, point3.z),
          x: point3.x,
          z: point3.z
        });
      }
    }
  }
  return nodes;
}
function createEdges(routes, nodes) {
  const edges = [];
  for (const route2 of routes) {
    for (let index = 1; index < route2.points.length; index += 1) {
      const first = nodes.get(pointKey(route2.points[index - 1]));
      const second = nodes.get(pointKey(route2.points[index]));
      edges.push({
        first,
        maximumDelta: Math.hypot(
          second.x - first.x,
          second.z - first.z
        ) * MAXIMUM_GRAPH_GRADE,
        second
      });
    }
  }
  return edges;
}
function relaxElevations(edges) {
  for (let pass = 0; pass < RELAXATION_PASSES2; pass += 1) {
    let changed = false;
    for (const edge of edges) {
      changed = relaxEdge(edge) || changed;
    }
    if (!changed) {
      return;
    }
  }
}
function relaxEdge(edge) {
  const delta = edge.second.targetHeight - edge.first.targetHeight;
  const excess = Math.abs(delta) - edge.maximumDelta;
  if (excess <= 1e-6) {
    return false;
  }
  const direction2 = Math.sign(delta);
  edge.first.targetHeight += direction2 * excess / 2;
  edge.second.targetHeight -= direction2 * excess / 2;
  return true;
}
function pointKey(point3) {
  return `${point3.x}:${point3.z}`;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/CanonicalRoadProfiles.js
var cachedProfiles = null;
function canonicalRoadProfiles(baseHeightAt) {
  if (!cachedProfiles) {
    cachedProfiles = canonicalRoadGraph(baseHeightAt).routes.map((route2) => {
      return Object.freeze({
        fullRadius: route2.width / 2 + 0.45,
        id: route2.id,
        points: route2.points,
        softRadius: route2.width / 2 + 3.25,
        width: route2.width
      });
    });
  }
  return cachedProfiles;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/CanonicalRoadCorridor.js
function canonicalRoadCorridorSampleAt(x, z, baseHeight, baseHeightAt) {
  const nearest = nearestRoadSample(
    canonicalRoadProfiles(baseHeightAt),
    x,
    z
  );
  if (!nearest) {
    return Object.freeze({
      height: baseHeight,
      influence: 0
    });
  }
  const influence = 1 - smooth5(
    nearest.profile.fullRadius,
    nearest.profile.softRadius,
    nearest.distance
  );
  return Object.freeze({
    height: mix4(baseHeight, nearest.targetHeight, influence),
    influence
  });
}
function nearestRoadSample(profiles, x, z) {
  let nearest = null;
  for (const profile of profiles) {
    for (let index = 1; index < profile.points.length; index += 1) {
      const sample = segmentSample(
        profile.points[index - 1],
        profile.points[index],
        x,
        z
      );
      if (!nearest || sample.distance < nearest.distance) {
        nearest = {
          ...sample,
          profile
        };
      }
    }
  }
  return nearest;
}
function segmentSample(first, second, x, z) {
  const dx = second.x - first.x;
  const dz = second.z - first.z;
  const lengthSquared = dx * dx + dz * dz || 1;
  const amount = clamp7(
    ((x - first.x) * dx + (z - first.z) * dz) / lengthSquared
  );
  const projectedX = first.x + dx * amount;
  const projectedZ = first.z + dz * amount;
  return {
    distance: Math.hypot(x - projectedX, z - projectedZ),
    targetHeight: mix4(
      first.targetHeight,
      second.targetHeight,
      amount
    )
  };
}
function smooth5(edge0, edge1, value) {
  const amount = clamp7((value - edge0) / (edge1 - edge0 || 1));
  return amount * amount * (3 - 2 * amount);
}
function mix4(first, second, amount) {
  return first + (second - first) * clamp7(amount);
}
function clamp7(value) {
  return Math.max(0, Math.min(1, value));
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/CanonicalTerrainHeight.js
function canonicalTerrainHeightAt(x, z) {
  const baseHeight = canonicalTerrainBaseHeightAt(x, z);
  const roadHeight = canonicalRoadCorridorSampleAt(
    x,
    z,
    baseHeight,
    canonicalTerrainBaseHeightAt
  ).height;
  return canonicalHydrologyTerrainHeightAt(x, z, roadHeight);
}
function canonicalTerrainZoneAt(x, z, measuredElevation = null) {
  const river = canonicalRiverTerrainSample(x, z);
  const terrace2 = canonicalTerraceSample(x, z);
  const elevation = Number.isFinite(measuredElevation) ? measuredElevation : canonicalTerrainHeightAt(x, z);
  if (river.distance < river.width * 0.78) {
    return "stream-channel";
  }
  if (river.distance < river.width + 5.5) {
    return "river-bank";
  }
  if (terrace2.influence > 0.34) {
    return "village-terrace";
  }
  if (elevation > 12 || Math.abs(x - river.center.x) > 100) {
    return "alpine-rock";
  }
  return "grass-valley";
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/TerrainGeometryIndices.js
async function buildTerrainIndicesAsync(steps, yieldWork) {
  const indices = [];
  for (let row = 0; row < steps; row += 1) {
    appendRow(indices, steps, row);
    if ((row + 1) % 8 === 0) await yieldWork();
  }
  return indices;
}
async function buildTerrainCollidersAsync(vertices, indices, yieldWork) {
  const colliders = [];
  for (let offset = 0; offset < indices.length; offset += 3) {
    colliders.push(createCollider(vertices, indices, offset));
    if ((offset / 3 + 1) % 384 === 0) await yieldWork();
  }
  return colliders;
}
function appendRow(indices, steps, row) {
  for (let column = 0; column < steps; column += 1) {
    const first = row * (steps + 1) + column;
    const second = first + 1;
    const third = first + steps + 1;
    const fourth = third + 1;
    indices.push(first, third, second, second, third, fourth);
  }
}
function createCollider(vertices, indices, offset) {
  return new TriangleCollider(
    vertices[indices[offset]],
    vertices[indices[offset + 1]],
    vertices[indices[offset + 2]],
    { floor: true, kind: "terrain", solid: true }
  );
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/TerrainGeometryNormals.js
async function buildTerrainNormalsAsync(vertices, indices, yieldWork) {
  const normals = emptyNormals(vertices.length);
  for (let offset = 0; offset < indices.length; offset += 3) {
    addFaceNormal(normals, vertices, indices, offset);
    if ((offset / 3 + 1) % 384 === 0) await yieldWork();
  }
  const flattened = [];
  for (let index = 0; index < normals.length; index += 1) {
    flattened.push(...normalized2(normals[index]));
    if ((index + 1) % 512 === 0) await yieldWork();
  }
  return flattened;
}
function emptyNormals(length3) {
  return Array.from({ length: length3 }, () => v());
}
function addFaceNormal(normals, vertices, indices, offset) {
  const face2 = [indices[offset], indices[offset + 1], indices[offset + 2]];
  const normal = triangleNormal(vertices[face2[0]], vertices[face2[1]], vertices[face2[2]]);
  for (const vertexIndex of face2) {
    normals[vertexIndex].x += normal.x;
    normals[vertexIndex].y += normal.y;
    normals[vertexIndex].z += normal.z;
  }
}
function normalized2(normal) {
  const length3 = Math.hypot(normal.x, normal.y, normal.z) || 1;
  return [normal.x / length3, normal.y / length3, normal.z / length3];
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/TerrainGeometryFinalization.js
async function finishTerrainGeometryAsync(state, preparation, coordinateAt, options = {}) {
  const yieldWork = options.yieldWork || browserYield2;
  options.onPhase?.("Indexing the terrain surface\u2026", 0.72);
  const indices = await buildTerrainIndicesAsync(state.steps, yieldWork);
  options.onPhase?.("Preparing responsive terrain collision\u2026", 0.78);
  const colliders = await buildTerrainCollidersAsync(state.vertices, indices, yieldWork);
  options.onPhase?.("Lighting the terrain surface\u2026", 0.84);
  const normals = await buildTerrainNormalsAsync(state.vertices, indices, yieldWork);
  preparation.milliseconds = now() - preparation.startedAt;
  return terrainResult(state, indices, colliders, normals, preparation, coordinateAt);
}
function terrainResult(state, indices, colliders, normals, preparation, coordinateAt) {
  return {
    AwtsmoosTerrainValley: terrainEvidence(state, indices, preparation, coordinateAt),
    colliders,
    indices,
    normals,
    preparation: publicPreparation(preparation),
    size: state.size,
    steps: state.steps,
    uvs: state.uvs,
    vertices: state.vertices,
    zones: state.zones
  };
}
function terrainEvidence(state, indices, preparation, coordinateAt) {
  const center = state.steps / 2;
  const spacing = Math.abs(
    coordinateAt(center + 1, state.steps, state.half) - coordinateAt(center, state.steps, state.half)
  );
  return Object.freeze({
    centerSpacing: Number(spacing.toFixed(3)),
    colliderTriangles: indices.length / 3,
    grid: `${state.steps}x${state.steps}`,
    hydrology: "canonical-waterfall-bridge-lake-outlet",
    performancePolicy: "center-dense-cooperative-heightfield",
    preparation: Object.freeze(publicPreparation(preparation)),
    sampling: "nonlinear-center-dense",
    terraces: canonicalTerraceDefinitions().map((terrace2) => terrace2.id)
  });
}
function publicPreparation(preparation) {
  const { startedAt, ...publicValue } = preparation;
  return publicValue;
}
function browserYield2() {
  if (typeof globalThis.scheduler?.yield === "function") return globalThis.scheduler.yield();
  return new Promise((resolve) => setTimeout(resolve, 0));
}
function now() {
  return globalThis.performance?.now?.() ?? Date.now();
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/TerrainGeometry.js
var DEFAULT_TERRAIN_SIZE = 540;
var DEFAULT_TERRAIN_STEPS = 128;
var terrainHeightAt = canonicalTerrainHeightAt;
var terrainZoneAt = canonicalTerrainZoneAt;
async function createTerrainGeometryAsync(size = DEFAULT_TERRAIN_SIZE, steps = DEFAULT_TERRAIN_STEPS, options = {}) {
  const startedAt = now2();
  const state = createSamplingState(size, steps);
  const yieldEvery = boundedInteger(options.yieldEvery, 64, 16, 512);
  const yieldWork = options.yieldWork || yieldToBrowser;
  let yields = 0;
  for (let index = 0; index < state.total; index += 1) {
    sampleVertex(state, index);
    if ((index + 1) % yieldEvery !== 0 || index + 1 === state.total) continue;
    yields += 1;
    if (yields % 6 === 0) options.onProgress?.(index + 1, state.total);
    await yieldWork();
  }
  options.onProgress?.(state.total, state.total);
  await yieldWork();
  return finishTerrainGeometryAsync(state, {
    milliseconds: 0,
    mode: "cooperative",
    startedAt,
    yieldEvery,
    yields: yields + 1
  }, terrainCoordinateAt, {
    onPhase: options.onPhase,
    yieldWork
  });
}
function terrainCoordinateAt(index, steps, half) {
  const normalized3 = index / steps * 2 - 1;
  const absolute = Math.abs(normalized3);
  const centerDense = absolute * 0.32 + Math.pow(absolute, 1.72) * 0.68;
  return Math.sign(normalized3) * centerDense * half;
}
function createSamplingState(size, steps) {
  return {
    half: size / 2,
    size,
    steps,
    total: (steps + 1) * (steps + 1),
    uvs: [],
    vertices: [],
    zones: []
  };
}
function sampleVertex(state, index) {
  const rowSize = state.steps + 1;
  const xIndex = index % rowSize;
  const zIndex = Math.floor(index / rowSize);
  const x = terrainCoordinateAt(xIndex, state.steps, state.half);
  const z = terrainCoordinateAt(zIndex, state.steps, state.half);
  const height = terrainHeightAt(x, z);
  state.vertices.push(v(x, height, z));
  state.uvs.push(xIndex / state.steps, zIndex / state.steps);
  state.zones.push(terrainZoneAt(x, z, height));
}
function boundedInteger(value, fallback, minimum, maximum) {
  const resolved = Number.isFinite(Number(value)) ? Number(value) : fallback;
  return Math.max(minimum, Math.min(maximum, Math.floor(resolved)));
}
function yieldToBrowser() {
  if (typeof globalThis.scheduler?.yield === "function") return globalThis.scheduler.yield();
  return new Promise((resolve) => setTimeout(resolve, 0));
}
function now2() {
  return globalThis.performance?.now?.() ?? Date.now();
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/TerrainStats.js
function createTerrainStats({ terrain, road: road2, roadColliders, obstacleColliders, obstacles, grassImage, sampler }) {
  const repeat = terrainRepeat(terrain.size, grassImage);
  const pixels = textureSize(grassImage);
  return {
    terrainTriangles: terrain.colliders.length,
    terrainSize: terrain.size,
    terrainSteps: terrain.steps,
    roadTriangles: roadColliders.length,
    obstacleTriangles: obstacleColliders.length,
    obstacles: obstacles.length,
    proceduralSource: `${PROCEDURAL_SOURCE} + shared static collision geometry`,
    grassUrl: grassImage?.src || null,
    grassRepeat: repeat,
    dirtRepeat: null,
    repeatMode: "mirror-pingpong",
    groundSampler: sampler?.stats?.().mode || "terrain-height-phase-one",
    mixShader: "disabled-grass-only",
    grassPixels: pixels,
    texelsPerWorld: REPEAT_HOOKS.terrainTexelsPerWorld,
    textureWorldSize: [
      pixels.w / REPEAT_HOOKS.terrainTexelsPerWorld,
      pixels.h / REPEAT_HOOKS.terrainTexelsPerWorld
    ],
    road: {
      id: road2.visual.id,
      colliders: roadColliders.length,
      segments: road2.stats.visualSegments,
      anchors: road2.anchors,
      walkable: true,
      ...road2.stats
    },
    houseStats: { houses: obstacles.userData?.houses || [] },
    stairStats: obstacles.userData?.stairs || [],
    stairLayouts: obstacles.userData?.stairLayouts || [],
    mezuzaStats: { items: obstacles.userData?.mezuzahs || [] },
    roomStats: obstacles.userData?.rooms || []
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/TerrainPackageStatistics.js
function createTerrainPackageStats(options) {
  const stats = createTerrainStats({
    terrain: options.terrain,
    road: options.road,
    roadColliders: options.roadColliders,
    obstacleColliders: options.occupiedColliders,
    obstacles: options.obstacles,
    grassImage: options.grassImage,
    sampler: options.groundSampler
  });
  stats.terrainMix = {
    grassAndDirt: Boolean(options.grassImage && options.dirtImage),
    sameRepeat: true,
    patchShader: "world-space-mix()"
  };
  stats.forestStats = options.forest.stats;
  stats.village = options.village.stats;
  stats.textLandmark = options.textLandmark.stats;
  return stats;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/TerrainPackageColliders.js
async function collectPrimitiveColliders(definitions, options = {}) {
  const colliders = [];
  const yieldWork = options.yieldWork || browserYield3;
  for (let index = 0; index < definitions.length; index += 1) {
    colliders.push(...primitiveColliders(definitions[index]));
    if ((index + 1) % 8 !== 0) continue;
    options.onProgress?.({
      message: "Preparing village collision\u2026",
      progress: options.progress || 0.86
    });
    await yieldWork();
  }
  return colliders;
}
function browserYield3() {
  if (typeof globalThis.scheduler?.yield === "function") return globalThis.scheduler.yield();
  return new Promise((resolve) => setTimeout(resolve, 0));
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/TerrainQualitySteps.js
function terrainStepsForQuality(quality = "medium") {
  const normalized3 = String(quality).toLowerCase();
  if (normalized3 === "ultra") return 88;
  if (normalized3 === "high") return 80;
  if (normalized3 === "low") return 48;
  return 64;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/TerrainTextureCatalog.js
var GRASS_URLS = Object.freeze([
  highestResolutionSurface("baseGrass"),
  TEXTURE_URLS.terrain.grass4,
  TEXTURE_URLS.terrain.grass5
]);
var DIRT_URLS = Object.freeze([
  highestResolutionSurface("dirt"),
  TEXTURE_URLS.terrain.dirt1,
  TEXTURE_URLS.terrain.dirt5
]);
var REAL_GRASS_URL = GRASS_URLS[0];

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/TerrainSignTextureStreaming.js
async function startVillageSignTextureStreaming(options = {}) {
  await visibleFrames(options.frames ?? 2, options.environment || globalThis);
  try {
    const { preloadVillageSignTextures } = await import("./VillageSignTexture-LYPYED2W.js");
    return preloadVillageSignTextures();
  } catch (error) {
    console.warn("[MitzvahWorld] Village sign textures degraded.", error);
    return { error: error?.message || String(error), status: "degraded" };
  }
}
async function visibleFrames(count, environment) {
  for (let index = 0; index < count; index += 1) {
    await new Promise((resolve) => {
      environment.requestAnimationFrame?.(() => resolve()) ?? environment.setTimeout?.(resolve, 0) ?? resolve();
    });
  }
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageGroundSampling.js
function villageGroundHeight(groundSampler, x, z) {
  if (typeof groundSampler === "function") return groundSampler(x, z);
  if (typeof groundSampler?.heightAt === "function") {
    const sample = groundSampler.heightAt(x, z);
    if (Number.isFinite(sample?.y)) return sample.y;
  }
  throw new TypeError("Village ground sampler must be a function or expose heightAt(x, z).");
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageWorldBudget.js
var VILLAGE_WORLD_BUDGETS = Object.freeze({
  low: budget(10, 96, 120, 10, 9e3, 140),
  medium: budget(10, 180, 170, 18, 18e3, 200),
  high: budget(10, 270, 260, 28, 36e3, 280),
  cinematic: budget(10, 370, 360, 40, 56e3, 360)
});
function villageWorldBudget(name = "high") {
  return VILLAGE_WORLD_BUDGETS[name] || VILLAGE_WORLD_BUDGETS.high;
}
function budget(districts, botanicalPlacements, architecturePieces, creatures, triangles, radius) {
  return Object.freeze({
    architecturePieces,
    botanicalPlacements,
    creatures,
    districts,
    radius,
    triangles
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/creatures/AnimalGeometryParts.js
function animalBodyProfile(visual, bodyY) {
  const half = visual.length * 0.5;
  return [
    section(-half, bodyY, visual.height * 0.25, visual.width * 0.62),
    section(-half * 0.55, bodyY + visual.height * 0.05, visual.height * 0.42, visual.width),
    section(0, bodyY + visual.height * 0.08, visual.height * 0.46, visual.width * 1.08),
    section(half * 0.55, bodyY + visual.height * 0.04, visual.height * 0.4, visual.width * 0.94),
    section(half, bodyY + visual.height * 0.11, visual.height * 0.24, visual.width * 0.5)
  ];
}
function animalHeadProfile(visual, bodyY) {
  const start = visual.length * 0.34;
  const headY = bodyY + visual.height * 0.35;
  return [
    section(start, bodyY + visual.height * 0.1, visual.height * 0.2, visual.width * 0.38),
    section(start + visual.length * 0.16, headY, visual.height * 0.28, visual.width * 0.48),
    section(start + visual.length * 0.34, headY + visual.height * 0.03, visual.height * 0.23, visual.width * 0.42),
    section(start + visual.length * 0.49, headY - visual.height * 0.05, visual.height * 0.15, visual.width * 0.31)
  ];
}
function appendAnimalLimbs(builder, visual, bodyY, segments) {
  const legX = visual.length * 0.31;
  const legZ = visual.width * 0.55;
  for (const x of [-legX, legX]) {
    for (const z of [-legZ, legZ]) {
      builder.addLimb(
        [x, bodyY - visual.height * 0.17, z],
        [x + visual.length * 0.03, 0, z * 0.92],
        visual.width * 0.14,
        visual.width * 0.1,
        Math.max(6, segments - 4)
      );
    }
  }
}
function appendAnimalFeatures(builder, visual, bodyY) {
  appendTail(builder, visual, bodyY);
  appendEars(builder, visual, bodyY);
  if (!visual.kosherEligible) return;
  appendHorns(builder, visual, bodyY);
  if (visual.id === "deer") appendAntlerBranches(builder, visual, bodyY);
}
function appendTail(builder, visual, y) {
  builder.addLimb(
    [-visual.length * 0.48, y + visual.height * 0.12, 0],
    [-visual.length * 0.83, y + visual.height * 0.02, visual.width * 0.08],
    visual.width * 0.11,
    visual.width * 0.04,
    7
  );
}
function appendEars(builder, visual, y) {
  const x = visual.length * 0.7;
  for (const side of [-1, 1]) {
    builder.addLimb(
      [x, y + visual.height * 0.56, side * visual.width * 0.25],
      [x - visual.length * 0.04, y + visual.height * 0.68, side * visual.width * 0.57],
      visual.width * 0.09,
      visual.width * 0.025,
      6
    );
  }
}
function appendHorns(builder, visual, y) {
  const x = visual.length * 0.62;
  for (const side of [-1, 1]) {
    builder.addLimb(
      [x, y + visual.height * 0.58, side * visual.width * 0.2],
      [x - visual.length * 0.12, y + visual.height * 0.85, side * visual.width * 0.34],
      visual.width * 0.07,
      0.01,
      6
    );
  }
}
function appendAntlerBranches(builder, visual, y) {
  const x = visual.length * 0.5;
  for (const side of [-1, 1]) {
    builder.addLimb(
      [x, y + visual.height * 0.75, side * visual.width * 0.28],
      [x - visual.length * 0.18, y + visual.height, side * visual.width * 0.48],
      visual.width * 0.04,
      8e-3,
      5
    );
  }
}
function section(x, y, radiusY, radiusZ) {
  return { radiusY, radiusZ, x, y, z: 0 };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/creatures/CreatureVectorMath.js
function addVector(left, right) {
  return left.map((value, index) => value + right[index]);
}
function subtractVector(left, right) {
  return left.map((value, index) => value - right[index]);
}
function scaleVector(vector2, amount) {
  return vector2.map((value) => value * amount);
}
function crossVector(left, right) {
  return [
    left[1] * right[2] - left[2] * right[1],
    left[2] * right[0] - left[0] * right[2],
    left[0] * right[1] - left[1] * right[0]
  ];
}
function normalizeVector(vector2) {
  const length3 = Math.hypot(...vector2) || 1;
  return scaleVector(vector2, 1 / length3);
}
function averageVectors(points) {
  return points[0].map((_, index) => points.reduce((sum, point3) => sum + point3[index], 0) / points.length);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/creatures/ManualGeometryBuilder.js
var ManualGeometryBuilder = class {
  constructor() {
    this.indices = [];
    this.vertices = [];
  }
  addLoft(profile, segments = 10) {
    const rings = profile.map((section3) => this.addRing(section3, segments));
    for (let ring = 0; ring < rings.length - 1; ring += 1) {
      this.connectRings(rings[ring], rings[ring + 1]);
    }
    this.capRing(rings[0], true);
    this.capRing(rings.at(-1), false);
    return this;
  }
  addLimb(start, end, startRadius, endRadius, segments = 8) {
    const axis = normalizeVector(subtractVector(end, start));
    const helper = Math.abs(axis[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    const tangent = normalizeVector(crossVector(axis, helper));
    const bitangent = normalizeVector(crossVector(axis, tangent));
    const first = this.addOrientedRing(start, startRadius, tangent, bitangent, segments);
    const second = this.addOrientedRing(end, endRadius, tangent, bitangent, segments);
    this.connectRings(first, second);
    this.capRing(first, true);
    this.capRing(second, false);
    return this;
  }
  addRing(section3, segments) {
    const indices = [];
    for (let segment2 = 0; segment2 < segments; segment2 += 1) {
      const angle = segment2 / segments * Math.PI * 2;
      indices.push(this.vertex([
        section3.x,
        section3.y + Math.cos(angle) * section3.radiusY,
        section3.z + Math.sin(angle) * section3.radiusZ
      ]));
    }
    return indices;
  }
  addOrientedRing(center, radius, tangent, bitangent, segments) {
    const indices = [];
    for (let segment2 = 0; segment2 < segments; segment2 += 1) {
      const angle = segment2 / segments * Math.PI * 2;
      const offset = addVector(
        scaleVector(tangent, Math.cos(angle) * radius),
        scaleVector(bitangent, Math.sin(angle) * radius)
      );
      indices.push(this.vertex(addVector(center, offset)));
    }
    return indices;
  }
  connectRings(first, second) {
    for (let index = 0; index < first.length; index += 1) {
      const next = (index + 1) % first.length;
      this.indices.push(first[index], second[next], second[index]);
      this.indices.push(first[index], first[next], second[next]);
    }
  }
  capRing(ring, reverse) {
    const centerIndex = this.vertex(averageVectors(
      ring.map((index) => this.vertices[index])
    ));
    for (let index = 0; index < ring.length; index += 1) {
      const next = (index + 1) % ring.length;
      this.indices.push(...reverse ? [centerIndex, ring[next], ring[index]] : [centerIndex, ring[index], ring[next]]);
    }
  }
  vertex(point3) {
    this.vertices.push(point3);
    return this.vertices.length - 1;
  }
  build() {
    return {
      indices: [...this.indices],
      vertices: this.vertices.map((point3) => [...point3])
    };
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/creatures/LoftedAnimalGeometry.js
function createLoftedAnimalGeometry(visual, quality = "medium") {
  const builder = new ManualGeometryBuilder();
  const segments = qualitySegments(quality);
  const bodyY = visual.height * 0.72;
  builder.addLoft(animalBodyProfile(visual, bodyY), segments);
  builder.addLoft(animalHeadProfile(visual, bodyY), Math.max(8, segments - 2));
  appendAnimalLimbs(builder, visual, bodyY, segments);
  appendAnimalFeatures(builder, visual, bodyY);
  return builder.build();
}
function qualitySegments(quality) {
  if (quality === "high") return 14;
  if (quality === "low") return 8;
  return 10;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/creatures/LoftedSpiritGeometry.js
function createLoftedSpiritGeometry(visual, quality = "medium") {
  const builder = new ManualGeometryBuilder();
  const segments = quality === "high" ? 14 : quality === "low" ? 8 : 10;
  builder.addLoft(mantleProfile(visual), segments);
  appendArms(builder, visual);
  appendWings(builder, visual);
  appendCrown(builder, visual);
  return {
    geometry: builder.build(),
    rotation: { x: 0, y: 0, z: Math.PI / 2 }
  };
}
function mantleProfile(visual) {
  const half = visual.height * 0.5;
  return [
    section2(-half, 0, visual.width * 0.48, visual.width * 0.48),
    section2(-half * 0.45, 0, visual.width * 0.72, visual.width * 0.52),
    section2(0, 0, visual.width * 0.55, visual.width * 0.42),
    section2(half * 0.42, 0, visual.width * 0.43, visual.width * 0.36),
    section2(half, 0, visual.width * 0.28, visual.width * 0.28)
  ];
}
function appendArms(builder, visual) {
  for (const side of [-1, 1]) {
    builder.addLimb(
      [visual.height * 0.08, side * visual.width * 0.32, 0],
      [visual.height * 0.22, side * visual.width * 1.12, visual.width * 0.1],
      visual.width * 0.15,
      visual.width * 0.05,
      7
    );
  }
}
function appendWings(builder, visual) {
  for (const side of [-1, 1]) {
    builder.addLimb(
      [-visual.height * 0.08, 0, side * visual.width * 0.22],
      [visual.height * 0.12, visual.width * 0.24, side * visual.width * 1.4],
      visual.width * 0.18,
      visual.width * 0.03,
      8
    );
    builder.addLimb(
      [visual.height * 0.1, visual.width * 0.2, side * visual.width * 1.34],
      [-visual.height * 0.22, -visual.width * 0.08, side * visual.width * 1.62],
      visual.width * 0.1,
      visual.width * 0.02,
      6
    );
  }
}
function appendCrown(builder, visual) {
  for (const side of [-1, 1]) {
    builder.addLimb(
      [visual.height * 0.42, side * visual.width * 0.15, 0],
      [visual.height * 0.72, side * visual.width * 0.38, 0],
      visual.width * 0.07,
      0.01,
      6
    );
  }
}
function section2(x, y, radiusY, radiusZ) {
  return { radiusY, radiusZ, x, y, z: 0 };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/creatures/CreatureVisualCatalog.js
var CREATURE_VISUALS = Object.freeze({
  "cow": animal("cow", "#6b4936", 2.4, 1.35, 0.72, true),
  "deer": animal("deer", "#a06b3d", 1.8, 1.25, 0.46, true),
  "goat": animal("goat", "#d8d2c4", 1.35, 0.95, 0.42, true),
  "sheep": animal("sheep", "#ede5d3", 1.45, 1, 0.48, true),
  "chicken": animal("chicken", "#d6a044", 0.62, 0.7, 0.3, false),
  "fox": animal("fox", "#b95d2d", 1.2, 0.62, 0.32, false),
  "wolf": animal("wolf", "#62666e", 1.5, 0.82, 0.38, false),
  "dybbuk-shade": spirit("dybbuk-shade", "#5a4775", 1.15, 2.2),
  "fallen-seraph-husk": spirit("fallen-seraph-husk", "#715040", 1.45, 2.7),
  "klipah-guardian": spirit("klipah-guardian", "#3b4540", 1.8, 2.5),
  "spark-wisp": spirit("spark-wisp", "#ffd76a", 0.42, 0.9)
});
function creatureVisual(speciesId) {
  const visual = CREATURE_VISUALS[speciesId];
  if (!visual) throw new Error(`Unknown creature visual: ${speciesId}`);
  return visual;
}
function animal(id, color, length3, height, width, kosherEligible) {
  return Object.freeze({
    color,
    height,
    id,
    kind: "animal",
    kosherEligible,
    length: length3,
    width
  });
}
function spirit(id, color, width, height) {
  return Object.freeze({
    color,
    height,
    id,
    kind: "spirit",
    kosherEligible: false,
    length: width,
    width
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/creatures/ProceduralCreatureBuilder.js
function createProceduralCreatureDefinitions(options) {
  const visual = creatureVisual(options.speciesId);
  const quality = options.quality || "medium";
  const generated = visual.kind === "animal" ? { geometry: createLoftedAnimalGeometry(visual, quality), rotation: null } : createLoftedSpiritGeometry(visual, quality);
  return [definition(options, visual, generated)];
}
function definition(options, visual, generated) {
  return {
    ...generated.geometry,
    color: visual.color,
    doubleSided: visual.kind === "spirit",
    id: `Awtsmoos_creature_${options.id}_lofted`,
    position: options.position,
    rotation: generated.rotation || void 0,
    shape: "manual",
    solid: visual.kind === "animal",
    textureUrl: visual.kind === "animal" ? TEXTURE_URLS.terrain.tilledSoil : TEXTURE_URLS.stone.cobblestone,
    userData: {
      AwtsmoosLod: {
        className: "creature",
        quality: options.quality || "medium"
      },
      creatureId: options.id,
      family: "procedural-lofted-creature",
      speciesId: options.speciesId
    }
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/creatures/VillageCreatureSystem.js
var STATIC_PLACEMENTS = Object.freeze([
  placement("sheep-1", "sheep", 108, 38),
  placement("sheep-2", "sheep", 121, 47),
  placement("goat-1", "goat", 128, 32),
  placement("cow-1", "cow", 96, 52),
  placement("deer-1", "deer", 76, -72),
  placement("chicken-1", "chicken", -49, 19),
  placement("fox-1", "fox", 88, -94),
  placement("wolf-1", "wolf", 30, -124)
]);
var LIVE_HOSTILE_SLOTS = Object.freeze([
  "dybbuk-shade",
  "klipah-guardian",
  "fallen-seraph-husk"
]);
function createVillageCreatureDefinitions(groundSampler, quality = "high") {
  const budget3 = villageWorldBudget(quality);
  const staticLimit = Math.max(0, budget3.creatures - LIVE_HOSTILE_SLOTS.length);
  const placements = STATIC_PLACEMENTS.slice(0, staticLimit);
  const geometryQuality = creatureGeometryQuality(quality);
  const definitions = placements.flatMap((item) => createProceduralCreatureDefinitions({
    id: item.id,
    position: {
      x: item.x,
      y: villageGroundHeight(groundSampler, item.x, item.z),
      z: item.z
    },
    quality: geometryQuality,
    speciesId: item.speciesId
  }));
  definitions.stats = {
    creatures: placements.length,
    definitions: definitions.length,
    liveHostiles: LIVE_HOSTILE_SLOTS.length,
    quality,
    species: new Set(placements.map((item) => item.speciesId)).size,
    totalActors: placements.length + LIVE_HOSTILE_SLOTS.length,
    triangles: definitions.reduce((sum, item) => sum + item.indices.length / 3, 0)
  };
  return definitions;
}
function creatureGeometryQuality(quality) {
  if (quality === "cinematic") return "high";
  if (quality === "low") return "low";
  return "medium";
}
function placement(id, speciesId, x, z) {
  return Object.freeze({ id, speciesId, x, z });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/assets/ForestMaterialCatalog.js
var FOREST_MATERIALS = Object.freeze({
  bark: TEXTURE_URLS.wood.bark1,
  broadleaf: TEXTURE_URLS.leaves.chaiOak,
  fern: TEXTURE_URLS.leaves.chaiAsh,
  forestFloorDark: TEXTURE_URLS.terrain.darkForestFloor,
  forestFloorLeaves: TEXTURE_URLS.terrain.forestLeaves,
  marsh: TEXTURE_URLS.terrain.marshGrass,
  moss: TEXTURE_URLS.terrain.grass8,
  mud: TEXTURE_URLS.terrain.mud,
  pine: TEXTURE_URLS.leaves.chaiPine,
  roots: TEXTURE_URLS.wood.bark1,
  shallowWater: TEXTURE_URLS.water.shallowRiver
});
var FOREST_MATERIAL_EVIDENCE = Object.freeze({
  literalUndergrowthFilenameFound: false,
  policy: "Use verified Firebase forest-floor and leaf materials rather than inventing an unavailable filename.",
  publicFirebase: true
});

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageBoxBatch.js
var DEFAULT_TILE_WORLD = 4;
var DEFAULT_TEXELS_PER_WORLD = 96;
function createVillageBoxBatch(id, boxes, options) {
  const tileWorld = positive5(options.texturePolicy?.tileWorld, DEFAULT_TILE_WORLD);
  const geometry = batchGeometry(boxes, tileWorld);
  return {
    ...geometry,
    color: options.color,
    id: `Awtsmoos_${id}`,
    mapRepeat: options.mapRepeat || [1, 1],
    noEdge: true,
    position: { x: 0, y: 0, z: 0 },
    shape: "manual",
    solid: false,
    texturePolicy: {
      batchedVillageDetail: true,
      nativeTexelDensity: true,
      publicFirebase: true,
      texelsPerWorld: DEFAULT_TEXELS_PER_WORLD,
      tileWorld,
      ...options.texturePolicy || {}
    },
    textureUrl: options.textureUrl,
    userData: {
      family: options.family,
      instances: boxes.length,
      part: options.part
    }
  };
}
function batchGeometry(boxes, tileWorld) {
  const vertices = [];
  const uvs = [];
  const indices = [];
  for (const box7 of boxes) appendBox(vertices, uvs, indices, box7, tileWorld);
  return { indices, uvs, vertices };
}
function appendBox(vertices, uvs, indices, box7, tile) {
  const half = {
    x: box7.size.x / 2,
    y: box7.size.y / 2,
    z: box7.size.z / 2
  };
  appendFace2(vertices, uvs, indices, box7, [
    [-half.x, -half.y, half.z],
    [half.x, -half.y, half.z],
    [half.x, half.y, half.z],
    [-half.x, half.y, half.z]
  ], box7.size.x / tile, box7.size.y / tile);
  appendFace2(vertices, uvs, indices, box7, [
    [half.x, -half.y, -half.z],
    [-half.x, -half.y, -half.z],
    [-half.x, half.y, -half.z],
    [half.x, half.y, -half.z]
  ], box7.size.x / tile, box7.size.y / tile);
  appendFace2(vertices, uvs, indices, box7, [
    [-half.x, -half.y, -half.z],
    [-half.x, -half.y, half.z],
    [-half.x, half.y, half.z],
    [-half.x, half.y, -half.z]
  ], box7.size.z / tile, box7.size.y / tile);
  appendFace2(vertices, uvs, indices, box7, [
    [half.x, -half.y, half.z],
    [half.x, -half.y, -half.z],
    [half.x, half.y, -half.z],
    [half.x, half.y, half.z]
  ], box7.size.z / tile, box7.size.y / tile);
  appendFace2(vertices, uvs, indices, box7, [
    [-half.x, half.y, half.z],
    [half.x, half.y, half.z],
    [half.x, half.y, -half.z],
    [-half.x, half.y, -half.z]
  ], box7.size.x / tile, box7.size.z / tile);
  appendFace2(vertices, uvs, indices, box7, [
    [-half.x, -half.y, -half.z],
    [half.x, -half.y, -half.z],
    [half.x, -half.y, half.z],
    [-half.x, -half.y, half.z]
  ], box7.size.x / tile, box7.size.z / tile);
}
function appendFace2(vertices, uvs, indices, box7, corners, uSpan, vSpan) {
  const first = vertices.length;
  const faceUvs = [[0, 0], [uSpan, 0], [uSpan, vSpan], [0, vSpan]];
  for (let index = 0; index < corners.length; index += 1) {
    vertices.push(worldPoint2(corners[index], box7));
    uvs.push(...faceUvs[index]);
  }
  indices.push(first, first + 1, first + 2, first, first + 2, first + 3);
}
function worldPoint2(corner, box7) {
  const yaw = box7.yaw || 0;
  const cosine = Math.cos(yaw);
  const sine = Math.sin(yaw);
  return [
    box7.position.x + corner[0] * cosine + corner[2] * sine,
    box7.position.y + corner[1],
    box7.position.z - corner[0] * sine + corner[2] * cosine
  ];
}
function positive5(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/forest/ForestEdgeSystem.js
var TREE_POINTS = Object.freeze(Array.from({ length: 34 }, (_, index) => {
  const column = index % 7;
  const row = Math.floor(index / 7);
  return [
    64 + column * 13 + Math.sin(index * 2.1) * 5,
    -78 - row * 18 + Math.cos(index) * 6
  ];
}));
var FLOOR_PATCHES = Object.freeze([
  [82, -104, 56, 62],
  [119, -104, 42, 62],
  [81, -146, 54, 36],
  [122, -146, 46, 36]
]);
var LOG_POINTS = Object.freeze([
  [77, -105],
  [87, -118],
  [104, -132],
  [118, -101],
  [129, -145],
  [73, -151]
]);
function createForestEdgeDefinitions(groundSampler, quality = "high") {
  const treeLimit = quality === "low" ? 14 : quality === "medium" ? 24 : TREE_POINTS.length;
  const parts = { ferns: [], logs: [], moss: [] };
  TREE_POINTS.slice(0, treeLimit).forEach((point3, index) => {
    appendTree(parts, point3, index, groundSampler);
  });
  LOG_POINTS.slice(0, quality === "low" ? 2 : LOG_POINTS.length).forEach((point3) => {
    appendLog(parts, point3, groundSampler);
  });
  const definitions = [
    ...floorDefinitions(groundSampler, quality),
    batch("forest-ferns", parts.ferns, "#4f7948", FOREST_MATERIALS.fern, "undergrowth"),
    batch("forest-moss", parts.moss, "#638154", FOREST_MATERIALS.moss, "undergrowth"),
    batch("forest-fallen-logs", parts.logs, "#684d37", FOREST_MATERIALS.roots, "fallen-wood")
  ].filter(Boolean);
  definitions.stats = {
    definitions: definitions.length,
    fallenLogs: parts.logs.length,
    floorPatches: quality === "low" ? 2 : FLOOR_PATCHES.length,
    forestRadius: 160,
    primitiveTrees: 0,
    proceduralTreeSitesSupported: treeLimit,
    undergrowthClusters: parts.ferns.length + parts.moss.length
  };
  return definitions;
}
function floorDefinitions(groundSampler, quality) {
  const count = quality === "low" ? 2 : FLOOR_PATCHES.length;
  return FLOOR_PATCHES.slice(0, count).map((patch2, index) => {
    const [x, z, width, depth] = patch2;
    return {
      color: index % 2 ? "#394631" : "#45402f",
      id: `Awtsmoos_forest_floor_${index}`,
      mapRepeat: [8, 8],
      position: { x, y: villageGroundHeight(groundSampler, x, z) + 0.02, z },
      shape: "box",
      size: { x: width, y: 0.05, z: depth },
      solid: false,
      texturePolicy: { forestUndergrowth: true, publicFirebase: true, tileWorld: 5 },
      textureUrl: index % 2 ? FOREST_MATERIALS.forestFloorLeaves : FOREST_MATERIALS.forestFloorDark,
      userData: { family: "reference-forest-edge", part: "forest-floor" }
    };
  });
}
function appendTree(parts, point3, index, groundSampler) {
  const [x, z] = point3;
  const y = villageGroundHeight(groundSampler, x, z);
  parts.ferns.push(box(x + Math.sin(index) * 2, y + 0.32, z + Math.cos(index) * 2, 2.4, 0.6, 2.4));
  parts.moss.push(box(x - Math.cos(index) * 1.7, y + 0.09, z + Math.sin(index) * 1.7, 2.8, 0.16, 2.8));
}
function appendLog(parts, point3, groundSampler) {
  const [x, z] = point3;
  const y = villageGroundHeight(groundSampler, x, z);
  parts.logs.push({
    position: { x, y: y + 0.28, z },
    size: { x: 3.8, y: 0.55, z: 0.65 },
    yaw: 0.35
  });
}
function batch(id, boxes, color, textureUrl, part4) {
  if (!boxes.length) return null;
  return createVillageBoxBatch(id, boxes, {
    color,
    family: "reference-forest-edge",
    part: part4,
    texturePolicy: { forestUndergrowth: true },
    textureUrl
  });
}
function box(x, y, z, sx, sy, sz) {
  return {
    position: { x, y, z },
    size: { x: sx, y: sy, z: sz },
    yaw: 0
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/lighting/ReferenceGoldenHourPreset.js
var REFERENCE_GOLDEN_HOUR = Object.freeze({
  cloudColor: Object.freeze([0.86, 0.72, 0.58, 0.2]),
  coolShadow: Object.freeze([0.35, 0.48, 0.62, 1]),
  horizonColor: Object.freeze([0.95, 0.62, 0.28, 0.24]),
  lampColor: "#ffd477",
  sunCore: Object.freeze([1, 0.97, 0.82, 1]),
  sunGlow: Object.freeze([1, 0.55, 0.12, 0.34]),
  sunPosition: Object.freeze([-132, 92, -210]),
  warmStone: "#c29a68",
  windowColor: "#ffcb69"
});
var REFERENCE_LIGHTING_BUDGETS = Object.freeze({
  low: budget2(2, 3, 3, 8),
  medium: budget2(3, 5, 3, 12),
  high: budget2(5, 8, 3, 16),
  cinematic: budget2(9, 14, 4, 24)
});
function referenceLightingBudget(quality = "high") {
  return REFERENCE_LIGHTING_BUDGETS[quality] || REFERENCE_LIGHTING_BUDGETS.high;
}
function budget2(sunShafts, clouds, mountainBelts, practicalLamps) {
  return Object.freeze({ clouds, mountainBelts, practicalLamps, sunShafts });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/AtmosphericMountainGeometry.js?v=20260720-canonical-valley-pass-04
function mountainGeometry(options, beltIndex) {
  const geometry = emptyGeometry();
  for (let segment2 = 0; segment2 < options.segments; segment2 += 1) {
    const angle = segment2 / options.segments * Math.PI * 2;
    const wave = ridgeWave(segment2, beltIndex);
    appendVertex(geometry, angle, options.radius, -10, segment2, options.segments);
    appendVertex(
      geometry,
      angle,
      options.radius + options.depth * 0.16,
      options.height * 0.34 * shoulderWave(segment2, beltIndex),
      segment2,
      options.segments
    );
    appendVertex(
      geometry,
      angle,
      options.radius + options.depth * 0.52,
      options.height * wave,
      segment2,
      options.segments
    );
    appendVertex(
      geometry,
      angle,
      options.radius + options.depth,
      -18,
      segment2,
      options.segments
    );
  }
  connectRows(geometry.indices, options.segments, 4, 0, 1);
  connectRows(geometry.indices, options.segments, 4, 1, 2);
  connectRows(geometry.indices, options.segments, 4, 2, 3);
  geometry.zones = geometry.vertices.map(() => [0, 0, 0, 1]);
  return geometry;
}
function snowGeometry(options, beltIndex) {
  const geometry = emptyGeometry();
  for (let segment2 = 0; segment2 < options.segments; segment2 += 1) {
    const angle = segment2 / options.segments * Math.PI * 2;
    const wave = ridgeWave(segment2, beltIndex);
    appendVertex(geometry, angle, options.radius + options.depth * 0.39, options.height * wave * 0.84, segment2, options.segments);
    appendVertex(geometry, angle, options.radius + options.depth * 0.48, options.height * wave + 0.8, segment2, options.segments);
    appendVertex(geometry, angle, options.radius + options.depth * 0.57, options.height * wave * 0.83, segment2, options.segments);
  }
  connectRows(geometry.indices, options.segments, 3, 0, 1);
  connectRows(geometry.indices, options.segments, 3, 1, 2);
  geometry.zones = geometry.vertices.map(() => [0, 0, 0, 1]);
  return geometry;
}
function connectRows(indices, segments, stride, lower, upper) {
  for (let segment2 = 0; segment2 < segments; segment2 += 1) {
    const next = (segment2 + 1) % segments;
    const a = segment2 * stride + lower;
    const b = next * stride + lower;
    const c = segment2 * stride + upper;
    const d = next * stride + upper;
    indices.push(a, b, c, b, d, c);
  }
}
function appendVertex(geometry, angle, radius, y, segment2, segments) {
  geometry.vertices.push([Math.cos(angle) * radius, y, Math.sin(angle) * radius]);
  geometry.uvs.push(segment2 / segments * 8, y / 120 + 0.5);
}
function ridgeWave(segment2, beltIndex) {
  const broad = Math.sin(segment2 * 0.17 + beltIndex * 1.9) * 0.16;
  const ridge = Math.abs(Math.sin(segment2 * 0.43 + beltIndex * 0.71)) ** 1.7 * 0.23;
  const broken = Math.sin(segment2 * 1.31 + beltIndex * 2.3) * 0.075;
  return 0.48 + broad + ridge + broken;
}
function shoulderWave(segment2, beltIndex) {
  return 0.56 + Math.sin(segment2 * 0.21 + beltIndex) * 0.12 + Math.sin(segment2 * 0.67 + beltIndex * 0.4) * 0.07;
}
function emptyGeometry() {
  return { indices: [], uvs: [], vertices: [], zones: [] };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/AtmosphericMountainSystem.js?v=20260720-canonical-valley-pass-04
var MOUNTAIN_STACK = mountainRockStack();
var BELTS = Object.freeze([
  belt(390, 188, 142, "#34433d", 152),
  belt(590, 254, 126, "#3f5260", 128),
  belt(820, 318, 110, "#52677a", 104),
  belt(1120, 382, 96, "#6c7d91", 88)
]);
function createAtmosphericMountainDefinitions(quality = "high") {
  const count = referenceLightingBudget(quality).mountainBelts;
  const definitions = [];
  for (const [index, options] of BELTS.slice(0, count).entries()) {
    definitions.push(mountainDefinition(options, index, quality));
    definitions.push(snowDefinition(options, index, quality));
  }
  definitions.stats = {
    belts: count,
    definitions: definitions.length,
    logicalMaterialLayers: MOUNTAIN_STACK.logicalLayerCount,
    nearestRadius: BELTS[0].radius,
    snowCaps: count,
    triangles: definitions.reduce((sum, item) => sum + item.indices.length / 3, 0)
  };
  return definitions;
}
function mountainDefinition(options, index, quality) {
  return definition2(
    `Awtsmoos_atmospheric_mountain_belt_${index}`,
    mountainGeometry(options, index),
    options.color,
    "reference-atmospheric-mountains",
    quality,
    index
  );
}
function snowDefinition(options, index, quality) {
  return definition2(
    `Awtsmoos_atmospheric_mountain_snow_${index}`,
    snowGeometry(options, index),
    index === 0 ? "#b8c2c3" : "#c6d0da",
    "reference-atmospheric-mountain-snow",
    quality,
    index
  );
}
function definition2(id, geometry, color, family2, quality, depth) {
  const primary = MOUNTAIN_STACK.layers[0];
  return bindMaterialStack({
    ...geometry,
    backfaceCull: true,
    color,
    doubleSided: false,
    id,
    mapImage: cachedTextureImage(primary.url),
    mapRepeat: primary.repeat,
    noEdge: true,
    position: { x: 0, y: -28 + depth * 5, z: 0 },
    shape: "manual",
    solid: false,
    texturePolicy: {
      atmosphericDepth: depth,
      distanceSelected: true,
      projection: "triplanar-alpine-strata"
    },
    textureUrl: primary.url,
    userData: {
      AwtsmoosLod: { className: "mountain", quality },
      family: family2
    }
  }, MOUNTAIN_STACK, quality === "low" ? 2 : quality === "medium" ? 4 : 6);
}
function belt(radius, height, depth, color, segments) {
  return Object.freeze({ color, depth, height, radius, segments });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/FoundationEnvelopeSampling.js
var DEFAULT_DIVISIONS = 6;
function sampleFoundationEnvelope(envelope, groundSampler, divisions = DEFAULT_DIVISIONS) {
  const heights = foundationEnvelopePoints(envelope, divisions).map(({ x, z }) => {
    return villageGroundHeight(groundSampler, x, z);
  });
  return Object.freeze({
    maximumGround: Math.max(...heights),
    minimumGround: Math.min(...heights),
    samples: heights.length
  });
}
function foundationEnvelopePoints(envelope, divisions = DEFAULT_DIVISIONS) {
  const points = [];
  for (let xIndex = 0; xIndex <= divisions; xIndex += 1) {
    for (let zIndex = 0; zIndex <= divisions; zIndex += 1) {
      points.push(rotatedPoint(
        envelope,
        localCoordinate(envelope.width, xIndex, divisions),
        localCoordinate(envelope.depth, zIndex, divisions)
      ));
    }
  }
  return points;
}
function localCoordinate(size, index, divisions) {
  return -size / 2 + size * index / divisions;
}
function rotatedPoint(envelope, localX, localZ) {
  const cosine = Math.cos(envelope.yaw || 0);
  const sine = Math.sin(envelope.yaw || 0);
  return {
    x: envelope.x + localX * cosine - localZ * sine,
    z: envelope.z + localX * sine + localZ * cosine
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/CanonicalFoundationSampling.js
var FOUNDATION_CLEARANCE = 0.12;
var FOUNDATION_EMBED = 0.24;
function canonicalFoundationSample(id, groundSampler, envelopeOverride = null) {
  const envelope = envelopeOverride || CANONICAL_FOOTPRINTS_BY_ID[id];
  if (!envelope) {
    return null;
  }
  const ground = sampleFoundationEnvelope(envelope, groundSampler);
  return Object.freeze({
    bottom: ground.minimumGround - FOUNDATION_EMBED,
    envelope,
    maximumGround: ground.maximumGround,
    minimumGround: ground.minimumGround,
    samples: ground.samples,
    top: ground.maximumGround + FOUNDATION_CLEARANCE
  });
}
function canonicalFoundationTopHeight(id, groundSampler, fallbackX, fallbackZ, envelopeOverride = null) {
  const sample = canonicalFoundationSample(
    id,
    groundSampler,
    envelopeOverride
  );
  return sample ? sample.top : villageGroundHeight(groundSampler, fallbackX, fallbackZ);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageCottageFacadeLayout.js
function cottageWindowDescriptors(cottage) {
  if (cottage.detail === "far") {
    return [facadeBox(cottage, -cottage.width * 0.23, 1.9, cottage.depth * 0.51, 0.92, 1.08, 0.08)];
  }
  const windows = [];
  for (let story = 0; story < cottage.stories; story += 1) {
    const height = 1.9 + story * cottage.storyHeight;
    for (const side of [-1, 1]) {
      windows.push(facadeBox(
        cottage,
        side * cottage.width * 0.23,
        height,
        cottage.depth * 0.51,
        0.92,
        1.08,
        0.08
      ));
    }
  }
  return windows;
}
function cottageDoorDescriptor(cottage) {
  return facadeBox(cottage, 0, 1.25, cottage.depth * 0.515, 1.35, 2.5, 0.12);
}
function cottageChimneyDescriptor(cottage) {
  return facadeBox(
    cottage,
    cottage.width * 0.28,
    cottage.wallHeight + cottage.roofRise * 0.48,
    -cottage.depth * 0.15,
    0.78,
    cottage.roofRise + 1.1,
    0.78
  );
}
function facadeBox(cottage, localX, localY, localZ, x, y, z) {
  const cosine = Math.cos(cottage.yaw);
  const sine = Math.sin(cottage.yaw);
  return {
    position: {
      x: cottage.x + localX * cosine + localZ * sine,
      y: cottage.base + localY,
      z: cottage.z - localX * sine + localZ * cosine
    },
    size: { x, y, z },
    yaw: cottage.yaw
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageCottageScalePolicy.js
var PLAYER_RADIUS = 0.38;
var PLAYER_HEIGHT = 1.72;
var FORMER_BASE_VOLUME2 = 7.6 * 5.9 * 5.5;
var MINIMUM_EXPANSION = 10;
var BASE_WIDTH = 19.2;
var BASE_DEPTH = 15.4;
var STORIES = 3;
function villageCottageScalePolicy(detail = "near", variant = 0) {
  const safeVariant = Math.abs(Number(variant) || 0);
  const width = BASE_WIDTH + safeVariant % 3 * 1.2;
  const depth = BASE_DEPTH + safeVariant % 2 * 1.1;
  const storyHeight = detail === "far" ? 3.15 : 3.3;
  const wallHeight = STORIES * storyHeight;
  const roofRise = 5.1 + safeVariant % 3 * 0.35;
  const volume = width * depth * wallHeight;
  const expansionRatio = volume / FORMER_BASE_VOLUME2;
  if (expansionRatio < MINIMUM_EXPANSION) {
    throw new Error(
      `Cottage expansion ${expansionRatio.toFixed(1)}x is below ${MINIMUM_EXPANSION}x.`
    );
  }
  return Object.freeze({
    depth,
    expansionRatio,
    minimumExpansion: MINIMUM_EXPANSION,
    roofRise,
    stories: STORIES,
    storyHeight,
    volume,
    volumeRatio: volume / playerReferenceVolume(),
    wallHeight,
    width
  });
}
function playerReferenceVolume() {
  const cylinderHeight = Math.max(0, PLAYER_HEIGHT - PLAYER_RADIUS * 2);
  const cylinder = Math.PI * PLAYER_RADIUS ** 2 * cylinderHeight;
  const sphere = 4 / 3 * Math.PI * PLAYER_RADIUS ** 3;
  return cylinder + sphere;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/HeroCottageCraftSystem.js
function createHeroCottageCraftDefinitions(groundSampler) {
  const decks = [];
  const rails = [];
  const posts = [];
  const canopies = [];
  CANONICAL_VILLAGE_HOUSES.slice(0, 12).forEach((house2, index) => {
    appendCraft({ ...house2, ...villageCottageScalePolicy("near", index), base: cottageBase(house2, index, groundSampler) }, index, decks, rails, posts, canopies);
  });
  return [
    batch2("hero-cottage-balcony-decks", decks, "#59402d", TEXTURE_URLS.wood.planks1, "balcony-deck"),
    batch2("hero-cottage-balcony-rails", rails, "#3e2a1d", TEXTURE_URLS.wood.oak3, "balcony-rail"),
    batch2("hero-cottage-porch-posts", posts, "#432d1e", TEXTURE_URLS.wood.oak3, "porch-and-timber-post"),
    batch2("hero-cottage-porch-canopies", canopies, "#494744", TEXTURE_URLS.roof.tile2, "slate-porch-canopy")
  ];
}
function cottageBase(house2, index, sampler) {
  const scale3 = villageCottageScalePolicy("near", index);
  return canonicalFoundationTopHeight(house2.id, sampler, house2.x, house2.z, {
    depth: scale3.depth,
    width: scale3.width,
    x: house2.x,
    yaw: house2.yaw,
    z: house2.z
  });
}
function appendCraft(cottage, index, decks, rails, posts, canopies) {
  const balconyWidth = cottage.width * (index % 2 ? 0.48 : 0.6);
  const balconyY = cottage.storyHeight + 0.22;
  decks.push(facadeBox(cottage, 0, balconyY, cottage.depth * 0.61, balconyWidth, 0.24, 1.85));
  canopies.push(facadeBox(cottage, 0, 2.85, cottage.depth * 0.66, 3.8, 0.22, 2.05));
  for (const side of [-1, 1]) {
    posts.push(facadeBox(cottage, side * 1.55, 1.42, cottage.depth * 0.7, 0.2, 2.8, 0.2));
    posts.push(facadeBox(cottage, side * cottage.width * 0.46, cottage.wallHeight / 2, cottage.depth * 0.525, 0.22, cottage.wallHeight - 0.3, 0.22));
    rails.push(facadeBox(cottage, side * (balconyWidth / 2 - 0.12), balconyY + 0.62, cottage.depth * 0.78, 0.16, 1.1, 0.16));
  }
  rails.push(facadeBox(cottage, 0, balconyY + 0.98, cottage.depth * 0.78, balconyWidth, 0.16, 0.16));
  rails.push(facadeBox(cottage, 0, balconyY + 0.48, cottage.depth * 0.78, balconyWidth, 0.12, 0.12));
}
function batch2(id, boxes, color, textureUrl, part4) {
  return createVillageBoxBatch(id, boxes, {
    color,
    family: "canonical-hero-cottage-craft",
    part: part4,
    texturePolicy: { role: part4, shader: "weathered-cottage-detail", tileWorld: 0.9 },
    textureUrl
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/ProceduralClusterGeometry.js
function emptyClusterGeometry() {
  return { indices: [], uvs: [], vertices: [] };
}
function appendEllipsoid(mesh2, center, radius, rings = 4, segments = 9) {
  const start = mesh2.vertices.length;
  for (let ring = 0; ring <= rings; ring += 1) {
    const vertical = ring / rings;
    const phi = vertical * Math.PI - Math.PI / 2;
    for (let segment2 = 0; segment2 < segments; segment2 += 1) {
      const horizontal = segment2 / segments;
      const angle = horizontal * Math.PI * 2;
      mesh2.vertices.push([
        center.x + Math.cos(phi) * Math.cos(angle) * radius.x,
        center.y + Math.sin(phi) * radius.y,
        center.z + Math.cos(phi) * Math.sin(angle) * radius.z
      ]);
      mesh2.uvs.push(horizontal, vertical);
    }
  }
  for (let ring = 0; ring < rings; ring += 1) {
    for (let segment2 = 0; segment2 < segments; segment2 += 1) {
      const next = (segment2 + 1) % segments;
      const a = start + ring * segments + segment2;
      const b = start + ring * segments + next;
      const c = a + segments;
      const d = b + segments;
      mesh2.indices.push(a, b, c, b, d, c);
    }
  }
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageArrivalPath.js
var CONTROL_POINTS = Object.freeze([
  [0, 101],
  [-0.5, 88],
  [-2.8, 76],
  [-3.5, 64],
  [-1.2, 52],
  [2.8, 40],
  [7.5, 28],
  [12.4, 17],
  [18, 7]
]);
function sampleArrivalPath(groundSampler, subdivisions = 4) {
  const points = [];
  for (let segment2 = 0; segment2 < CONTROL_POINTS.length - 1; segment2 += 1) {
    for (let step = 0; step < subdivisions; step += 1) {
      const amount = step / subdivisions;
      points.push(sampleSegment(groundSampler, segment2, amount));
    }
  }
  points.push(sampleSegment(groundSampler, CONTROL_POINTS.length - 2, 1));
  return points;
}
function sampleSegment(groundSampler, segment2, amount) {
  const first = CONTROL_POINTS[segment2];
  const second = CONTROL_POINTS[segment2 + 1];
  const eased = smooth6(amount);
  const x = first[0] + (second[0] - first[0]) * eased;
  const z = first[1] + (second[1] - first[1]) * eased;
  return {
    width: 5.8 + Math.sin((segment2 + amount) * 0.8) * 0.32,
    x,
    y: villageGroundHeight(groundSampler, x, z) + 0.07,
    z
  };
}
function smooth6(value) {
  return value * value * (3 - 2 * value);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/HeroValleyGardenSystem.js
var PALETTE = Object.freeze(["#f1d36c", "#d990ae", "#8f7bc8", "#f2eee1"]);
function createHeroValleyGardenDefinitions(groundSampler) {
  const foliage = emptyClusterGeometry();
  const blossoms = PALETTE.map(() => emptyClusterGeometry());
  const points = sampleArrivalPath(groundSampler, 3);
  for (let index = 2; index < points.length - 7; index += 2) {
    for (const side of [-1, 1]) appendBed(points, index, side, foliage, blossoms);
  }
  return [
    definition3("hero-garden-foliage", foliage, "#315b38", TEXTURE_URLS.terrain.grass7, "garden-foliage"),
    ...blossoms.map((geometry, index) => definition3(
      `hero-garden-blossoms-${index}`,
      geometry,
      PALETTE[index],
      TEXTURE_URLS.terrain.grass4,
      "clustered-blossoms"
    ))
  ];
}
function appendBed(points, index, side, foliage, blossomMeshes) {
  const point3 = points[index];
  const previous = points[index - 1];
  const next = points[index + 1];
  const tangentX = next.x - previous.x;
  const tangentZ = next.z - previous.z;
  const length3 = Math.hypot(tangentX, tangentZ) || 1;
  const normal = { x: -tangentZ / length3, z: tangentX / length3 };
  for (let plant = 0; plant < 6; plant += 1) {
    const spread = (plant - 2.5) * 0.72;
    const distance = point3.width / 2 + 1.4 + plant % 2 * 0.55;
    const center = {
      x: point3.x + normal.x * distance * side + tangentX / length3 * spread,
      y: point3.y + 0.28 + plant % 3 * 0.08,
      z: point3.z + normal.z * distance * side + tangentZ / length3 * spread
    };
    appendEllipsoid(foliage, center, { x: 0.62, y: 0.42, z: 0.56 }, 3, 7);
    for (let flower = 0; flower < 3; flower += 1) {
      const angle = flower / 3 * Math.PI * 2 + index;
      appendEllipsoid(blossomMeshes[(index + plant + flower) % PALETTE.length], {
        x: center.x + Math.cos(angle) * 0.36,
        y: center.y + 0.34 + flower * 0.06,
        z: center.z + Math.sin(angle) * 0.36
      }, { x: 0.19, y: 0.11, z: 0.19 }, 2, 6);
    }
  }
}
function definition3(id, geometry, color, textureUrl, part4) {
  return {
    ...geometry,
    color,
    id: `Awtsmoos_${id}`,
    mapRepeat: [3, 3],
    noEdge: true,
    shape: "manual",
    solid: false,
    texturePolicy: { role: part4, shader: "stable-botanical-cluster", tileWorld: 0.45 },
    textureUrl,
    userData: { family: "canonical-arrival-gardens", part: part4 }
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageArrivalFence.js
function createArrivalFence(points, groundSampler) {
  const selected2 = points.filter((_, index) => index % 5 === 1).slice(0, 7);
  const pieces = [];
  for (const point3 of selected2) {
    const x = point3.x - 7.4;
    const y = villageGroundHeight(groundSampler, x, point3.z);
    pieces.push(box2(x, y + 0.9, point3.z, 0.28, 1.8, 0.28, 0));
  }
  for (let index = 0; index < selected2.length - 1; index += 1) {
    appendRails(pieces, selected2[index], selected2[index + 1], groundSampler);
  }
  return createVillageBoxBatch("arrival-timber-fence", pieces, {
    color: "#6b482e",
    family: "canonical-arrival-composition",
    part: "slope-following-garden-fence",
    texturePolicy: { role: "arrival-timber", shader: "rough-timber-grain", tileWorld: 0.72 },
    textureUrl: TEXTURE_URLS.wood.oak3
  });
}
function appendRails(pieces, first, second, groundSampler) {
  const firstX = first.x - 7.4;
  const secondX = second.x - 7.4;
  const centerX = (firstX + secondX) / 2;
  const centerZ = (first.z + second.z) / 2;
  const length3 = Math.hypot(secondX - firstX, second.z - first.z);
  const yaw = Math.atan2(secondX - firstX, second.z - first.z);
  const groundY = villageGroundHeight(groundSampler, centerX, centerZ);
  for (const height of [0.68, 1.3]) {
    pieces.push(box2(centerX, groundY + height, centerZ, 0.18, 0.18, length3, yaw));
  }
}
function box2(x, y, z, width, height, depth, yaw) {
  return { position: { x, y, z }, size: { x: width, y: height, z: depth }, yaw };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageSurfaceRibbon.js
function createVillageSurfaceRibbon(id, points, options) {
  const vertices = [];
  const faces = [];
  for (let index = 0; index < points.length; index += 1) {
    appendPair(vertices, points, index, options);
    if (index > 0) {
      const start = index * 2;
      faces.push([start - 2, start, start + 1, start - 1]);
    }
  }
  return {
    alphaMode: options.alphaMode || "OPAQUE",
    color: options.color,
    doubleSided: true,
    faces,
    id: `Awtsmoos_${id}`,
    mapRepeat: options.mapRepeat || [1, 1],
    noEdge: true,
    opacity: options.opacity ?? 1,
    position: { x: 0, y: 0, z: 0 },
    shape: "manual",
    solid: false,
    texturePolicy: {
      publicFirebase: true,
      ...options.texturePolicy
    },
    textureUrl: options.textureUrl,
    transparent: Boolean(options.transparent),
    userData: {
      family: options.family,
      part: options.part,
      surfaceLift: options.surfaceLift || 0,
      ...options.userData || {}
    },
    vertices
  };
}
function offsetVillageRibbon(points, side, innerWidth, outerWidth) {
  return points.map((point3, index) => {
    const frame = ribbonFrame(points, index);
    const centerOffset = side * (innerWidth + outerWidth) / 4;
    return {
      width: (outerWidth - innerWidth) / 2,
      x: point3.x + frame.x * centerOffset,
      y: point3.y,
      z: point3.z + frame.z * centerOffset
    };
  });
}
function appendPair(vertices, points, index, options) {
  const point3 = points[index];
  const frame = ribbonFrame(points, index);
  const halfWidth = point3.width / 2;
  vertices.push(surfaceVertex(point3, frame, halfWidth, options));
  vertices.push(surfaceVertex(point3, frame, -halfWidth, options));
}
function surfaceVertex(point3, frame, offset, options) {
  const x = point3.x + frame.x * offset;
  const z = point3.z + frame.z * offset;
  return [x, surfaceHeight2(point3, x, z, options), z];
}
function surfaceHeight2(point3, x, z, options) {
  const sampled = options.groundSampler?.heightAt?.(x, z)?.y;
  const base = Number.isFinite(sampled) ? sampled : point3.y;
  return base + (options.surfaceLift || 0);
}
function ribbonFrame(points, index) {
  const previous = points[Math.max(0, index - 1)];
  const next = points[Math.min(points.length - 1, index + 1)];
  const dx = next.x - previous.x;
  const dz = next.z - previous.z;
  const length3 = Math.hypot(dx, dz) || 1;
  return {
    x: -dz / length3,
    z: dx / length3
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageArrivalComposition.js
function createVillageArrivalComposition(groundSampler) {
  const points = sampleArrivalPath(groundSampler);
  const definitions = [
    roadDefinition(points, groundSampler),
    shoulderDefinition(
      "left",
      offsetVillageRibbon(points, -1, 5.8, 9.4),
      groundSampler
    ),
    shoulderDefinition(
      "right",
      offsetVillageRibbon(points, 1, 5.8, 9.4),
      groundSampler
    ),
    createArrivalFence(points, groundSampler)
  ];
  definitions.stats = {
    drawDefinitions: definitions.length,
    featuredBotanicals: 0,
    pathSections: points.length - 1,
    stoneBorderPieces: 0,
    timberPieces: 19,
    waterSections: 0
  };
  return definitions;
}
function roadDefinition(points, groundSampler) {
  return createVillageSurfaceRibbon("arrival-cobblestone-lane", points, {
    color: "#756652",
    family: "canonical-arrival-composition",
    groundSampler,
    mapRepeat: [3.5, 18],
    part: "curved-cobbled-lane",
    surfaceLift: 0.07,
    texturePolicy: {
      role: "arrival-cobblestone",
      shader: "rough-stone-detail",
      tileWorld: 0.74
    },
    textureUrl: TEXTURE_URLS.stone.floor2,
    userData: {
      canonicalId: "ENTR01",
      infrastructureId: "ENTR01"
    }
  });
}
function shoulderDefinition(side, points, groundSampler) {
  return createVillageSurfaceRibbon(`arrival-${side}-soil-shoulder`, points, {
    color: side === "left" ? "#5a4a32" : "#4f5030",
    family: "canonical-arrival-composition",
    groundSampler,
    mapRepeat: [2.2, 15],
    part: `${side}-blended-road-shoulder`,
    surfaceLift: 0.035,
    texturePolicy: {
      role: "road-shoulder-earth-grass",
      shader: "soil-grass-transition",
      tileWorld: 0.8
    },
    textureUrl: TEXTURE_URLS.terrain.dirt1
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageCottageDetailBatch.js
function createCottageDetailCollector() {
  return { chimneys: [], doors: [], windows: [] };
}
function appendCottageDetails(collector, cottage) {
  collector.windows.push(...cottageWindowDescriptors(cottage));
  if (cottage.detail === "far") return;
  collector.doors.push(cottageDoorDescriptor(cottage));
  if (cottage.detail === "near") {
    collector.chimneys.push(cottageChimneyDescriptor(cottage));
  }
}
function createCottageDetailBatches(collector) {
  return [
    batch3("cottage-window-batch", collector.windows, {
      color: REFERENCE_GOLDEN_HOUR.windowColor,
      part: "window",
      textureUrl: TEXTURE_URLS.metals.gold2
    }),
    batch3("cottage-door-batch", collector.doors, {
      color: "#5b3825",
      part: "door",
      textureUrl: TEXTURE_URLS.wood.oak3
    }),
    batch3("cottage-chimney-batch", collector.chimneys, {
      color: "#8c765f",
      part: "chimney",
      textureUrl: TEXTURE_URLS.bricks.fieldstone1
    })
  ].filter(Boolean);
}
function batch3(id, boxes, options) {
  return boxes.length ? createVillageBoxBatch(id, boxes, {
    ...options,
    family: "reference-cottage-detail-batch"
  }) : null;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageCottageBlossomBatch.js
function createCottageBlossomBatch(blossoms) {
  if (!blossoms.length) return null;
  const vertices = [];
  const faces = [];
  for (const blossom of blossoms) {
    appendBlossom(vertices, faces, blossom);
  }
  return {
    alphaMode: "OPAQUE",
    color: "#e16c96",
    doubleSided: true,
    faces,
    id: "Awtsmoos_cottage-blossom-batch",
    noEdge: true,
    shape: "manual",
    solid: false,
    texturePolicy: { role: "flower-box-petal-geometry", shader: "petal-geometry-wind" },
    userData: {
      AwtsmoosLod: { className: "vegetation" },
      family: "reference-cottage-ornament-batch",
      part: "blossoms"
    },
    vertices
  };
}
function appendBlossom(vertices, faces, blossom) {
  const start = vertices.length;
  const { x, y, z } = blossom.position;
  const radius = blossom.size.x * 0.55;
  vertices.push(
    [x, y + blossom.size.y * 0.65, z],
    [x, y - blossom.size.y * 0.35, z],
    [x + radius, y, z],
    [x, y, z + radius],
    [x - radius, y, z],
    [x, y, z - radius]
  );
  for (const [a, b] of [[2, 3], [3, 4], [4, 5], [5, 2]]) {
    faces.push([start, start + a, start + b]);
    faces.push([start + 1, start + b, start + a]);
  }
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageCottageOrnamentLayout.js
function appendCottageOrnamentLayout(collector, cottage) {
  appendBeams(collector.beams, cottage);
  if (cottage.detail === "far") return;
  appendWindowOrnaments(collector, cottage);
  collector.steps.push(facadeBox(
    cottage,
    0,
    0.24,
    cottage.depth * 0.61,
    2.35,
    0.48,
    1.25
  ));
}
function appendBeams(output, cottage) {
  for (let story = 1; story < cottage.stories; story += 1) {
    output.push(facadeBox(
      cottage,
      0,
      story * cottage.storyHeight,
      cottage.depth * 0.525,
      cottage.width * 0.96,
      0.18,
      0.2
    ));
  }
  output.push(facadeBox(
    cottage,
    0,
    cottage.wallHeight - 0.2,
    cottage.depth * 0.525,
    cottage.width * 0.96,
    0.18,
    0.2
  ));
  output.push(facadeBox(
    cottage,
    0,
    cottage.wallHeight / 2,
    cottage.depth * 0.53,
    0.19,
    cottage.wallHeight - 0.35,
    0.21
  ));
}
function appendWindowOrnaments(collector, cottage) {
  for (const window of cottageWindowDescriptors(cottage)) {
    const local = worldToLocal(window.position, cottage);
    for (const side of [-1, 1]) {
      collector.shutters.push(facadeBox(
        cottage,
        local.x + side * 0.64,
        local.y,
        local.z + 0.025,
        0.24,
        1.18,
        0.1
      ));
    }
    collector.flowerBoxes.push(facadeBox(cottage, local.x, local.y - 0.72, local.z + 0.08, 1.35, 0.26, 0.38));
    for (const offset of [-0.4, 0, 0.4]) {
      collector.blossoms.push(facadeBox(cottage, local.x + offset, local.y - 0.43, local.z + 0.13, 0.32, 0.38, 0.32));
    }
  }
}
function worldToLocal(position, cottage) {
  const dx = position.x - cottage.x;
  const dz = position.z - cottage.z;
  const cosine = Math.cos(cottage.yaw);
  const sine = Math.sin(cottage.yaw);
  return {
    x: dx * cosine - dz * sine,
    y: position.y - cottage.base,
    z: dx * sine + dz * cosine
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageCottageOrnamentBatch.js
function createCottageOrnamentCollector() {
  return { beams: [], blossoms: [], flowerBoxes: [], shutters: [], steps: [] };
}
function appendCottageOrnaments(collector, cottage) {
  appendCottageOrnamentLayout(collector, cottage);
}
function createCottageOrnamentBatches(collector) {
  return [
    batch4("cottage-timber-frame-batch", collector.beams, "#4a2e1d", TEXTURE_URLS.wood.oak3, "timber-frame"),
    batch4("cottage-shutter-batch", collector.shutters, "#385b52", TEXTURE_URLS.wood.oak3, "shutters"),
    batch4("cottage-flower-box-batch", collector.flowerBoxes, "#5a3620", TEXTURE_URLS.wood.planks1, "flower-box"),
    createCottageBlossomBatch(collector.blossoms),
    batch4("cottage-entry-step-batch", collector.steps, "#8c8274", TEXTURE_URLS.bricks.fieldstone1, "entry-step")
  ].filter(Boolean);
}
function batch4(id, boxes, color, textureUrl, part4) {
  if (!boxes.length) return null;
  return createVillageBoxBatch(id, boxes, {
    color,
    family: "reference-cottage-ornament-batch",
    part: part4,
    textureUrl
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageCottageShadowBatch.js
var WHITE_PIXEL = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1" height="1"%3E%3Cpath fill="white" d="M0 0h1v1H0z"/%3E%3C/svg%3E';
var SHADOW_DIRECTION = horizontalShadowDirection(REFERENCE_GOLDEN_HOUR.sunPosition);
function createCottageShadowCollector() {
  return [];
}
function appendCottageShadow(shadows, cottage) {
  const castLength = 4.8 + cottage.wallHeight * 0.72;
  shadows.push({
    position: {
      x: cottage.x + SHADOW_DIRECTION.x * castLength * 0.5,
      y: cottage.base + 0.045,
      z: cottage.z + SHADOW_DIRECTION.z * castLength * 0.5
    },
    size: {
      x: cottage.width * 0.94,
      y: 0.035,
      z: cottage.depth * 0.68 + castLength
    },
    yaw: SHADOW_DIRECTION.yaw
  });
}
function createCottageShadowBatch(shadows) {
  if (!shadows.length) return null;
  const definition4 = createVillageBoxBatch("cottage-sun-shadow-batch", shadows, {
    color: "#171b19",
    family: "reference-cottage-sun-shadows",
    part: "golden-hour-grounding",
    texturePolicy: {
      bakedLighting: true,
      publicFirebase: false,
      shader: "static-sun-shadow"
    },
    textureUrl: WHITE_PIXEL
  });
  return {
    ...definition4,
    alphaMode: "BLEND",
    doubleSided: false,
    opacity: 0.17,
    transparent: true
  };
}
function horizontalShadowDirection(sunPosition) {
  const x = -sunPosition[0];
  const z = -sunPosition[2];
  const length3 = Math.hypot(x, z) || 1;
  return Object.freeze({
    x: x / length3,
    yaw: Math.atan2(x, z),
    z: z / length3
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageArchitectureDetailPolicy.js
function architectureDistrictPolicy(district2, quality = "high") {
  if (district2.id === "arrival-meadow") {
    return policy(district2, 2, arrivalDetail(quality));
  }
  if (quality === "low") {
    const repeatedCount2 = district2.detail === "far" ? 1 : 2;
    return policy(district2, repeatedCount2, "far");
  }
  if (quality === "medium") {
    const repeatedCount2 = district2.detail === "near" ? 3 : 2;
    const detail = district2.detail === "near" ? "medium" : "far";
    return policy(district2, repeatedCount2, detail);
  }
  if (quality === "cinematic") {
    const repeatedCount2 = district2.detail === "far" ? 3 : district2.detail === "medium" ? 4 : 5;
    const detail = district2.detail === "far" ? "medium" : "near";
    return policy(district2, repeatedCount2, detail);
  }
  const repeatedCount = district2.detail === "far" ? 2 : district2.detail === "medium" ? 3 : 4;
  return policy(district2, repeatedCount, district2.detail);
}
function policy(district2, repeatedCount, detail) {
  const canonicalCount = Array.isArray(district2.houseIds) ? district2.houseIds.length : 0;
  return Object.freeze({
    cottages: Math.max(canonicalCount, repeatedCount),
    detail
  });
}
function arrivalDetail(quality) {
  if (quality === "low") {
    return "far";
  }
  if (quality === "medium") {
    return "medium";
  }
  return "near";
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageLandmarkPrimitive.js
function landmarkBox(options) {
  return landmarkPrimitive("box", options);
}
function landmarkPrism(options) {
  return landmarkPrimitive("triPrism", options);
}
function landmarkCylinder(options) {
  return {
    ...landmarkPrimitive("cylinder", options),
    height: options.height,
    radius: options.radius,
    segments: options.segments || 24
  };
}
function landmarkPrimitive(shape, options) {
  const material = materialFields(
    options.materials,
    options.materialRole || "stone"
  );
  return {
    ...material,
    color: options.color || material.color,
    id: `Awtsmoos_${options.id}`,
    mixTextureUrl: options.mixTextureUrl || material.mixTextureUrl,
    position: {
      x: options.x,
      y: options.y,
      z: options.z
    },
    rotation: options.rotation || {
      y: options.yaw || 0
    },
    shape,
    size: options.size,
    solid: options.solid !== false,
    texturePolicy: {
      ...material.texturePolicy,
      ...options.texturePolicy || {}
    },
    textureUrl: options.textureUrl || material.textureUrl,
    userData: {
      AwtsmoosLod: {
        className: "landmark"
      },
      canonicalId: options.canonicalId,
      family: options.family || "canonical-village-landmark",
      part: options.part || options.id,
      ...options.userData || {}
    }
  };
}
function materialFields(materials, role) {
  const roleMap = {
    roof: ["roof", "mixRoof", "#5b5149"],
    stone: ["stone", "mixStone", "#aa9c86"],
    wood: ["wood", "mixWood", "#765239"]
  };
  const [primary, secondary, color] = roleMap[role] || roleMap.stone;
  return {
    anisotropy: materials.anisotropy,
    color,
    mapRepeat: [1, 1],
    mixRepeat: [1, 1],
    mixStrength: role === "wood" ? 0.18 : 0.28,
    mixTextureUrl: materials[secondary],
    texturePolicy: materials.texturePolicy,
    textureUrl: materials[primary]
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageBeisChabadBuilder.js
function createBeisChabadDefinitions(options) {
  const x = -35;
  const z = 45;
  const base = options.base;
  return [
    landmarkBox(part(options, "BEIS01-shell", x, base + 2.8, z, { x: 10, y: 5.6, z: 7.5 }, "stone", true)),
    landmarkPrism(part(options, "BEIS01-roof", x, base + 6.6, z, { x: 11.2, y: 2.35, z: 8.5 }, "roof")),
    landmarkBox(part(options, "BEIS01-door", x, base + 1.55, z + 3.82, { x: 2.15, y: 3.1, z: 0.2 }, "wood")),
    porchBatch(options, base, x, z),
    windowBatch(options, base, x, z)
  ];
}
function porchBatch(options, base, x, z) {
  const boxes = [
    box3(x, base + 0.35, z + 4.35, 7.2, 0.35, 2.4),
    box3(x - 3.1, base + 1.8, z + 4.9, 0.24, 3.1, 0.24),
    box3(x + 3.1, base + 1.8, z + 4.9, 0.24, 3.1, 0.24),
    box3(x, base + 3.25, z + 4.9, 6.6, 0.24, 0.24)
  ];
  return createVillageBoxBatch("BEIS01-porch", boxes, batchOptions(options, "porch"));
}
function windowBatch(options, base, x, z) {
  const boxes = [-3, 3].flatMap((offset) => [
    box3(x + offset, base + 2.35, z + 3.83, 1.25, 1.65, 0.12),
    box3(x + offset, base + 4.4, z + 3.83, 1.25, 1.35, 0.12)
  ]);
  return createVillageBoxBatch("BEIS01-windows", boxes, batchOptions(options, "warm-windows"));
}
function part(options, id, x, y, z, size, materialRole, canonicalAnchor = false) {
  return {
    canonicalId: canonicalAnchor ? "BEIS01" : void 0,
    id,
    materialRole,
    materials: options.materials,
    size,
    userData: { landmarkId: "BEIS01" },
    x,
    y,
    z
  };
}
function batchOptions(options, partName) {
  return {
    color: "#765239",
    family: "canonical-beis-chabad",
    part: partName,
    texturePolicy: options.materials.texturePolicy,
    textureUrl: options.materials.wood
  };
}
function box3(x, y, z, width, height, depth) {
  return { position: { x, y, z }, size: { x: width, y: height, z: depth }, yaw: 0 };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageDistrictTransitionBuilder.js
function createDistrictTransitionDefinitions(options) {
  const { district: district2, base, materials } = options;
  const x = district2.center[0];
  const z = district2.center[1];
  return [
    retainingWall(district2.id, x, base, z, materials),
    stoneStairs(district2.id, x, base, z, materials),
    drainageChannel(district2.id, x, base, z, materials)
  ];
}
function retainingWall(id, x, base, z, materials) {
  const boxes = [-1, 0, 1].map((offset) => ({
    position: {
      x: x + offset * 4.2,
      y: base + 0.75,
      z: z - 5.4
    },
    size: { x: 4.4, y: 1.5, z: 0.9 },
    yaw: 0
  }));
  return createVillageBoxBatch(`${id}-retaining-wall`, boxes, {
    color: "#9a9185",
    family: "canonical-terrace-transition",
    part: "retaining-wall",
    texturePolicy: materials.texturePolicy,
    textureUrl: materials.stone
  });
}
function stoneStairs(id, x, base, z, materials) {
  const boxes = Array.from({ length: 6 }, (_, index) => ({
    position: {
      x,
      y: base + 0.12 + index * 0.16,
      z: z - 7.4 + index * 0.48
    },
    size: { x: 2.2, y: 0.24, z: 0.72 },
    yaw: 0
  }));
  return createVillageBoxBatch(`${id}-stone-stairs`, boxes, {
    color: "#827a70",
    family: "canonical-terrace-transition",
    part: "stone-stairs",
    texturePolicy: materials.texturePolicy,
    textureUrl: materials.stone
  });
}
function drainageChannel(id, x, base, z, materials) {
  const boxes = [-1, 1].map((side) => ({
    position: { x: x + side * 1.55, y: base + 0.08, z: z - 5.9 },
    size: { x: 0.35, y: 0.16, z: 4.2 },
    yaw: 0
  }));
  return createVillageBoxBatch(`${id}-drainage`, boxes, {
    color: "#6f685f",
    family: "canonical-terrace-transition",
    part: "drainage-channel",
    texturePolicy: materials.texturePolicy,
    textureUrl: materials.stone
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageFarmGeometry.js
function rotatedFarmPoint(footprint2, localX, localZ) {
  const cosine = Math.cos(footprint2.yaw);
  const sine = Math.sin(footprint2.yaw);
  return {
    x: footprint2.x + localX * cosine - localZ * sine,
    z: footprint2.z + localX * sine + localZ * cosine
  };
}
function createFarmBox(x, y, z, width, height, depth, yaw) {
  return {
    position: {
      x,
      y,
      z
    },
    size: {
      x: width,
      y: height,
      z: depth
    },
    yaw
  };
}
function farmBatchOptions(options, color, part4, textureUrl) {
  return {
    color,
    family: "canonical-farm-terrace",
    part: part4,
    texturePolicy: options.materials.texturePolicy,
    textureUrl
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageFarmCropRows.js
function createFarmCropRowBatch(footprints, options) {
  const boxes = footprints.flatMap((footprint2) => {
    return createCropRows(footprint2, options.groundSampler);
  });
  return createVillageBoxBatch(
    "canonical-farm-crop-rows",
    boxes,
    farmBatchOptions(
      options,
      "#6f8242",
      "crop-rows",
      options.materials.wood
    )
  );
}
function createCropRows(footprint2, groundSampler) {
  const top = canonicalFoundationTopHeight(
    footprint2.id,
    groundSampler,
    footprint2.x,
    footprint2.z
  );
  return Array.from({ length: 5 }, (_, index) => {
    const offset = (index - 2) * footprint2.width / 5;
    const point3 = rotatedFarmPoint(footprint2, offset, 0);
    return createFarmBox(
      point3.x,
      top + 0.33,
      point3.z,
      0.2,
      0.18,
      footprint2.depth * 0.78,
      footprint2.yaw
    );
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageOrchardBatches.js
function createOrchardBatches(footprints, options) {
  return [
    createOrchardBatch(footprints, options, orchardKind("trunks")),
    createOrchardBatch(footprints, options, orchardKind("canopies"))
  ];
}
function createOrchardBatch(footprints, options, kind) {
  const boxes = footprints.flatMap((footprint2) => {
    return createOrchardGrid(footprint2, options.groundSampler, kind);
  });
  return createVillageBoxBatch(
    `canonical-orchard-${kind.name}`,
    boxes,
    farmBatchOptions(
      options,
      kind.color,
      `orchard-${kind.name}`,
      kind.texture(options)
    )
  );
}
function createOrchardGrid(footprint2, groundSampler, kind) {
  const boxes = [];
  const top = canonicalFoundationTopHeight(
    footprint2.id,
    groundSampler,
    footprint2.x,
    footprint2.z
  );
  for (const localX of horizontalOffsets(footprint2)) {
    for (const localZ of depthOffsets(footprint2)) {
      const point3 = rotatedFarmPoint(footprint2, localX, localZ);
      boxes.push(createFarmBox(
        point3.x,
        top + 0.24 + kind.height / 2 + kind.lift,
        point3.z,
        kind.width,
        kind.height,
        kind.width,
        footprint2.yaw
      ));
    }
  }
  return boxes;
}
function horizontalOffsets(footprint2) {
  return [-footprint2.width * 0.25, 0, footprint2.width * 0.25];
}
function depthOffsets(footprint2) {
  return [-footprint2.depth * 0.22, footprint2.depth * 0.22];
}
function orchardKind(name) {
  const canopy = name === "canopies";
  return Object.freeze({
    color: canopy ? "#526d35" : "#68482f",
    height: canopy ? 1.4 : 2.2,
    lift: canopy ? 2.5 : 0,
    name,
    texture(options) {
      return canopy ? options.materials.stone : options.materials.wood;
    },
    width: canopy ? 1.7 : 0.32
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageFarmDetailBatches.js
function createFarmDetailBatches(footprints, options) {
  return [
    createFarmCropRowBatch(footprints.slice(0, 2), options),
    ...createOrchardBatches(footprints.slice(2), options)
  ];
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageFarmPlotDefinitions.js
var CANONICAL_FARM_IDS = Object.freeze(["F01", "F02", "F03", "F04"]);
function canonicalFarmFootprints() {
  return CANONICAL_FARM_IDS.map((id) => CANONICAL_FOOTPRINTS_BY_ID[id]);
}
function createCanonicalFarmPlots(groundSampler) {
  return canonicalFarmFootprints().map((footprint2) => {
    return createFarmPlot(footprint2, groundSampler);
  });
}
function createFarmPlot(footprint2, groundSampler) {
  const top = canonicalFoundationTopHeight(
    footprint2.id,
    groundSampler,
    footprint2.x,
    footprint2.z
  );
  return {
    color: footprint2.archetype === "orchard" ? "#655036" : "#5b3f28",
    id: `Awtsmoos_${footprint2.id}_plot`,
    mapRepeat: [footprint2.width / 2, footprint2.depth / 2],
    position: {
      x: footprint2.x,
      y: top + 0.12,
      z: footprint2.z
    },
    rotation: {
      y: footprint2.yaw
    },
    shape: "box",
    size: {
      x: footprint2.width,
      y: 0.24,
      z: footprint2.depth
    },
    solid: true,
    texturePolicy: {
      publicFirebase: true,
      role: footprint2.archetype,
      tileWorld: 1.8
    },
    textureUrl: TEXTURE_URLS.terrain.tilledSoil,
    userData: {
      canonicalId: footprint2.id,
      family: "canonical-farm-terrace",
      farmId: footprint2.id
    }
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageFarmTerraceBuilder.js
function createFarmTerraceDefinitions(options) {
  const footprints = canonicalFarmFootprints();
  return [
    ...createCanonicalFarmPlots(options.groundSampler),
    ...createFarmDetailBatches(footprints, options)
  ];
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageMarketBuilder.js
var STALL_LOCATIONS = Object.freeze([[-39, 18], [-33, 22], [-21, 23], [-15, 18], [-37, 7], [-17, 7]]);
function createMarketDefinitions(options) {
  const x = -26;
  const z = 12;
  const base = options.base;
  return [
    landmarkBox(part2(options, "MARKET01-hall", x, base + 2.75, z, { x: 11, y: 5.5, z: 7.5 }, "stone", true)),
    landmarkPrism(part2(options, "MARKET01-roof", x, base + 6.45, z, { x: 12, y: 2.2, z: 8.5 }, "roof")),
    landmarkBox(part2(options, "MARKET01-door", x, base + 1.55, z + 3.82, { x: 2.4, y: 3.1, z: 0.18 }, "wood")),
    stallBatch(options, base),
    awningBatch(options, base)
  ];
}
function stallBatch(options, base) {
  const boxes = STALL_LOCATIONS.flatMap(([x, z]) => [
    box4(x, base + 0.85, z, 3.8, 1.15, 1.7),
    box4(x - 1.65, base + 2.1, z, 0.18, 2.6, 0.18),
    box4(x + 1.65, base + 2.1, z, 0.18, 2.6, 0.18)
  ]);
  return createVillageBoxBatch("MARKET01-stalls", boxes, batchOptions2(options, options.materials.wood, "stalls"));
}
function awningBatch(options, base) {
  const boxes = STALL_LOCATIONS.map(([x, z], index) => ({
    position: { x, y: base + 3.05, z },
    size: { x: 4.3, y: 0.18, z: 2.3 },
    yaw: index % 2 === 0 ? 0.08 : -0.08
  }));
  return createVillageBoxBatch("MARKET01-awnings", boxes, batchOptions2(options, options.materials.roof, "awnings"));
}
function part2(options, id, x, y, z, size, materialRole, canonicalAnchor = false) {
  return {
    canonicalId: canonicalAnchor ? "MARKET01" : void 0,
    id,
    materialRole,
    materials: options.materials,
    size,
    userData: { landmarkId: "MARKET01" },
    x,
    y,
    z
  };
}
function batchOptions2(options, textureUrl, partName) {
  return {
    color: partName === "awnings" ? "#b49a72" : "#765239",
    family: "canonical-market-square",
    part: partName,
    texturePolicy: options.materials.texturePolicy,
    textureUrl
  };
}
function box4(x, y, z, width, height, depth) {
  return { position: { x, y, z }, size: { x: width, y: height, z: depth }, yaw: 0 };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillagePortalBuilder.js
function createPortalDefinitions(options) {
  const x = 56;
  const z = -49;
  const base = options.base;
  return [
    stoneRing(options, base, x, z),
    landmarkCylinder({
      canonicalId: "PORTAL01",
      color: "#7369c9",
      height: 0.24,
      id: "PORTAL01-surface",
      materialRole: "stone",
      materials: options.materials,
      radius: 2.08,
      rotation: { x: Math.PI / 2, y: 0, z: 0 },
      solid: false,
      textureUrl: fullMaterialUrl("seamless water brighter"),
      x,
      y: base + 2.7,
      z: z + 0.08
    })
  ];
}
function stoneRing(options, base, x, z) {
  const boxes = [];
  const segments = 16;
  for (let index = 0; index < segments; index += 1) {
    const angle = index / segments * Math.PI * 2;
    boxes.push({
      position: {
        x: x + Math.cos(angle) * 2.65,
        y: base + 2.7 + Math.sin(angle) * 2.65,
        z
      },
      size: { x: 0.85, y: 0.85, z: 0.8 },
      yaw: angle
    });
  }
  return createVillageBoxBatch("PORTAL01-stone-ring", boxes, {
    color: "#837a70",
    family: "canonical-waterfall-portal",
    part: "stone-ring",
    texturePolicy: options.materials.texturePolicy,
    textureUrl: options.materials.stone
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageShulBuilder.js
function createShulDefinitions(options) {
  const { base } = options;
  const x = -34;
  const z = -24;
  return [
    landmarkBox(part3(options, "SHUL01-shell", x, base + 2.45, z, { x: 9, y: 4.9, z: 7 }, "stone", true)),
    landmarkPrism(part3(options, "SHUL01-roof", x, base + 5.85, z, { x: 10, y: 2.2, z: 7.8 }, "roof")),
    landmarkBox(part3(options, "SHUL01-door", x, base + 1.55, z + 3.56, { x: 2.1, y: 3.1, z: 0.18 }, "wood")),
    landmarkCylinder({
      ...part3(options, "SHUL01-round-window", x, base + 3.65, z + 3.66, null, "wood"),
      height: 0.16,
      radius: 0.78,
      rotation: { x: Math.PI / 2, y: 0, z: 0 },
      solid: false
    }),
    ...frontWindows(options, base, x, z),
    ...entranceSteps(options, base, x, z)
  ];
}
function frontWindows(options, base, x, z) {
  return [-2.55, 2.55].map((offset, index) => landmarkBox({
    ...part3(options, `SHUL01-window-${index}`, x + offset, base + 2.25, z + 3.58, { x: 1.05, y: 1.7, z: 0.14 }, "wood"),
    solid: false,
    userData: { landmarkId: "SHUL01", warmWindow: true }
  }));
}
function entranceSteps(options, base, x, z) {
  return [0, 1, 2].map((index) => landmarkBox(part3(
    options,
    `SHUL01-step-${index}`,
    x,
    base + 0.12 + index * 0.12,
    z + 4.2 + index * 0.42,
    { x: 3.8 - index * 0.35, y: 0.24, z: 0.72 },
    "stone"
  )));
}
function part3(options, id, x, y, z, size, materialRole, canonicalAnchor = false) {
  return {
    canonicalId: canonicalAnchor ? "SHUL01" : void 0,
    id,
    materialRole,
    materials: options.materials,
    part: id,
    size,
    userData: { landmarkId: "SHUL01" },
    x,
    y,
    z
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/CanonicalLandmarkDefinitions.js
function createCanonicalLandmarkDefinitions(options) {
  if (options.district.id === "farm-terraces") {
    return createFarmTerraceDefinitions(options);
  }
  const builders = {
    BEIS01: createBeisChabadDefinitions,
    MARKET01: createMarketDefinitions,
    PORTAL01: createPortalDefinitions,
    SHUL01: createShulDefinitions
  };
  const builder = builders[options.district.landmarkId];
  return builder ? builder(options) : createDistrictTransitionDefinitions(options);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/CanonicalVillageIdentifiers.js
var CANONICAL_BUILDING_IDS = Object.freeze([
  "SHUL01",
  "BEIS01",
  "MARKET01",
  ...Array.from({ length: 18 }, (_, index) => `H${index + 10}`)
]);
var CANONICAL_INFRASTRUCTURE_IDS = Object.freeze([
  "BRIDGE01",
  "PORTAL01",
  "ENTR01"
]);
var CANONICAL_FARM_IDS2 = Object.freeze([
  "F01",
  "F02",
  "F03",
  "F04"
]);
var CANONICAL_VILLAGE_IDS = Object.freeze([
  ...CANONICAL_BUILDING_IDS,
  ...CANONICAL_INFRASTRUCTURE_IDS,
  ...CANONICAL_FARM_IDS2
]);
function isCanonicalVillageId(value) {
  return CANONICAL_VILLAGE_IDS.includes(String(value));
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/materials/PhysicalTextureCoverage.js
var PHYSICAL_TEXTURE_COVERAGE = Object.freeze({
  cloth: coverage(2.4, 2.4, 112),
  cobble: coverage(2.6, 2.6, 128),
  foliage: coverage(1.5, 1.5, 144),
  interiorWood: coverage(2.2, 2.2, 128),
  plaster: coverage(2.8, 2.8, 128),
  roof: coverage(2.2, 2.2, 144),
  soil: coverage(3, 3, 112),
  stone: coverage(2.5, 2.5, 144),
  timber: coverage(2.4, 2.4, 144)
});
function physicalTextureRepeat(role, surfaceWidth, surfaceHeight3) {
  const coverageValue = PHYSICAL_TEXTURE_COVERAGE[role] || PHYSICAL_TEXTURE_COVERAGE.stone;
  return [
    positive6(surfaceWidth) / coverageValue.metersU,
    positive6(surfaceHeight3) / coverageValue.metersV
  ];
}
function physicalTexturePolicy(role, overrides = {}) {
  const coverageValue = PHYSICAL_TEXTURE_COVERAGE[role] || PHYSICAL_TEXTURE_COVERAGE.stone;
  return Object.freeze({
    fullResolutionSource: true,
    nativeTexelDensity: true,
    physicalCoverageMeters: Object.freeze([
      coverageValue.metersU,
      coverageValue.metersV
    ]),
    preserveSourceAspect: true,
    repeatMode: "fractional-physical-coverage",
    texelsPerWorld: coverageValue.texelsPerWorld,
    uvBasis: "world-units",
    uvUnitsPerWorld: Object.freeze([1, 1]),
    ...overrides
  });
}
function coverage(metersU, metersV, texelsPerWorld) {
  return Object.freeze({ metersU, metersV, texelsPerWorld });
}
function positive6(value) {
  return Math.max(1e-3, Number(value) || 1e-3);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/DistanceMaterialPolicy.js
var ALPINE_PATHS = Object.freeze({
  mixRoof: "full-resolution/tiled roof 2.png",
  mixStone: "various/Whitewashed stone.png",
  mixWood: "full-resolution/oak wood 3.png",
  roof: "various/slate roof shingles.png",
  stone: "various/Stone retaining wall masonry.png",
  wood: "various/Rough weathered oak wood planks.png"
});
var ALPINE_URLS = Object.freeze(Object.fromEntries(
  Object.entries(ALPINE_PATHS).map(([role, path]) => [role, exactMaterialUrl(path)])
));
var TIER_ANISOTROPY = Object.freeze({
  far: 4,
  medium: 6,
  near: 8
});
var POLICIES = Object.freeze({
  far: createPolicy("far"),
  medium: createPolicy("medium"),
  near: createPolicy("near")
});
function villageMaterialPolicy(detail = "near", _variant = 0) {
  return POLICIES[TIER_ANISOTROPY[detail] ? detail : "near"];
}
function cottageMaterialRepeat(_detail = "near", surface = "wall", dimensions = {}) {
  if (surface === "roof") {
    const slopeLength = Math.hypot(
      (Number(dimensions.width) || 7) / 2,
      Number(dimensions.roofRise) || 2.4
    ) * 2;
    return physicalTextureRepeat(
      "roof",
      slopeLength,
      Number(dimensions.depth) || 6
    );
  }
  return physicalTextureRepeat(
    "stone",
    Math.max(Number(dimensions.width) || 7, Number(dimensions.depth) || 6),
    Number(dimensions.wallHeight) || 5
  );
}
function createPolicy(tier) {
  return Object.freeze({
    ...ALPINE_URLS,
    anisotropy: TIER_ANISOTROPY[tier],
    texturePolicy: physicalTexturePolicy("stone", {
      distanceSelected: true,
      materialSet: "alpine-stone-slate-timber-v3",
      publicFirebase: true,
      samplersPerSurface: 2,
      uniqueVillageUrlBudget: Object.keys(ALPINE_URLS).length,
      visualVariationSource: "geometry-weathering-ornament-placement"
    })
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageCottageEnvelopeGeometry.js
var RETAINING_FOUNDATION = "retaining-plinth";
var STEPPED_FOUNDATION = "stepped-stone";
var STEPPED_TIERS = Object.freeze([
  Object.freeze({ bottom: 0, chamfer: 0.34, expansion: 0.22, top: 0.34 }),
  Object.freeze({ bottom: 0.34, chamfer: 0.3, expansion: 0.15, top: 0.68 }),
  Object.freeze({ bottom: 0.68, chamfer: 0.26, expansion: 0.08, top: 1 })
]);
function createVillageCottageEnvelope(options, materials, userData) {
  const geometry = createEnvelopeGeometry(options);
  return {
    anisotropy: materials.anisotropy,
    color: "#b8aa91",
    doubleSided: true,
    faces: geometry.faces,
    id: `Awtsmoos_${options.id}`,
    mapRepeat: options.wallRepeat,
    mixPatchScale: 0.07,
    mixPatchSharpness: 0.5,
    mixRepeat: options.wallRepeat,
    mixStrength: 0.3,
    mixTextureUrl: materials.mixStone,
    position: { x: 0, y: 0, z: 0 },
    shape: "manual",
    solid: true,
    texturePolicy: materials.texturePolicy,
    textureUrl: materials.stone,
    userData: {
      ...userData,
      entranceOpening: geometry.entranceOpening,
      foundationHeight: geometry.foundationHeight,
      foundationStyle: geometry.foundationStyle,
      foundationTiers: geometry.foundationTiers,
      part: "stone-plinth-and-open-recessed-wall-envelope",
      recessDepth: geometry.recessDepth
    },
    vertices: geometry.vertices
  };
}
function createEnvelopeGeometry(options) {
  const mesh2 = { faces: [], vertices: [] };
  const halfWidth = options.width / 2;
  const halfDepth = options.depth / 2;
  const foundationHeight = Math.min(0.9, Math.max(0.62, options.wallHeight * 0.16));
  const foundationStyle = resolveFoundationStyle(options.foundationStyle);
  const foundationTiers = appendFoundation(mesh2, options, halfWidth, halfDepth, foundationHeight, foundationStyle);
  const recessDepth = options.detail === "far" ? 0.24 : 0.56;
  const wallWidth = halfWidth - 0.14;
  const wallDepth = halfDepth - 0.1;
  const doorwayHalf = Math.min(0.86, wallWidth * 0.2);
  const doorHeight = Math.min(2.35, options.storyHeight ? options.storyHeight * 0.73 : 2.25);
  appendPrism(mesh2, chamferedRing(wallWidth, wallDepth - recessDepth, 0.4), foundationHeight, options.wallHeight, options, 4);
  appendFrontPier(mesh2, -wallWidth, -doorwayHalf, wallDepth, recessDepth, foundationHeight, options);
  appendFrontPier(mesh2, doorwayHalf, wallWidth, wallDepth, recessDepth, foundationHeight, options);
  appendFrontLintel(mesh2, doorwayHalf, wallDepth, recessDepth, foundationHeight + doorHeight, options);
  return {
    ...mesh2,
    entranceOpening: Object.freeze({ height: doorHeight, width: doorwayHalf * 2 }),
    foundationHeight,
    foundationStyle,
    foundationTiers,
    recessDepth
  };
}
function appendFoundation(mesh2, options, halfWidth, halfDepth, height, style) {
  const tiers = style === STEPPED_FOUNDATION ? STEPPED_TIERS : [{ bottom: 0, chamfer: 0.34, expansion: 0.22, top: 1 }];
  for (let index = 0; index < tiers.length; index += 1) {
    const tier = tiers[index];
    appendPrism(
      mesh2,
      chamferedRing(halfWidth + tier.expansion, halfDepth + tier.expansion, tier.chamfer),
      height * tier.bottom,
      height * tier.top,
      options,
      -1,
      index === 0
    );
  }
  return tiers.length;
}
function resolveFoundationStyle(style) {
  return style === STEPPED_FOUNDATION ? STEPPED_FOUNDATION : RETAINING_FOUNDATION;
}
function appendFrontPier(mesh2, startX, endX, frontZ, depth, bottom, options) {
  appendPrism(mesh2, rectangle(startX, endX, frontZ - depth, frontZ), bottom, options.wallHeight, options);
}
function appendFrontLintel(mesh2, halfWidth, frontZ, depth, bottom, options) {
  appendPrism(mesh2, rectangle(-halfWidth, halfWidth, frontZ - depth, frontZ), bottom, options.wallHeight, options);
}
function rectangle(startX, endX, backZ, frontZ) {
  return [[startX, backZ], [endX, backZ], [endX, frontZ], [startX, frontZ]];
}
function chamferedRing(width, depth, chamfer) {
  return [
    [-width + chamfer, -depth],
    [width - chamfer, -depth],
    [width, -depth + chamfer],
    [width, depth - chamfer],
    [width - chamfer, depth],
    [-width + chamfer, depth],
    [-width, depth - chamfer],
    [-width, -depth + chamfer]
  ];
}
function appendPrism(mesh2, ring, bottom, top, options, skippedSide = -1, includeBottom = true) {
  const first = mesh2.vertices.length;
  for (const [x, z] of ring) mesh2.vertices.push(worldPoint3(x, bottom, z, options));
  for (const [x, z] of ring) mesh2.vertices.push(worldPoint3(x, top, z, options));
  const count = ring.length;
  if (includeBottom) mesh2.faces.push(Array.from({ length: count }, (_value, index) => first + count - index - 1));
  mesh2.faces.push(Array.from({ length: count }, (_value, index) => first + count + index));
  for (let index = 0; index < count; index += 1) {
    if (index === skippedSide) continue;
    const next = (index + 1) % count;
    mesh2.faces.push([first + index, first + next, first + count + next, first + count + index]);
  }
}
function worldPoint3(localX, localY, localZ, options) {
  const cosine = Math.cos(options.yaw);
  const sine = Math.sin(options.yaw);
  return [
    options.x + localX * cosine + localZ * sine,
    options.base + localY,
    options.z - localX * sine + localZ * cosine
  ];
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageCottageFoundationEnvelope.js
var PLINTH_EXPANSION = 0.44;
function cottageFoundationFootprint(options) {
  return Object.freeze({
    depth: Number(options.depth) + PLINTH_EXPANSION,
    width: Number(options.width) + PLINTH_EXPANSION,
    x: Number(options.x),
    yaw: Number(options.yaw) || 0,
    z: Number(options.z)
  });
}
function cottageFoundationEnvelope(options) {
  return Object.freeze({
    ...cottageFoundationFootprint(options),
    bottom: Number(options.base)
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageCottageInteriorLayout.js
var DOOR_WIDTH = 1.44;
var WALL_THICKNESS = 0.18;
function villageCottageInteriorLayout(options) {
  const doors = [];
  const rooms = [];
  const walls = [];
  for (let story = 0; story < options.stories; story += 1) {
    appendStory(options, story, walls, doors, rooms);
  }
  return Object.freeze({
    doors: Object.freeze(doors),
    rooms: Object.freeze(rooms),
    walls: Object.freeze(walls)
  });
}
function appendStory(options, story, walls, doors, rooms) {
  const floorY = options.base + story * options.storyHeight + 0.08;
  const wallHeight = options.storyHeight - 0.32;
  const wallCenterY = floorY + options.storyHeight * 0.48;
  const doorHeight = Math.min(2.25, options.storyHeight - 0.48);
  const xSpan = options.width - 1.1;
  const zSpan = options.depth - 1.1;
  appendPartition(options, story, "x", xSpan, floorY, wallCenterY, wallHeight, doorHeight, walls, doors);
  appendPartition(options, story, "z", zSpan, floorY, wallCenterY, wallHeight, doorHeight, walls, doors);
  appendRooms(options, story, floorY, rooms);
}
function appendPartition(options, story, axis, span, floorY, wallY, wallHeight, doorHeight, walls, doors) {
  const centers = [-span * 0.24, span * 0.24];
  const halfDoor = DOOR_WIDTH / 2;
  const boundaries = [
    -span / 2,
    centers[0] - halfDoor,
    centers[0] + halfDoor,
    centers[1] - halfDoor,
    centers[1] + halfDoor,
    span / 2
  ];
  for (const [start, end] of [[boundaries[0], boundaries[1]], [boundaries[2], boundaries[3]], [boundaries[4], boundaries[5]]]) {
    walls.push(wallBox(options, axis, (start + end) / 2, wallY, end - start, wallHeight));
  }
  const wallTop = wallY + wallHeight / 2;
  for (let index = 0; index < centers.length; index += 1) {
    const center = centers[index];
    const lintelHeight = Math.max(0.2, wallTop - (floorY + doorHeight));
    walls.push(wallBox(options, axis, center, wallTop - lintelHeight / 2, DOOR_WIDTH, lintelHeight));
    doors.push(doorRecord(options, story, axis, index, center, floorY, doorHeight));
  }
}
function appendRooms(options, story, floorY, rooms) {
  const coordinates = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
  for (let index = 0; index < coordinates.length; index += 1) {
    const [sideX, sideZ] = coordinates[index];
    const sequence = story * 4 + index;
    const purpose = options.roomTypes?.[sequence] || options.roomTypes?.[sequence % Math.max(1, options.roomTypes.length)] || "living-room";
    rooms.push(Object.freeze({
      center: worldPoint4(options, sideX * options.width * 0.24, floorY, sideZ * options.depth * 0.24),
      houseId: options.id,
      id: `${options.id}-room-${sequence + 1}`,
      purpose,
      story
    }));
  }
}
function wallBox(options, axis, offset, y, span, height) {
  const localX = axis === "x" ? offset : 0;
  const localZ = axis === "z" ? offset : 0;
  return Object.freeze({
    position: worldPoint4(options, localX, y, localZ),
    size: {
      x: axis === "x" ? span : WALL_THICKNESS,
      y: height,
      z: axis === "z" ? span : WALL_THICKNESS
    },
    yaw: options.yaw
  });
}
function doorRecord(options, story, axis, index, offset, bottomY, height) {
  const point3 = worldPoint4(options, axis === "x" ? offset : 0, bottomY, axis === "z" ? offset : 0);
  return Object.freeze({
    bottomY,
    height,
    houseId: options.id,
    id: `${options.id}-interior-${story + 1}-${axis}-${index + 1}`,
    story,
    width: DOOR_WIDTH,
    x: point3.x,
    yaw: options.yaw + (axis === "z" ? Math.PI / 2 : 0),
    z: point3.z
  });
}
function worldPoint4(options, localX, y, localZ) {
  const cosine = Math.cos(options.yaw);
  const sine = Math.sin(options.yaw);
  return {
    x: options.x + localX * cosine + localZ * sine,
    y,
    z: options.z - localX * sine + localZ * cosine
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageCottageInteriorGeometry.js
function createVillageCottageInterior(options, materials) {
  const layout = villageCottageInteriorLayout(options);
  const boxes = [...layout.walls];
  for (let story = 0; story < options.stories; story += 1) {
    boxes.push(floorBox(options, story));
  }
  const definition4 = createVillageBoxBatch(`cottage-interior-${options.id}`, boxes, {
    color: "#76563d",
    family: "canonical-cottage-interior",
    part: "floors-partitions-and-door-openings",
    texturePolicy: {
      role: "cottage-interior-timber",
      sameOrigin: true,
      shader: "physical-room-surface",
      tileWorld: 1.2
    },
    textureUrl: materials.wood
  });
  definition4.userData.doorOpenings = layout.doors.length;
  definition4.userData.houseId = options.id;
  definition4.userData.interiorDoorIds = layout.doors.map((door) => door.id);
  definition4.userData.occupantCapacity = options.roomCapacity;
  definition4.userData.roomCount = layout.rooms.length;
  definition4.userData.rooms = layout.rooms;
  return definition4;
}
function floorBox(options, story) {
  return {
    position: worldPoint5(options, 0, options.base + story * options.storyHeight + 0.08, 0),
    size: { x: options.width - 0.8, y: 0.16, z: options.depth - 0.8 },
    yaw: options.yaw
  };
}
function worldPoint5(options, localX, y, localZ) {
  const cosine = Math.cos(options.yaw);
  const sine = Math.sin(options.yaw);
  return {
    x: options.x + localX * cosine + localZ * sine,
    y,
    z: options.z - localX * sine + localZ * cosine
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageRoofWeatheringPolicy.js
function villageRoofWeatheringPolicy(id) {
  const seed = stableSeed(String(id || "cottage"));
  const age = 0.25 + fraction(seed, 17) * 0.7;
  return Object.freeze({
    age: Number(age.toFixed(3)),
    mixPatchScale: Number((0.038 + fraction(seed, 29) * 0.045).toFixed(4)),
    mixPatchSharpness: Number((0.36 + fraction(seed, 43) * 0.28).toFixed(3)),
    mixStrength: Number((0.16 + age * 0.2).toFixed(3)),
    repairBand: seed % 4,
    weatherExposure: Number((0.3 + fraction(seed, 71) * 0.65).toFixed(3))
  });
}
function stableSeed(value) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
function fraction(seed, salt) {
  const mixed = Math.imul(seed ^ salt, 2246822519) >>> 0;
  return mixed % 1e4 / 9999;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageCottageRoofGeometry.js
function createVillageCottageRoof(options) {
  const halfWidth = (options.width + 1.45) / 2;
  const halfDepth = (options.depth + 1.35) / 2;
  const thickness = 0.34;
  const weathering = villageRoofWeatheringPolicy(options.id);
  const geometry = roofGeometry(
    halfWidth,
    halfDepth,
    options.roofRise,
    thickness,
    options.texturePolicy?.tileWorld
  );
  return {
    color: "#4f4a43",
    doubleSided: true,
    faces: geometry.faces,
    id: `Awtsmoos_${options.id}-roof`,
    mapRepeat: options.mapRepeat,
    mixPatchScale: weathering.mixPatchScale,
    mixPatchSharpness: weathering.mixPatchSharpness,
    mixRepeat: options.mapRepeat,
    mixStrength: weathering.mixStrength,
    mixTextureUrl: options.mixTextureUrl,
    position: { x: 0, y: 0, z: 0 },
    shape: "manual",
    solid: true,
    texturePolicy: options.texturePolicy,
    textureUrl: options.textureUrl,
    userData: {
      AwtsmoosLod: { className: "architecture" },
      family: "reference-village-cottage-roof",
      part: "closed-ridge-roof",
      roofAge: weathering.age,
      roofRepairBand: weathering.repairBand,
      roofThickness: thickness,
      weatherExposure: weathering.weatherExposure
    },
    uvs: geometry.uvs,
    vertices: geometry.vertices.map((point3) => worldPoint6(point3, options))
  };
}
function roofGeometry(width, depth, rise, thickness, tileWorld) {
  const tile = Math.max(0.25, tileWorld || 4);
  const slope = Math.hypot(width, rise);
  const mesh2 = { faces: [], uvs: [], vertices: [] };
  const point3 = {
    backLeft: [-width, 0, -depth],
    backRight: [width, 0, -depth],
    backRidge: [0, rise, -depth],
    frontLeft: [-width, 0, depth],
    frontRight: [width, 0, depth],
    frontRidge: [0, rise, depth],
    lowerBackLeft: [-width, -thickness, -depth],
    lowerBackRight: [width, -thickness, -depth],
    lowerFrontLeft: [-width, -thickness, depth],
    lowerFrontRight: [width, -thickness, depth]
  };
  appendFace3(
    mesh2,
    [point3.backLeft, point3.frontLeft, point3.frontRidge, point3.backRidge],
    tile,
    ([x, y, z]) => [z, (x * width + y * rise) / slope]
  );
  appendFace3(
    mesh2,
    [point3.backRidge, point3.frontRidge, point3.frontRight, point3.backRight],
    tile,
    ([x, y, z]) => [z, (x * width - y * rise) / slope]
  );
  appendFace3(mesh2, [point3.backLeft, point3.backRidge, point3.backRight], tile, ([x, y]) => [x, y]);
  appendFace3(mesh2, [point3.frontLeft, point3.frontRight, point3.frontRidge], tile, ([x, y]) => [x, y]);
  appendFace3(
    mesh2,
    [point3.lowerBackLeft, point3.lowerBackRight, point3.lowerFrontRight, point3.lowerFrontLeft],
    tile,
    ([x, _y, z]) => [x, z]
  );
  appendFace3(
    mesh2,
    [point3.backLeft, point3.backRight, point3.lowerBackRight, point3.lowerBackLeft],
    tile,
    ([x, y]) => [x, y]
  );
  appendFace3(
    mesh2,
    [point3.frontLeft, point3.lowerFrontLeft, point3.lowerFrontRight, point3.frontRight],
    tile,
    ([x, y]) => [x, y]
  );
  appendFace3(
    mesh2,
    [point3.backLeft, point3.lowerBackLeft, point3.lowerFrontLeft, point3.frontLeft],
    tile,
    ([_x, y, z]) => [z, y]
  );
  appendFace3(
    mesh2,
    [point3.backRight, point3.frontRight, point3.lowerFrontRight, point3.lowerBackRight],
    tile,
    ([_x, y, z]) => [z, y]
  );
  return mesh2;
}
function appendFace3(mesh2, points, tile, project) {
  const first = mesh2.vertices.length;
  const projected = points.map(project);
  const minU = Math.min(...projected.map(([u]) => u));
  const minV = Math.min(...projected.map(([, value]) => value));
  points.forEach((point3, index) => {
    mesh2.vertices.push(point3);
    mesh2.uvs.push((projected[index][0] - minU) / tile, (projected[index][1] - minV) / tile);
  });
  mesh2.faces.push(points.map((_point, index) => first + index));
}
function worldPoint6(point3, options) {
  const cosine = Math.cos(options.yaw);
  const sine = Math.sin(options.yaw);
  return [
    options.x + point3[0] * cosine + point3[2] * sine,
    options.base + options.wallHeight + point3[1],
    options.z - point3[0] * sine + point3[2] * cosine
  ];
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageCottageScalePolicy.js?v=20260721-expanded-interiors-01
var PLAYER_RADIUS2 = 0.38;
var PLAYER_HEIGHT2 = 1.72;
var FORMER_BASE_VOLUME3 = 7.6 * 5.9 * 5.5;
var MINIMUM_EXPANSION2 = 10;
var BASE_WIDTH2 = 19.2;
var BASE_DEPTH2 = 15.4;
var STORIES2 = 3;
function villageCottageScalePolicy2(detail = "near", variant = 0) {
  const safeVariant = Math.abs(Number(variant) || 0);
  const width = BASE_WIDTH2 + safeVariant % 3 * 1.2;
  const depth = BASE_DEPTH2 + safeVariant % 2 * 1.1;
  const storyHeight = detail === "far" ? 3.15 : 3.3;
  const wallHeight = STORIES2 * storyHeight;
  const roofRise = 5.1 + safeVariant % 3 * 0.35;
  const volume = width * depth * wallHeight;
  const expansionRatio = volume / FORMER_BASE_VOLUME3;
  if (expansionRatio < MINIMUM_EXPANSION2) {
    throw new Error(
      `Cottage expansion ${expansionRatio.toFixed(1)}x is below ${MINIMUM_EXPANSION2}x.`
    );
  }
  return Object.freeze({
    depth,
    expansionRatio,
    minimumExpansion: MINIMUM_EXPANSION2,
    roofRise,
    stories: STORIES2,
    storyHeight,
    volume,
    volumeRatio: volume / playerReferenceVolume2(),
    wallHeight,
    width
  });
}
function playerReferenceVolume2() {
  const cylinderHeight = Math.max(0, PLAYER_HEIGHT2 - PLAYER_RADIUS2 * 2);
  const cylinder = Math.PI * PLAYER_RADIUS2 ** 2 * cylinderHeight;
  const sphere = 4 / 3 * Math.PI * PLAYER_RADIUS2 ** 3;
  return cylinder + sphere;
}
function cottageRoomCapacity(scale3) {
  const roomArea = 22;
  const usableArea = scale3.width * scale3.depth * 0.72 * scale3.stories;
  return Math.max(12, Math.floor(usableArea / roomArea));
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageCottageDefinitionFactory.js?v=20260721-authored-houses-01
function createVillageCottageDefinitions(options) {
  const fallbackScale = villageCottageScalePolicy2(options.detail, options.variant);
  const materials = villageMaterialPolicy(options.detail, options.variant);
  const common = createCommonOptions(options, fallbackScale, materials);
  const roofRepeat = cottageMaterialRepeat(options.detail, "roof", common);
  common.roomCapacity = cottageRoomCapacity(common);
  return {
    definitions: [
      createVillageCottageEnvelope(common, materials, createCottageMetadata(common)),
      createVillageCottageInterior(common, materials),
      createVillageCottageRoof({
        ...common,
        mapRepeat: roofRepeat,
        mixRepeat: roofRepeat,
        mixTextureUrl: materials.mixRoof,
        textureUrl: materials.roof
      })
    ],
    facade: common,
    scale: structuralScale(common)
  };
}
function createCommonOptions(options, fallbackScale, materials) {
  const common = {
    ...fallbackScale,
    ...options,
    texturePolicy: materials.texturePolicy
  };
  return { ...common, wallRepeat: cottageMaterialRepeat(options.detail, "wall", common) };
}
function createCottageMetadata(options) {
  return {
    AwtsmoosLod: { className: "architecture" },
    ...canonicalIdentity(options.id),
    archetype: options.archetype || "three-story-house",
    expansionRatio: Number(options.expansionRatio.toFixed(2)),
    exterior: exteriorMetadata(options),
    family: "reference-village-district",
    foundationEnvelope: cottageFoundationEnvelope(options),
    houseNumber: options.number || null,
    physicalTextureRepeat: options.wallRepeat,
    roomCapacity: options.roomCapacity,
    roomPurposes: [...options.roomTypes || []],
    stories: options.stories,
    volumeRatio: Number(options.volumeRatio.toFixed(1))
  };
}
function canonicalIdentity(id) {
  if (!isCanonicalVillageId(id)) return {};
  return { canonicalId: id, houseId: id };
}
function exteriorMetadata(options) {
  return {
    balcony: Boolean(options.balcony),
    chimney: options.chimney !== false,
    foundationStyle: options.foundationStyle || "stone-plinth",
    gardenType: options.gardenType || "flowers",
    porch: options.porch !== false,
    roofMaterial: options.roofMaterial || "slate",
    windowPattern: options.windowPattern || "paired"
  };
}
function structuralScale(options) {
  return Object.freeze({
    depth: options.depth,
    roofRise: options.roofRise,
    stories: options.stories,
    storyHeight: options.storyHeight,
    wallHeight: options.wallHeight,
    width: options.width
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageDistrictPlacement.js
function villageDistrictPlacements(district2, cottageCount) {
  const explicit = district2.houseIds.map((houseId) => CANONICAL_HOUSES_BY_ID[houseId]).filter(Boolean).map((house2) => Object.freeze({ ...house2, houseId: house2.id }));
  const placements = explicit.slice(0, cottageCount);
  for (let index = placements.length; index < cottageCount; index += 1) {
    placements.push(infillPlacement(district2, index, cottageCount));
  }
  return placements;
}
function infillPlacement(district2, index, count) {
  const angle = district2.phase + index / Math.max(1, count) * Math.PI * 2;
  const radialScale = index % 2 === 0 ? 0.58 : 0.82;
  return Object.freeze({
    houseId: null,
    x: district2.center[0] + Math.cos(angle) * district2.radius[0] * radialScale,
    yaw: angle + Math.PI,
    z: district2.center[1] + Math.sin(angle) * district2.radius[1] * radialScale
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageDistrictConstruction.js?v=20260720-canonical-valley-pass-04
function appendVillageDistrict(output, collectors, district2, groundSampler, quality) {
  const policy2 = architectureDistrictPolicy(district2, quality);
  const placements = villageDistrictPlacements(district2, policy2.cottages);
  placements.forEach((placement2, index) => appendCottage(
    output,
    collectors,
    district2,
    placement2,
    policy2,
    groundSampler,
    index
  ));
  if (district2.id === "arrival-meadow") return 0;
  const base = landmarkBaseHeight(district2, groundSampler);
  const landmarks = createCanonicalLandmarkDefinitions({
    base,
    detail: policy2.detail,
    district: district2,
    groundSampler,
    materials: villageMaterialPolicy(policy2.detail)
  });
  output.push(...landmarks);
  return landmarks.length;
}
function appendCottage(output, collectors, district2, placement2, policy2, groundSampler, index) {
  const variant = placement2.variant ?? index + Math.round(district2.phase * 10);
  const id = placement2.houseId || `${district2.id}-cottage-${index}`;
  const fallbackScale = villageCottageScalePolicy2(policy2.detail, variant);
  const footprint2 = cottageFoundationFootprint({ ...fallbackScale, ...placement2 });
  const base = canonicalFoundationTopHeight(id, groundSampler, placement2.x, placement2.z, footprint2);
  const cottage = createVillageCottageDefinitions({
    ...placement2,
    base,
    detail: policy2.detail,
    id,
    variant
  });
  output.push(...cottage.definitions);
  appendCottageDetails(collectors.details, cottage.facade);
  appendCottageOrnaments(collectors.ornaments, cottage.facade);
  appendCottageShadow(collectors.shadows, cottage.facade);
}
function landmarkBaseHeight(district2, groundSampler) {
  const id = district2.landmarkId;
  if (!id) return villageGroundHeight(groundSampler, district2.center[0], district2.center[1]);
  return canonicalFoundationTopHeight(id, groundSampler, district2.center[0], district2.center[1]);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/CanonicalVillageBiomes.js
var CANONICAL_VILLAGE_BIOMES = Object.freeze([
  biome("dense-north-forest", "dense-forest", 2, -105, 122, 72, 0.72),
  biome("west-old-growth", "dense-forest", -135, -22, 68, 120, 0.82),
  biome("east-rock-forest", "rocky-woodland", 135, -20, 72, 122, 0.58),
  biome("arrival-meadow", "flower-meadow", 0, 82, 36, 30, 0.28),
  biome("market-clearing", "village-ground", -26, 12, 31, 23, 0.18),
  biome("shul-garden", "terrace-garden", -34, -24, 27, 21, 0.42),
  biome("river-corridor", "wet-riverbank", 17, 35, 24, 105, 0.95),
  biome("waterfall-cliffs", "wet-rock", 51, -44, 31, 28, 1),
  biome("farm-terraces", "cultivated", 43, 42, 34, 28, 0.34),
  biome("south-bank-clearings", "open-woodland", 70, 78, 70, 62, 0.38)
]);
function biome(id, type, x, z, radiusX, radiusZ, moisture) {
  return Object.freeze({ id, moisture, radiusX, radiusZ, type, x, z });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/CanonicalVillageCameras.js
var CANONICAL_VILLAGE_CAMERAS = Object.freeze([
  camera("arrival-hero", [-5, 5.2, 121], [9, 7, 27], 62),
  camera("master-top-down", [4, 245, 24], [4, 0, 24], 48),
  camera("north", [4, 118, -205], [4, 8, 20], 48),
  camera("northeast", [165, 118, -160], [4, 8, 20], 48),
  camera("east", [215, 108, 18], [4, 8, 20], 48),
  camera("southeast", [165, 108, 185], [4, 8, 20], 48),
  camera("south", [4, 112, 225], [4, 8, 20], 48),
  camera("southwest", [-175, 108, 180], [4, 8, 20], 48),
  camera("west", [-220, 108, 18], [4, 8, 20], 48),
  camera("northwest", [-175, 118, -165], [4, 8, 20], 48),
  camera("market-eye", [-43, 10, 28], [-24, 7, 11], 58),
  camera("shul-terrace", [-51, 14, -2], [-34, 10, -24], 55),
  camera("bridge-riverbank", [-8, 8, 22], [18, 7, 7], 56),
  camera("waterfall-portal", [25, 15, -18], [51, 13, -45], 52),
  camera("cottage-exterior", [-33, 8, 65], [-24, 6, 57], 52),
  camera("cottage-interior", [-23, 4.5, 57], [-20, 4, 52], 62)
]);
var CANONICAL_CAMERAS_BY_ID = Object.freeze(Object.fromEntries(
  CANONICAL_VILLAGE_CAMERAS.map((definition4) => [definition4.id, definition4])
));
function camera(id, position, target, fov) {
  return Object.freeze({
    fov,
    id,
    position: vector(position),
    target: vector(target)
  });
}
function vector([x, y, z]) {
  return Object.freeze({ x, y, z });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/CanonicalVillagePlan.js
var CANONICAL_VILLAGE_LANDMARKS = Object.freeze({
  beisChabad: marker(-35, 45, "BEIS01"),
  bridge: marker(18, 7, "BRIDGE01"),
  entrance: marker(VILLAGE_ARRIVAL_ENTRANCE.x, VILLAGE_ARRIVAL_ENTRANCE.z, "ENTR01"),
  forestSign: marker(-8, 52, "FOREST_SIGN"),
  lake: Object.freeze({ id: "LAKE01", radiusX: 12.5, radiusZ: 25, x: 15, z: 62 }),
  learningSign: marker(-7, 48, "LEARNING_SIGN"),
  market: marker(-26, 12, "MARKET01"),
  plaza: Object.freeze({ id: "PLAZA01", radius: 10, x: -12, z: 14 }),
  portal: marker(56, -49, "PORTAL01"),
  shul: marker(-34, -24, "SHUL01"),
  waterfall: marker(49, -42, "WATERFALL01"),
  well: marker(-8, 20, "WELL01")
});
var CANONICAL_VILLAGE_DISTRICTS = Object.freeze([
  district("arrival-meadow", "meadow", [0, 72], [24, 20], "near", 0.2, ["H10", "H11"]),
  district("beis-chabad-terrace", "herb", [-35, 45], [18, 14], "near", 0.72, ["H12", "H13"], "BEIS01"),
  district("market-quarter", "formal", [-26, 12], [22, 16], "near", 1.22, ["H14", "H15", "H16"], "MARKET01"),
  district("shul-terrace", "cottage", [-34, -24], [20, 15], "near", 1.74, ["H17", "H18"], "SHUL01"),
  district("upper-residential", "cottage", [-8, -36], [22, 16], "medium", 2.18, ["H19", "H20"]),
  district("north-slope-residential", "woodland", [18, -48], [22, 15], "far", 2.62, ["H21", "H22"]),
  district("east-bank-homes", "cottage", [38, 4], [18, 16], "medium", 3.08, ["H23", "H24"]),
  district("waterfall-portal", "rock-garden", [52, -42], [15, 13], "far", 3.46, ["H25"], "PORTAL01"),
  district("farm-terraces", "meadow", [43, 39], [21, 17], "far", 3.88, ["H26"]),
  district("riverfront-gardens", "water-edge", [-5, 36], [18, 15], "medium", 4.28, ["H27"])
]);
var CANONICAL_VILLAGE_CLEARINGS = Object.freeze([
  ...VILLAGE_ARRIVAL_CLEARINGS,
  clearing("beis-chabad-courtyard", -35, 45, 9),
  clearing("market-square", -26, 12, 12),
  clearing("shul-courtyard", -34, -24, 10),
  clearing("bridge-approach", 10, 10, 9),
  clearing("portal-terrace", 56, -49, 8),
  clearing("farm-crossing", 43, 39, 8),
  clearing("riverfront-path", -5, 36, 8)
]);
var CANONICAL_VILLAGE_PLAN = Object.freeze({
  biomes: CANONICAL_VILLAGE_BIOMES,
  cameras: CANONICAL_VILLAGE_CAMERAS,
  clearings: CANONICAL_VILLAGE_CLEARINGS,
  districts: CANONICAL_VILLAGE_DISTRICTS,
  footprints: CANONICAL_VILLAGE_FOOTPRINTS,
  houses: CANONICAL_VILLAGE_HOUSES,
  identifiers: CANONICAL_VILLAGE_IDS,
  landmarks: CANONICAL_VILLAGE_LANDMARKS,
  river: Object.freeze({
    cascades: CANONICAL_RIVER_CASCADES,
    controlPoints: CANONICAL_RIVER_CONTROL_POINTS,
    lakeIndex: CANONICAL_RIVER_LAKE_INDEX
  }),
  roads: Object.freeze({
    evidence: canonicalRoadNetworkEvidence(),
    routes: Object.freeze(canonicalVillageRoadRoutes())
  }),
  version: "2026.07-canonical-alpine-village"
});
function district(id, habitat, center, radius, detail, phase, houseIds, landmarkId = null) {
  return Object.freeze({
    center: Object.freeze(center),
    detail,
    habitat,
    houseIds: Object.freeze(houseIds),
    id,
    landmarkId,
    phase,
    radius: Object.freeze(radius)
  });
}
function clearing(id, x, z, radius) {
  return Object.freeze({ id, radius, x, z });
}
function marker(x, z, id) {
  return Object.freeze({ id, x, z });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageDistrictCatalog.js
var VILLAGE_DISTRICTS = CANONICAL_VILLAGE_DISTRICTS;

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageDistrictSelection.js
var REQUIRED_LANDMARK_IDS = Object.freeze([
  "BEIS01",
  "MARKET01",
  "PORTAL01",
  "SHUL01"
]);
function selectVillageDistricts(districts, requestedCount) {
  const required = districts.filter(isRequiredDistrict);
  const targetCount = Math.max(
    Number(requestedCount) || 0,
    required.length
  );
  const selectedIds = new Set(required.map((district2) => district2.id));
  for (const district2 of districts) {
    if (selectedIds.size >= targetCount) {
      break;
    }
    selectedIds.add(district2.id);
  }
  return Object.freeze(
    districts.filter((district2) => selectedIds.has(district2.id))
  );
}
function isRequiredDistrict(district2) {
  return district2.id === "arrival-meadow" || REQUIRED_LANDMARK_IDS.includes(district2.landmarkId);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageDistrictArchitecture.js?v=20260720-canonical-valley-pass-04
function createVillageDistrictArchitecture(groundSampler, quality = "high") {
  const budget3 = villageWorldBudget(quality);
  const districts = selectVillageDistricts(
    VILLAGE_DISTRICTS,
    budget3.districts
  );
  const collectors = createCollectors();
  const definitions = [];
  let landmarkPieces = 0;
  for (const district2 of districts) {
    landmarkPieces += appendVillageDistrict(
      definitions,
      collectors,
      district2,
      groundSampler,
      quality
    );
  }
  appendBatchedCottageDetails(definitions, collectors);
  assertArchitectureBudget(definitions, budget3);
  definitions.stats = architectureStats(
    definitions,
    collectors,
    districts,
    budget3,
    quality,
    landmarkPieces
  );
  return definitions;
}
function createCollectors() {
  return {
    details: createCottageDetailCollector(),
    ornaments: createCottageOrnamentCollector(),
    shadows: createCottageShadowCollector()
  };
}
function appendBatchedCottageDetails(output, collectors) {
  output.push(...createCottageDetailBatches(collectors.details));
  output.push(...createCottageOrnamentBatches(collectors.ornaments));
  const shadowBatch = createCottageShadowBatch(collectors.shadows);
  if (shadowBatch) {
    output.push(shadowBatch);
  }
}
function assertArchitectureBudget(definitions, budget3) {
  if (definitions.length <= budget3.architecturePieces) {
    return;
  }
  throw new Error(
    `Architecture budget ${budget3.architecturePieces} is below ${definitions.length}.`
  );
}
function architectureStats(definitions, collectors, districts, budget3, quality, landmarkPieces) {
  return {
    districtIds: districts.map((district2) => district2.id),
    districts: districts.length,
    landmarkPieces,
    pieces: definitions.length,
    quality,
    radius: budget3.radius,
    shadowDraws: collectors.shadows.length > 0 ? 1 : 0,
    shadowedCottages: collectors.shadows.length,
    warmWindows: collectors.details.windows.length
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageBushBatchGeometry.js
var BUSH_COLORS = Object.freeze(["#356b3b", "#417f49", "#5d8c4f"]);
var BUSH_COUNT = 24;
function createBushBatchDefinitions(groundSampler) {
  const batches = BUSH_COLORS.map(emptyGeometry2);
  for (let index = 0; index < BUSH_COUNT; index += 1) {
    const center = bushCenter(index, groundSampler);
    const radius = 0.75 + index % 3 * 0.15;
    appendBush(batches[index % batches.length], center, radius, index);
  }
  return batches.map((geometry, index) => batchDefinition(
    geometry,
    index,
    BUSH_COLORS[index]
  ));
}
function bushBatchStats(definitions) {
  return definitions.reduce((summary, definition4) => {
    summary.batches += 1;
    summary.instances += definition4.userData?.instances || 0;
    summary.triangles += definition4.faces.length;
    return summary;
  }, { batches: 0, instances: 0, triangles: 0 });
}
function bushCenter(index, groundSampler) {
  const angle = index / BUSH_COUNT * Math.PI * 2;
  const radialDistance = 18 + index % 4 * 6.2;
  const x = Math.cos(angle) * radialDistance;
  const z = Math.sin(angle) * radialDistance * 0.72 + 3;
  return {
    x,
    y: villageGroundHeight(groundSampler, x, z) + 0.7,
    z
  };
}
function appendBush(geometry, center, radius, seed) {
  appendOctahedron(geometry, center, radius);
  appendOctahedron(geometry, {
    x: center.x + radius * 0.42,
    y: center.y + radius * 0.18,
    z: center.z - radius * 0.18
  }, radius * (0.68 + seed % 2 * 0.05));
  appendOctahedron(geometry, {
    x: center.x - radius * 0.34,
    y: center.y + radius * 0.12,
    z: center.z + radius * 0.28
  }, radius * (0.62 + seed % 3 * 0.04));
}
function appendOctahedron(geometry, center, radius) {
  const start = geometry.vertices.length;
  geometry.vertices.push(
    [center.x, center.y + radius, center.z],
    [center.x + radius, center.y, center.z],
    [center.x, center.y, center.z + radius],
    [center.x - radius, center.y, center.z],
    [center.x, center.y, center.z - radius],
    [center.x, center.y - radius * 0.72, center.z]
  );
  for (const face2 of [
    [0, 2, 1],
    [0, 3, 2],
    [0, 4, 3],
    [0, 1, 4],
    [5, 1, 2],
    [5, 2, 3],
    [5, 3, 4],
    [5, 4, 1]
  ]) {
    geometry.faces.push(face2.map((value) => start + value));
  }
}
function batchDefinition(geometry, index, color) {
  return {
    id: `Awtsmoos_living_bush_batch_${index}`,
    shape: "manual",
    ...geometry,
    color,
    textureUrl: TEXTURE_URLS.leaves.leaf1,
    mapRepeat: [2, 2],
    doubleSided: false,
    backfaceCull: true,
    solid: false,
    noEdge: true,
    userData: {
      staticBatch: true,
      family: "village-bushes",
      instances: BUSH_COUNT / BUSH_COLORS.length,
      AwtsmoosLod: { className: "vegetation" }
    },
    texturePolicy: {
      role: "leaf-bush",
      publicFirebase: true,
      realMaterialRequired: true,
      shader: "leaf-cluster-alpha-wind"
    }
  };
}
function emptyGeometry2() {
  return { vertices: [], faces: [] };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageGardenBedGeometry.js
var BED_SEGMENTS = 12;
var GARDEN_SPECS = Object.freeze([
  { id: "Awtsmoos_garden_bed_market", x: -13, z: 6, width: 5.2, depth: 2.4, yaw: -0.12 },
  { id: "Awtsmoos_garden_bed_shul", x: 12, z: -1, width: 4.2, depth: 2.1, yaw: 0.18 },
  { id: "Awtsmoos_garden_bed_lake", x: -21, z: -12, width: 5.8, depth: 2.2, yaw: -0.24 }
]);
function createVillageGardenBedDefinitions(groundSampler) {
  return GARDEN_SPECS.map((specification, index) => {
    return createGardenBedDefinition(specification, index, groundSampler);
  });
}
function createGardenBedGeometry(width, depth, seed = 0) {
  const vertices = [];
  const faces = [];
  const topCenter = vertices.push([0, 0.1, 0]) - 1;
  const bottomCenter = vertices.push([0, -0.12, 0]) - 1;
  const topRing = [];
  const bottomRing = [];
  for (let segment2 = 0; segment2 < BED_SEGMENTS; segment2 += 1) {
    const angle = segment2 / BED_SEGMENTS * Math.PI * 2;
    const edgeVariation = 1 + Math.sin(angle * 3 + seed * 1.7) * 0.055 + Math.cos(angle * 5 - seed * 0.8) * 0.035;
    const x = Math.cos(angle) * width * 0.5 * edgeVariation;
    const z = Math.sin(angle) * depth * 0.5 * edgeVariation;
    const crown = 0.035 + Math.sin(angle * 2 + seed) * 0.018;
    topRing.push(vertices.push([x, crown, z]) - 1);
    bottomRing.push(vertices.push([x * 0.97, -0.12, z * 0.97]) - 1);
  }
  for (let segment2 = 0; segment2 < BED_SEGMENTS; segment2 += 1) {
    const next = (segment2 + 1) % BED_SEGMENTS;
    faces.push([topCenter, topRing[next], topRing[segment2]]);
    faces.push([bottomCenter, bottomRing[segment2], bottomRing[next]]);
    faces.push([
      topRing[segment2],
      topRing[next],
      bottomRing[next],
      bottomRing[segment2]
    ]);
  }
  return { faces, vertices };
}
function createGardenBedDefinition(specification, seed, groundSampler) {
  const geometry = createGardenBedGeometry(
    specification.width,
    specification.depth,
    seed
  );
  return {
    ...geometry,
    color: "#76563a",
    id: specification.id,
    mapRepeat: [3, 2],
    noEdge: true,
    position: {
      x: specification.x,
      y: villageGroundHeight(groundSampler, specification.x, specification.z) + 0.08,
      z: specification.z
    },
    rotation: { x: 0, y: specification.yaw, z: 0 },
    shape: "manual",
    solid: true,
    texturePolicy: {
      publicFirebase: true,
      realMaterialRequired: true,
      role: "garden-soil",
      shader: "rough-soil-parallax"
    },
    textureUrl: TEXTURE_URLS.terrain.tilledSoil,
    userData: {
      AwtsmoosLod: { className: "landmark" },
      family: "village-garden-bed"
    }
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageCurves.js
function normalBetween(a, b) {
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const length3 = Math.hypot(dx, dz) || 1;
  return { x: -dz / length3, z: dx / length3 };
}
function villageLandmarks() {
  return CANONICAL_VILLAGE_LANDMARKS;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageShoreStoneGeometry.js
var STONE_COUNT = 18;
var STONE_COLORS = Object.freeze(["#7d766c", "#8b8174", "#69685f"]);
var RING_SEGMENTS = 7;
function createVillageShoreStoneDefinitions(groundSampler) {
  const lake = villageLandmarks().lake;
  return Array.from({ length: STONE_COUNT }, (_, index) => {
    return createShoreStoneDefinition(lake, index, groundSampler);
  });
}
function createShoreStoneGeometry(width, height, depth, seed = 0) {
  const vertices = [];
  const faces = [];
  const bottomRing = [];
  const shoulderRing = [];
  for (let segment2 = 0; segment2 < RING_SEGMENTS; segment2 += 1) {
    const angle = segment2 / RING_SEGMENTS * Math.PI * 2;
    const irregularity = 1 + Math.sin(angle * 3 + seed * 0.71) * 0.11 + Math.cos(angle * 2 - seed * 0.43) * 0.06;
    const x = Math.cos(angle) * width * 0.5 * irregularity;
    const z = Math.sin(angle) * depth * 0.5 * irregularity;
    bottomRing.push(vertices.push([x * 0.76, -height * 0.38, z * 0.76]) - 1);
    shoulderRing.push(vertices.push([
      x,
      Math.sin(angle * 2 + seed) * height * 0.055,
      z
    ]) - 1);
  }
  const crown = vertices.push([
    Math.sin(seed * 1.31) * width * 0.13,
    height * 0.54,
    Math.cos(seed * 0.93) * depth * 0.12
  ]) - 1;
  faces.push([...bottomRing]);
  for (let segment2 = 0; segment2 < RING_SEGMENTS; segment2 += 1) {
    const next = (segment2 + 1) % RING_SEGMENTS;
    faces.push([
      bottomRing[segment2],
      shoulderRing[segment2],
      shoulderRing[next],
      bottomRing[next]
    ]);
    faces.push([crown, shoulderRing[next], shoulderRing[segment2]]);
  }
  return { faces, vertices };
}
function createShoreStoneDefinition(lake, index, groundSampler) {
  const angle = index / STONE_COUNT * Math.PI * 2;
  const shorelineOffset = 0.72 + Math.sin(index * 1.91) * 0.24;
  const x = lake.x + Math.cos(angle) * (lake.radiusX + shorelineOffset);
  const z = lake.z + Math.sin(angle) * (lake.radiusZ + shorelineOffset * 0.82);
  const width = 1.08 + index % 4 * 0.14;
  const height = 0.46 + index % 5 * 0.055;
  const depth = 0.72 + index % 3 * 0.11;
  const geometry = createShoreStoneGeometry(width, height, depth, index);
  return {
    ...geometry,
    color: STONE_COLORS[index % STONE_COLORS.length],
    id: `Awtsmoos_lake_shore_stone_${index}`,
    mapRepeat: [1.5, 1],
    noEdge: true,
    position: {
      x,
      y: villageGroundHeight(groundSampler, x, z) + height * 0.22,
      z
    },
    rotation: { x: 0, y: angle + index * 0.37, z: 0 },
    shape: "manual",
    solid: true,
    texturePolicy: {
      publicFirebase: true,
      realMaterialRequired: true,
      role: "wet-shore-stone",
      shader: "weathered-rock-moss"
    },
    textureUrl: TEXTURE_URLS.bricks.fieldstone1,
    userData: {
      AwtsmoosLod: { className: "landmark" },
      family: "lake-shore-stone"
    }
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageEssentialLandscapeSystem.js
function createVillageEssentialLandscapeDefinitions(groundSampler, quality = "high") {
  const bushBatches = createBushBatchDefinitions(groundSampler);
  const gardenBeds = createVillageGardenBedDefinitions(groundSampler);
  const shoreStones = createVillageShoreStoneDefinitions(groundSampler);
  const bushStats = bushBatchStats(bushBatches);
  return {
    definitions: [
      ...bushBatches,
      ...gardenBeds,
      ...shoreStones
    ],
    stats: {
      botanicalDeferred: true,
      bushes: bushStats.instances,
      bushBatches: bushStats.batches,
      bushTriangles: bushStats.triangles,
      flowerBatches: 0,
      flowerInstances: 0,
      flowerSpecies: 0,
      flowerTriangles: 0,
      flowerVertices: 0,
      gardenBeds: gardenBeds.length,
      quality,
      shoreStones: shoreStones.length
    }
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/FoundationAnchorEnvelope.js
var MINIMUM_SIZE = 1e-6;
function resolveFoundationAnchorEnvelope(anchor) {
  const candidate = manualEnvelope(anchor) || boxEnvelope(anchor) || cylinderEnvelope(anchor);
  return validEnvelope(candidate) ? Object.freeze(candidate) : null;
}
function manualEnvelope(anchor) {
  const value = anchor?.userData?.foundationEnvelope;
  if (!value) return null;
  return {
    bottom: value.bottom,
    depth: value.depth,
    width: value.width,
    x: value.x,
    yaw: value.yaw || 0,
    z: value.z
  };
}
function boxEnvelope(anchor) {
  if (anchor?.shape !== "box" || !anchor.position || !anchor.size) return null;
  return {
    bottom: anchor.position.y - anchor.size.y / 2,
    depth: anchor.size.z,
    width: anchor.size.x,
    x: anchor.position.x,
    yaw: anchor.rotation?.y || 0,
    z: anchor.position.z
  };
}
function cylinderEnvelope(anchor) {
  if (anchor?.shape !== "cylinder" || !anchor.position) return null;
  if (!Number.isFinite(anchor.radius) || !Number.isFinite(anchor.height)) return null;
  return {
    bottom: anchor.position.y - anchor.height / 2,
    depth: anchor.radius * 2,
    width: anchor.radius * 2,
    x: anchor.position.x,
    yaw: anchor.rotation?.y || 0,
    z: anchor.position.z
  };
}
function validEnvelope(value) {
  return Boolean(value) && finite2(value.bottom) && finite2(value.depth) && finite2(value.width) && finite2(value.x) && finite2(value.yaw) && finite2(value.z) && value.depth > MINIMUM_SIZE && value.width > MINIMUM_SIZE;
}
function finite2(value) {
  return Number.isFinite(Number(value));
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageFoundationGeometry.js
var MARGIN = 0.24;
var EMBED = 0.24;
var OVERLAP = 0.04;
function canCreateFoundation(anchor) {
  return Boolean(resolveFoundationAnchorEnvelope(anchor));
}
function createFoundationDefinition(anchor, groundSampler) {
  const structure = resolveFoundationAnchorEnvelope(anchor);
  if (!structure) {
    throw new Error(`Unsupported foundation anchor ${anchor?.id || "unknown"}.`);
  }
  const structureGround = sampleFoundationEnvelope(structure, groundSampler);
  const footing = {
    ...structure,
    depth: structure.depth + MARGIN * 2,
    width: structure.width + MARGIN * 2
  };
  const footingGround = sampleFoundationEnvelope(footing, groundSampler);
  const top = Math.max(structure.bottom, structureGround.maximumGround) + OVERLAP;
  const bottom = Math.min(
    footingGround.minimumGround - EMBED,
    top - 0.3
  );
  return foundationDefinition({
    anchor,
    bottom,
    footing,
    maximumGround: structureGround.maximumGround,
    minimumGround: footingGround.minimumGround,
    structureBottom: structure.bottom,
    top
  });
}
function foundationDefinition(data) {
  const height = data.top - data.bottom;
  const id = data.anchor.userData.canonicalId;
  return {
    color: "#766d61",
    id: `Awtsmoos_foundation_${id}`,
    mapRepeat: [
      Math.max(1, data.footing.width / 1.4),
      Math.max(1, height / 1.1)
    ],
    position: {
      x: data.footing.x,
      y: data.bottom + height / 2,
      z: data.footing.z
    },
    rotation: { y: data.footing.yaw },
    shape: "box",
    size: {
      x: data.footing.width,
      y: height,
      z: data.footing.depth
    },
    solid: true,
    texturePolicy: {
      publicFirebase: true,
      role: "canonical-retaining-foundation",
      shader: "rough-stone-detail",
      tileWorld: 1.2
    },
    textureUrl: TEXTURE_URLS.bricks.fieldstone1,
    userData: foundationMetadata(data, id)
  };
}
function foundationMetadata(data, id) {
  return {
    bottom: data.bottom,
    family: "canonical-foundation",
    maximumGround: data.maximumGround,
    minimumGround: data.minimumGround,
    structureBottom: data.structureBottom,
    supportedId: id,
    top: data.top
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageFoundationSystem.js
var SPECIALIZED_SUPPORT_IDS = /* @__PURE__ */ new Set(["BRIDGE01", "ENTR01"]);
var PROXY_HEIGHT = 1;
function createVillageFoundationDefinitions(architectureDefinitions, groundSampler) {
  const anchors = architectureDefinitions.map(resolveFoundationAnchor).filter(Boolean);
  const foundations = anchors.map((anchor) => {
    return createFoundationDefinition(anchor, groundSampler);
  });
  foundations.stats = Object.freeze({
    definitions: foundations.length,
    supportedIds: Object.freeze(anchors.map(canonicalId).sort())
  });
  return foundations;
}
function resolveFoundationAnchor(definition4) {
  const id = canonicalId(definition4);
  if (!supportedCanonicalId(id)) {
    return null;
  }
  if (canCreateFoundation(definition4)) {
    return definition4;
  }
  return createManualFoundationProxy(definition4, id);
}
function createManualFoundationProxy(definition4, id) {
  const footprint2 = CANONICAL_FOOTPRINTS_BY_ID[id];
  const structureBottom = minimumVertexHeight(definition4.vertices);
  if (!footprint2 || !Number.isFinite(structureBottom)) {
    return null;
  }
  return {
    position: {
      x: footprint2.x,
      y: structureBottom + PROXY_HEIGHT / 2,
      z: footprint2.z
    },
    rotation: { y: footprint2.yaw || 0 },
    shape: "box",
    size: {
      x: footprint2.width,
      y: PROXY_HEIGHT,
      z: footprint2.depth
    },
    userData: {
      ...definition4.userData,
      canonicalId: id,
      foundationAnchorSource: "canonical-footprint-and-manual-mesh-bottom"
    }
  };
}
function minimumVertexHeight(vertices) {
  if (!Array.isArray(vertices) || vertices.length === 0) {
    return Number.NaN;
  }
  const heights = vertices.map((vertex) => Number(vertex?.[1])).filter(Number.isFinite);
  return heights.length > 0 ? Math.min(...heights) : Number.NaN;
}
function supportedCanonicalId(id) {
  return CANONICAL_VILLAGE_IDS.includes(id) && !SPECIALIZED_SUPPORT_IDS.has(id);
}
function canonicalId(definition4) {
  return definition4.userData?.canonicalId;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageDistrictIdentity.js
var IDENTITIES = Object.freeze({
  "arrival-meadow": identity2("arrival", 0.35, 0.8, 0.5),
  "beis-chabad-terrace": identity2("learning", 0.72, 0.9, 0.7),
  "market-quarter": identity2("market", 0.82, 0.55, 1),
  "shul-terrace": identity2("sacred", 0.76, 0.88, 0.62),
  "upper-residential": identity2("residential", 0.68, 0.82, 0.72),
  "north-slope-residential": identity2("forest-edge", 0.88, 0.46, 0.8),
  "east-bank-homes": identity2("riverside", 0.92, 0.76, 0.68),
  "waterfall-portal": identity2("rocky-portal", 1, 0.34, 0.9),
  "farm-terraces": identity2("agricultural", 0.56, 1, 0.62),
  "riverfront-gardens": identity2("garden-riverside", 0.86, 1, 0.72)
});
function villageDistrictIdentity(districtId) {
  return IDENTITIES[districtId] || identity2("residential", 0.65, 0.7, 0.65);
}
function villageDistrictIdentities() {
  return IDENTITIES;
}
function identity2(character, moisture, planting, clutter) {
  return Object.freeze({ character, clutter, moisture, planting });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageHouseBubbleGeometry.js
function houseBubbleBox(house2, sampler, local, size, yOffset = 0) {
  const point3 = houseLocalPoint(house2, local.x, local.z);
  const ground = villageGroundHeight(sampler, point3.x, point3.z);
  return {
    position: {
      x: point3.x,
      y: ground + size.y / 2 + yOffset,
      z: point3.z
    },
    size,
    yaw: house2.yaw
  };
}
function houseLocalPoint(house2, localX, localZ) {
  const cosine = Math.cos(house2.yaw);
  const sine = Math.sin(house2.yaw);
  return {
    x: house2.x + localX * cosine + localZ * sine,
    z: house2.z - localX * sine + localZ * cosine
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageHouseBubbleParts.js
function appendHouseBubbleParts(collectors, house2, sampler, identity3, index) {
  appendThreshold(collectors, house2, sampler);
  appendRetainingEdge(collectors, house2, sampler, identity3);
  appendDrainage(collectors, house2, sampler, identity3);
  appendFence(collectors, house2, sampler, identity3);
  appendGarden(collectors, house2, sampler, identity3, index);
  appendFirewood(collectors, house2, sampler, identity3);
  appendFurniture(collectors, house2, sampler, identity3);
}
function appendThreshold(c, house2, sampler) {
  c.thresholds.push(houseBubbleBox(
    house2,
    sampler,
    { x: 0, z: 4.4 },
    { x: 2.2, y: 0.16, z: 3.4 },
    0.04
  ));
}
function appendRetainingEdge(c, house2, sampler, identity3) {
  const depth = 5.8 + identity3.moisture;
  for (const side of [-1, 1]) {
    c.retaining.push(houseBubbleBox(
      house2,
      sampler,
      { x: side * 3.8, z: 0.6 },
      { x: 0.48, y: 1.15, z: depth }
    ));
  }
}
function appendDrainage(c, house2, sampler, identity3) {
  if (identity3.moisture < 0.7) return;
  c.drainage.push(houseBubbleBox(
    house2,
    sampler,
    { x: 0, z: 5.55 },
    { x: 4.7, y: 0.12, z: 0.34 },
    0.02
  ));
}
function appendFence(c, house2, sampler, identity3) {
  if (identity3.character === "market" || identity3.character === "arrival") return;
  for (const side of [-1, 1]) {
    for (const z of [1.9, 4.4]) {
      c.fences.push(houseBubbleBox(
        house2,
        sampler,
        { x: side * 4.8, z },
        { x: 0.18, y: 1.3, z: 0.18 }
      ));
    }
    c.fences.push(houseBubbleBox(
      house2,
      sampler,
      { x: side * 4.8, z: 3.15 },
      { x: 0.16, y: 0.16, z: 2.7 },
      0.72
    ));
  }
}
function appendGarden(c, house2, sampler, identity3, index) {
  if (identity3.planting < 0.68) return;
  const side = index % 2 === 0 ? -1 : 1;
  c.gardens.push(houseBubbleBox(
    house2,
    sampler,
    { x: side * 3.3, z: 4.05 },
    { x: 2.5, y: 0.22, z: 1.55 },
    0.03
  ));
}
function appendFirewood(c, house2, sampler, identity3) {
  if (identity3.character === "market" || identity3.character === "sacred") return;
  for (let row = 0; row < 3; row += 1) {
    c.firewood.push(houseBubbleBox(
      house2,
      sampler,
      { x: -3.55 + row * 0.42, z: -2.25 },
      { x: 0.3, y: 0.34, z: 1.45 },
      0.05
    ));
  }
}
function appendFurniture(c, house2, sampler, identity3) {
  if (identity3.clutter < 0.65) return;
  c.furniture.push(houseBubbleBox(
    house2,
    sampler,
    { x: 2.75, z: 4.1 },
    { x: 1.7, y: 0.18, z: 0.55 },
    0.55
  ));
  for (const x of [2.15, 3.35]) {
    c.furniture.push(houseBubbleBox(
      house2,
      sampler,
      { x, z: 4.1 },
      { x: 0.16, y: 0.72, z: 0.48 },
      0.05
    ));
  }
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageHouseBubbleSystem.js
function createVillageHouseBubbleDefinitions(groundSampler, quality = "high") {
  const collectors = createCollectors2();
  const houses = selectedHouses(quality);
  houses.forEach((house2, index) => appendHouseBubbleParts(
    collectors,
    house2,
    groundSampler,
    villageDistrictIdentity(house2.districtId),
    index
  ));
  const definitions = createBatches(collectors);
  definitions.stats = bubbleStats(collectors, houses, definitions, quality);
  return definitions;
}
function createCollectors2() {
  return {
    drainage: [],
    fences: [],
    firewood: [],
    furniture: [],
    gardens: [],
    retaining: [],
    thresholds: []
  };
}
function selectedHouses(quality) {
  const count = quality === "low" ? 8 : quality === "medium" ? 13 : 18;
  return CANONICAL_VILLAGE_HOUSES.slice(0, count);
}
function createBatches(c) {
  return [
    batch5("house-thresholds", c.thresholds, "#827768", TEXTURE_URLS.stone.cobblestone, "house-access-threshold", 1.1),
    batch5("house-retaining-edges", c.retaining, "#716a60", TEXTURE_URLS.stone.stone1, "house-retaining-edge", 1.5),
    batch5("house-drainage", c.drainage, "#565b5d", TEXTURE_URLS.stone.cobblestone, "house-drainage-channel", 0.7),
    batch5("house-fences", c.fences, "#4c3524", TEXTURE_URLS.wood.bark1, "house-fence", 0.8),
    batch5("house-gardens", c.gardens, "#493a2c", TEXTURE_URLS.terrain.tilledSoil, "house-garden-bed", 0.8),
    batch5("house-firewood", c.firewood, "#5c3a22", TEXTURE_URLS.wood.bark1, "house-firewood-stack", 0.55),
    batch5("house-furniture", c.furniture, "#4a3324", TEXTURE_URLS.wood.planks1, "house-bench", 0.7)
  ].filter(Boolean);
}
function batch5(id, boxes, color, textureUrl, part4, tileWorld) {
  if (boxes.length === 0) return null;
  return createVillageBoxBatch(id, boxes, {
    color,
    family: "canonical-house-bubble",
    part: part4,
    texturePolicy: {
      role: part4,
      shader: "weathered-house-bubble",
      tileWorld
    },
    textureUrl
  });
}
function bubbleStats(c, houses, definitions, quality) {
  return {
    batches: definitions.length,
    drainageChannels: c.drainage.length,
    fencePieces: c.fences.length,
    firewoodPieces: c.firewood.length,
    furniturePieces: c.furniture.length,
    gardenBeds: c.gardens.length,
    houses: houses.length,
    quality,
    retainingEdges: c.retaining.length,
    thresholds: c.thresholds.length,
    totalDetails: Object.values(c).reduce((sum, list) => sum + list.length, 0)
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageInteriorProgramCatalog.js
var BASE_ROOMS = Object.freeze(["entry", "kitchen", "common-room", "bedroom"]);
var SPECIAL_ROOMS = Object.freeze({
  agricultural: ["pantry", "root-cellar", "mud-room"],
  arrival: ["guest-room", "boot-room"],
  "forest-edge": ["wood-workshop", "drying-loft"],
  "garden-riverside": ["conservatory", "herb-room"],
  learning: ["library", "study"],
  market: ["shop-front", "store-room"],
  residential: ["nursery", "attic"],
  riverside: ["net-room", "wash-room"],
  "rocky-portal": ["stone-workshop", "meditation-room"],
  sacred: ["study", "hospitality-room"]
});
function villageInteriorPrograms(quality = "high") {
  return selectedHouses2(quality).map((house2, index) => programForHouse(house2, index));
}
function programForHouse(house2, index) {
  const identity3 = villageDistrictIdentity(house2.districtId);
  const special = SPECIAL_ROOMS[identity3.character] || SPECIAL_ROOMS.residential;
  const rooms = [...BASE_ROOMS, ...special];
  if (index % 3 === 0 && !rooms.includes("cellar")) rooms.push("cellar");
  return Object.freeze({
    districtId: house2.districtId,
    hasHearth: true,
    houseId: house2.id,
    rooms: Object.freeze(rooms),
    workRoom: special[0]
  });
}
function selectedHouses2(quality) {
  const count = quality === "low" ? 8 : quality === "medium" ? 13 : 18;
  return CANONICAL_VILLAGE_HOUSES.slice(0, count);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageLivingSchedule.js
function villageDailyPhase(hour) {
  const value = normalizedHour(hour);
  if (value < 5) return "night";
  if (value < 8) return "dawn";
  if (value < 12) return "morning-work";
  if (value < 14) return "midday";
  if (value < 18) return "afternoon-work";
  if (value < 21) return "evening";
  return "night";
}
function villageLivingState(character, hour) {
  const phase = villageDailyPhase(hour);
  const activeWork = phase === "morning-work" || phase === "afternoon-work";
  const evening = phase === "evening";
  const night = phase === "night";
  return Object.freeze({
    animalsInPens: evening || night,
    doorsOpen: activeWork || phase === "midday",
    gardenActive: activeWork && character.includes("garden"),
    hearthSmoke: phase === "dawn" || evening || night,
    interiorLights: evening || night,
    marketOpen: character === "market" && (activeWork || phase === "midday"),
    phase,
    studyActive: ["learning", "sacred"].includes(character) && !night
  });
}
function villageDailyCheckpoints(character) {
  return Object.freeze([2, 6, 10, 13, 17, 20].map((hour) => Object.freeze({
    hour,
    state: villageLivingState(character, hour)
  })));
}
function normalizedHour(hour) {
  const number = Number.isFinite(Number(hour)) ? Number(hour) : 12;
  return (number % 24 + 24) % 24;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageLifeSystem.js
function createVillageLifeContracts(quality = "high") {
  const programs = villageInteriorPrograms(quality);
  const schedules = Object.fromEntries(Object.entries(villageDistrictIdentities()).map(
    ([districtId, identity3]) => [districtId, villageDailyCheckpoints(identity3.character)]
  ));
  return Object.freeze({
    programs,
    schedules: Object.freeze(schedules),
    stats: Object.freeze({
      dailyCheckpoints: Object.keys(schedules).length * 6,
      districtSchedules: Object.keys(schedules).length,
      housePrograms: programs.length,
      quality,
      roomCount: programs.reduce((sum, program) => sum + program.rooms.length, 0)
    })
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillagePracticalLightSystem.js
var LAMP_POINTS = Object.freeze([
  [-10, 68],
  [10, 62],
  [-8, 24],
  [9, 17],
  [26, 9],
  [45, 8],
  [-27, 15],
  [-48, 14],
  [-58, -38],
  [-72, -49],
  [20, -48],
  [18, -66],
  [70, -48],
  [88, -61],
  [104, 39],
  [-99, 54],
  [4, -112],
  [8, -145],
  [-18, -132],
  [34, -138],
  [-36, 4],
  [36, -6],
  [-42, -14],
  [54, -20]
]);
function createVillagePracticalLightDefinitions(groundSampler, quality = "high") {
  const limit = referenceLightingBudget(quality).practicalLamps;
  const parts = { caps: [], panes: [], pools: [], posts: [] };
  for (const [x, z] of LAMP_POINTS.slice(0, limit)) {
    appendLamp(parts, x, villageGroundHeight(groundSampler, x, z), z);
  }
  const definitions = [
    batch6("lamp-post-batch", parts.posts, "#3d2b20", TEXTURE_URLS.metals.rustyIron, "post"),
    batch6("lamp-cap-batch", parts.caps, "#3d2b20", TEXTURE_URLS.metals.rustyIron, "cap"),
    batch6("lamp-pane-batch", parts.panes, REFERENCE_GOLDEN_HOUR.lampColor, TEXTURE_URLS.metals.gold2, "pane"),
    batch6("lamp-pool-batch", parts.pools, "#7a4f22", TEXTURE_URLS.terrain.dirtGrass3, "pool")
  ];
  definitions.stats = {
    definitions: definitions.length,
    lamps: limit,
    realtimeLights: 0,
    technique: "four-static-material-batches"
  };
  return definitions;
}
function appendLamp(parts, x, y, z) {
  parts.posts.push(box5(x, y + 1.6, z, 0.17, 3.2, 0.17));
  parts.caps.push(box5(x, y + 3.32, z, 0.62, 0.14, 0.62));
  parts.panes.push(box5(x, y + 3.02, z, 0.46, 0.54, 0.46));
  parts.pools.push(box5(x, y + 0.025, z, 4.8, 0.035, 4.8));
}
function batch6(id, boxes, color, textureUrl, part4) {
  return createVillageBoxBatch(id, boxes, {
    color,
    family: "reference-practical-lighting",
    part: part4,
    texturePolicy: { practicalLightProxy: true },
    textureUrl
  });
}
function box5(x, y, z, sx, sy, sz) {
  return {
    position: { x, y, z },
    size: { x: sx, y: sy, z: sz },
    yaw: 0
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillagePropFactory.js
var STATIC_PROP_FAMILY = "village-static-props";
function villageBox(id, x, y, z, sx, sy, sz, color, textureUrl, options = {}) {
  return {
    color,
    id,
    mapRepeat: options.mapRepeat || [1, 1],
    noEdge: options.noEdge || false,
    position: { x, y, z },
    rotation: options.rotation || {},
    shape: "box",
    size: { x: sx, y: sy, z: sz },
    solid: options.solid ?? true,
    texturePolicy: {
      publicFirebase: !textureUrl.startsWith("data:"),
      villageProp: true,
      ...options.texturePolicy || {}
    },
    textureUrl,
    userData: staticPropMetadata(options.userData)
  };
}
function villageCylinder(id, x, y, z, radius, height, color, textureUrl, options = {}) {
  return {
    color,
    height,
    id,
    mapRepeat: options.mapRepeat || [1, 2],
    position: { x, y, z },
    radius,
    segments: options.segments || 14,
    shape: "cylinder",
    solid: options.solid ?? true,
    texturePolicy: {
      publicFirebase: !textureUrl.startsWith("data:"),
      villageProp: true,
      ...options.texturePolicy || {}
    },
    textureUrl,
    userData: staticPropMetadata(options.userData)
  };
}
function villageGroundY(groundSampler, x, z) {
  return groundSampler.heightAt(x, z).y;
}
function villageRing(count, radius, zOffset = 2) {
  return Array.from({ length: count }, (_, index) => {
    const angle = index / count * Math.PI * 2 + 0.22;
    return {
      x: Math.cos(angle) * radius,
      z: Math.sin(angle) * radius + zOffset
    };
  });
}
function staticPropMetadata(userData = {}) {
  return {
    family: userData.family || STATIC_PROP_FAMILY,
    ...userData
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageDestinationSignSystem.js?v=20260720-canonical-valley-pass-04
function createVillageDestinationSignDefinitions(groundSampler) {
  const definitions = VILLAGE_SIGN_GROUPS.flatMap((group) => {
    return createSignGroup(group, groundSampler);
  });
  return {
    definitions,
    stats: {
      bilingualLabels: VILLAGE_DESTINATIONS.length,
      destinationLabels: VILLAGE_DESTINATIONS.length,
      signBoards: VILLAGE_SIGN_GROUPS.length,
      signPosts: VILLAGE_SIGN_GROUPS.length,
      signs: VILLAGE_SIGN_GROUPS.length,
      textureCount: VILLAGE_SIGN_GROUPS.length
    }
  };
}
function createSignGroup(group, groundSampler) {
  const { x, z } = group.position;
  const y = villageGroundY(groundSampler, x, z);
  const metadata = {
    AwtsmoosDestinationSign: {
      destinations: group.destinations,
      groupId: group.id,
      languages: ["en", "he"]
    }
  };
  const post = villageCylinder(
    `Awtsmoos_destination_sign_post_${group.id}`,
    x,
    y + 1.55,
    z,
    0.11,
    3.1,
    "#78502c",
    TEXTURE_URLS.wood.bark1,
    { userData: metadata }
  );
  const board = villageBox(
    `Awtsmoos_destination_sign_board_${group.id}`,
    x,
    y + 2.35,
    z,
    4.6,
    1.85,
    0.16,
    "#ffffff",
    createVillageSignTextureUrl(group),
    {
      noEdge: true,
      rotation: { y: group.yaw },
      solid: false,
      texturePolicy: { bilingualSvg: true, generated: true },
      userData: metadata
    }
  );
  return [post, board];
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageDistrictDressingSystem.js
function createVillageDistrictDressingDefinitions(groundSampler, quality = "high") {
  const collectors = { craft: [], farming: [], learning: [], market: [] };
  const districts = selectedDistricts(quality);
  districts.forEach((district2, index) => appendDistrict(
    collectors,
    district2,
    villageDistrictIdentity(district2.id),
    groundSampler,
    index
  ));
  const definitions = createBatches2(collectors);
  definitions.stats = createStats(collectors, definitions, districts, quality);
  return definitions;
}
function appendDistrict(c, district2, identity3, sampler, index) {
  const [x, z] = district2.center;
  const phase = district2.phase + index * 0.37;
  if (identity3.character === "market") appendMarket(c.market, x, z, phase, sampler);
  if (identity3.character === "learning" || identity3.character === "sacred") {
    appendLearning(c.learning, x, z, phase, sampler);
  }
  if (identity3.character.includes("agricultural") || identity3.character.includes("garden")) {
    appendFarm(c.farming, x, z, phase, sampler);
  }
  if (identity3.character.includes("riverside") || identity3.character.includes("forest")) {
    appendCraft2(c.craft, x, z, phase, sampler);
  }
}
function appendMarket(boxes, x, z, phase, sampler) {
  for (const offset of [-4, 0, 4]) {
    boxes.push(boxAt(x + offset, z + 3, 1.2, 2.4, 0.22, sampler, phase));
    boxes.push(boxAt(x + offset, z + 3, 2.8, 0.18, 0.18, sampler, phase));
  }
}
function appendLearning(boxes, x, z, phase, sampler) {
  for (let row = 0; row < 4; row += 1) {
    boxes.push(boxAt(x - 3 + row * 0.9, z + 2.5, 0.7, 0.18, 1.1, sampler, phase));
  }
}
function appendFarm(boxes, x, z, phase, sampler) {
  for (let row = -2; row <= 2; row += 1) {
    boxes.push(boxAt(x + row * 1.4, z + 2, 0.65, 0.16, 7.5, sampler, phase));
  }
}
function appendCraft2(boxes, x, z, phase, sampler) {
  for (let stack = 0; stack < 3; stack += 1) {
    boxes.push(boxAt(x + 3.2, z - 2 + stack * 0.75, 1.5, 0.42, 0.45, sampler, phase));
  }
}
function boxAt(x, z, sizeX, sizeY, sizeZ, sampler, yaw) {
  return {
    position: { x, y: villageGroundHeight(sampler, x, z) + sizeY / 2 + 0.04, z },
    size: { x: sizeX, y: sizeY, z: sizeZ },
    yaw
  };
}
function createBatches2(c) {
  return [
    batch7("district-market-frames", c.market, "#725033", TEXTURE_URLS.wood.planks1, "market-frames"),
    batch7("district-learning-stacks", c.learning, "#6b4428", TEXTURE_URLS.wood.planks1, "learning-stacks"),
    batch7("district-farm-rows", c.farming, "#4b3927", TEXTURE_URLS.terrain.tilledSoil, "farm-rows"),
    batch7("district-craft-stacks", c.craft, "#5a402c", TEXTURE_URLS.wood.bark1, "craft-stacks")
  ].filter(Boolean);
}
function batch7(id, boxes, color, textureUrl, part4) {
  if (boxes.length === 0) return null;
  return createVillageBoxBatch(id, boxes, {
    color,
    family: "canonical-district-dressing",
    part: part4,
    texturePolicy: { role: part4, shader: "district-economy", tileWorld: 0.8 },
    textureUrl
  });
}
function selectedDistricts(quality) {
  const count = quality === "low" ? 5 : quality === "medium" ? 8 : 10;
  return VILLAGE_DISTRICTS.slice(0, count);
}
function createStats(c, definitions, districts, quality) {
  return {
    batches: definitions.length,
    details: Object.values(c).reduce((sum, items) => sum + items.length, 0),
    districts: districts.length,
    quality
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageEnvironmentalHistorySystem.js
function createVillageEnvironmentalHistoryDefinitions(groundSampler, quality = "high") {
  const collectors = { braces: [], moss: [], repairs: [], wear: [] };
  const districts = selectedDistricts2(quality);
  districts.forEach((district2, index) => appendHistory(
    collectors,
    district2,
    villageDistrictIdentity(district2.id),
    groundSampler,
    index
  ));
  const definitions = createBatches3(collectors);
  definitions.stats = {
    batches: definitions.length,
    details: Object.values(collectors).reduce((sum, list) => sum + list.length, 0),
    districts: districts.length,
    quality
  };
  return definitions;
}
function appendHistory(c, district2, identity3, sampler, index) {
  const [x, z] = district2.center;
  const yaw = district2.phase + index * 0.19;
  if (identity3.moisture >= 0.75) {
    c.moss.push(boxAt2(x - 4, z - 3, 6.5, 0.09, 0.42, sampler, yaw));
  }
  if (district2.landmarkId || identity3.character === "residential") {
    c.braces.push(boxAt2(x + 4.2, z - 1.5, 0.24, 2.7, 0.24, sampler, yaw + 0.55));
  }
  if (identity3.character === "market" || identity3.character.includes("agricultural")) {
    for (const side of [-1, 1]) {
      c.wear.push(boxAt2(x + side * 1.1, z, 0.38, 0.055, 10, sampler, yaw));
    }
  }
  if (index % 2 === 0) {
    for (let stone = 0; stone < 3; stone += 1) {
      c.repairs.push(boxAt2(x - 5 + stone * 0.8, z + 4, 0.7, 0.45, 0.55, sampler, yaw));
    }
  }
}
function boxAt2(x, z, sizeX, sizeY, sizeZ, sampler, yaw) {
  return {
    position: { x, y: villageGroundHeight(sampler, x, z) + sizeY / 2 + 0.03, z },
    size: { x: sizeX, y: sizeY, z: sizeZ },
    yaw
  };
}
function createBatches3(c) {
  return [
    batch8("history-moss-seams", c.moss, "#4b5d38", TEXTURE_URLS.terrain.grass1, "moss-seam"),
    batch8("history-repair-braces", c.braces, "#59402d", TEXTURE_URLS.wood.bark1, "repair-brace"),
    batch8("history-wheel-wear", c.wear, "#4f4338", TEXTURE_URLS.terrain.dirt1, "wheel-wear"),
    batch8("history-repair-stone", c.repairs, "#777064", TEXTURE_URLS.stone.stone1, "repair-stone")
  ].filter(Boolean);
}
function batch8(id, boxes, color, textureUrl, part4) {
  if (boxes.length === 0) return null;
  return createVillageBoxBatch(id, boxes, {
    color,
    family: "canonical-environmental-history",
    part: part4,
    texturePolicy: { role: part4, shader: "weathered-history", tileWorld: 0.75 },
    textureUrl
  });
}
function selectedDistricts2(quality) {
  const count = quality === "low" ? 5 : quality === "medium" ? 8 : 10;
  return VILLAGE_DISTRICTS.slice(0, count);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageMarketFurniture.js
var AWNING_COLORS = Object.freeze(["#8f3f32", "#be8b3d", "#556f61"]);
function createMarketFurniture(center, groundSampler) {
  return Array.from({ length: 3 }, (_, index) => createStall(center, groundSampler, index)).flat();
}
function createStall(center, groundSampler, index) {
  const x = center.x + (index - 1) * 4.4;
  const z = center.z + Math.abs(index - 1) * 0.8;
  const y = villageGroundY(groundSampler, x, z);
  return [
    villageBox(`Awtsmoos_MARKET01_table_${index}`, x, y + 0.65, z, 3.4, 0.35, 1.45, "#76502f", TEXTURE_URLS.wood.planks1),
    awningDefinition(x, y + 3.05, z, index),
    produceDefinition(x, y + 1.15, z, index)
  ];
}
function awningDefinition(x, y, z, index) {
  const width = 3.8;
  const depth = 2.5;
  return {
    color: AWNING_COLORS[index],
    doubleSided: true,
    faces: [[0, 1, 2, 3], [4, 7, 6, 5]],
    id: `Awtsmoos_MARKET01_awning_${index}`,
    noEdge: true,
    shape: "manual",
    solid: false,
    texturePolicy: { role: "market-fabric-awning", shader: "fabric-wind" },
    textureUrl: TEXTURE_URLS.wood.planks1,
    userData: { family: "canonical-market", landmarkId: "MARKET01", part: "awning" },
    vertices: [
      [x - width / 2, y, z - depth / 2],
      [x + width / 2, y, z - depth / 2],
      [x + width / 2, y - 0.55, z + depth / 2],
      [x - width / 2, y - 0.55, z + depth / 2],
      [x - width / 2, y - 0.08, z - depth / 2],
      [x + width / 2, y - 0.08, z - depth / 2],
      [x + width / 2, y - 0.63, z + depth / 2],
      [x - width / 2, y - 0.63, z + depth / 2]
    ]
  };
}
function produceDefinition(x, y, z, index) {
  const vertices = [];
  const faces = [];
  for (let item = 0; item < 7; item += 1) {
    appendProduce(
      vertices,
      faces,
      x + (item % 4 - 1.5) * 0.48,
      y + Math.floor(item / 4) * 0.28,
      z + (item % 2 - 0.5) * 0.42
    );
  }
  return {
    color: index === 0 ? "#b94332" : index === 1 ? "#d49a2f" : "#789744",
    faces,
    id: `Awtsmoos_MARKET01_produce_${index}`,
    noEdge: true,
    shape: "manual",
    solid: false,
    userData: { family: "canonical-market", landmarkId: "MARKET01", part: "produce" },
    vertices
  };
}
function appendProduce(vertices, faces, x, y, z) {
  const start = vertices.length;
  const radius = 0.22;
  vertices.push(
    [x, y + radius, z],
    [x + radius, y, z],
    [x, y, z + radius],
    [x - radius, y, z],
    [x, y, z - radius],
    [x, y - radius, z]
  );
  for (const face2 of [[0, 2, 1], [0, 3, 2], [0, 4, 3], [0, 1, 4], [5, 1, 2], [5, 2, 3], [5, 3, 4], [5, 4, 1]]) {
    faces.push(face2.map((value) => start + value));
  }
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageStoneBridgeGeometry.js
var SEGMENTS = 18;
var OUTER_RADIUS = 5.8;
var INNER_RADIUS = 4.55;
var RING_DEPTH = 0.42;
function createStoneBridgeArchGeometry(center, springY, zOffset) {
  const geometry = { faces: [], uvs: [], vertices: [] };
  for (let index = 0; index < SEGMENTS; index += 1) {
    const first = Math.PI - index / SEGMENTS * Math.PI;
    const second = Math.PI - (index + 1) / SEGMENTS * Math.PI;
    appendRingSegment(geometry, center, springY, zOffset, first, second);
  }
  return geometry;
}
function appendRingSegment(geometry, center, springY, zOffset, first, second) {
  const front = zOffset - RING_DEPTH / 2;
  const back = zOffset + RING_DEPTH / 2;
  const outerFirstFront = bridgePoint(center, springY, first, OUTER_RADIUS, front);
  const outerSecondFront = bridgePoint(center, springY, second, OUTER_RADIUS, front);
  const innerSecondFront = bridgePoint(center, springY, second, INNER_RADIUS, front);
  const innerFirstFront = bridgePoint(center, springY, first, INNER_RADIUS, front);
  const outerFirstBack = bridgePoint(center, springY, first, OUTER_RADIUS, back);
  const outerSecondBack = bridgePoint(center, springY, second, OUTER_RADIUS, back);
  const innerSecondBack = bridgePoint(center, springY, second, INNER_RADIUS, back);
  const innerFirstBack = bridgePoint(center, springY, first, INNER_RADIUS, back);
  appendQuad(geometry, [outerFirstFront, outerSecondFront, innerSecondFront, innerFirstFront]);
  appendQuad(geometry, [outerSecondBack, outerFirstBack, innerFirstBack, innerSecondBack]);
  appendQuad(geometry, [outerFirstBack, outerSecondBack, outerSecondFront, outerFirstFront]);
  appendQuad(geometry, [innerFirstFront, innerSecondFront, innerSecondBack, innerFirstBack]);
}
function bridgePoint(center, springY, angle, radius, z) {
  return [center.x + Math.cos(angle) * radius, springY + Math.sin(angle) * radius, center.z + z];
}
function appendQuad(geometry, points) {
  const start = geometry.vertices.length;
  geometry.vertices.push(...points);
  geometry.faces.push([start, start + 1, start + 2, start + 3]);
  geometry.uvs.push(0, 0, 1, 0, 1, 1, 0, 1);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageStoneBridgeSystem.js
function createStoneBridgeDefinitions(center, groundSampler) {
  const groundY = villageGroundHeight(groundSampler, center.x, center.z);
  const deckY = stoneBridgeDeckCenterY(groundY);
  const springY = deckY - 5.95;
  return [
    archDefinition("front", center, springY, -2.12),
    archDefinition("rear", center, springY, 2.12),
    bridgeDeck(center, groundY, deckY),
    parapetBatch(center, deckY),
    abutmentBatch(center, groundY, deckY)
  ];
}
function archDefinition(side, center, springY, zOffset) {
  return {
    ...createStoneBridgeArchGeometry(center, springY, zOffset),
    color: "#81786b",
    doubleSided: true,
    id: `Awtsmoos_BRIDGE01_arch_${side}`,
    mapRepeat: [7, 3],
    noEdge: true,
    shape: "manual",
    solid: true,
    texturePolicy: {
      publicFirebase: true,
      role: "bridge-voussoir-masonry",
      shader: "rough-stone-detail"
    },
    textureUrl: TEXTURE_URLS.bricks.fieldstone1,
    userData: {
      family: "canonical-stone-bridge",
      landmarkId: "BRIDGE01",
      part: "arch-ring"
    }
  };
}
function bridgeDeck(center, groundY, deckY) {
  const definition4 = boxDefinition(
    "deck",
    center.x,
    deckY,
    center.z,
    STONE_BRIDGE_DIMENSIONS.halfSpan * 2,
    STONE_BRIDGE_DIMENSIONS.deckThickness,
    STONE_BRIDGE_DIMENSIONS.width
  );
  definition4.userData.traversal = {
    approachAuthority: "canonical-grade-solved-road",
    walkableSurfaceY: stoneBridgeDeckTopY(groundY)
  };
  return definition4;
}
function parapetBatch(center, deckY) {
  const pieces = [];
  for (const side of [-1, 1]) {
    pieces.push(box6(center.x, deckY + 0.85, center.z + side * 2.38, 15.2, 1.05, 0.48));
    for (let index = -3; index <= 3; index += 1) {
      pieces.push(box6(center.x + index * 2.2, deckY + 1.25, center.z + side * 2.38, 0.6, 1.7, 0.6));
    }
  }
  return batchDefinition2("parapets", pieces, "parapet-and-post");
}
function abutmentBatch(center, groundY, deckY) {
  const pieces = [];
  for (const side of [-1, 1]) {
    pieces.push(box6(
      center.x + side * 6.7,
      (groundY + deckY) / 2,
      center.z,
      2.2,
      deckY - groundY + 1.6,
      6.6
    ));
    pieces.push(box6(
      center.x + side * 8.1,
      deckY - 0.4,
      center.z,
      2.1,
      1.2,
      6
    ));
  }
  return batchDefinition2("abutments", pieces, "bank-abutment");
}
function boxDefinition(part4, x, y, z, width, height, depth) {
  return {
    color: "#8b8275",
    id: `Awtsmoos_BRIDGE01_${part4}`,
    mapRepeat: [7, 3],
    position: { x, y, z },
    shape: "box",
    size: { x: width, y: height, z: depth },
    solid: true,
    texturePolicy: {
      publicFirebase: true,
      role: "bridge-crowned-stone-deck"
    },
    textureUrl: TEXTURE_URLS.stone.cobblestone,
    userData: {
      canonicalId: "BRIDGE01",
      family: "canonical-stone-bridge",
      landmarkId: "BRIDGE01",
      part: part4
    }
  };
}
function batchDefinition2(part4, pieces, role) {
  return createVillageBoxBatch(`BRIDGE01_${part4}`, pieces, {
    color: "#7c7468",
    family: "canonical-stone-bridge",
    part: part4,
    texturePolicy: {
      role,
      shader: "rough-stone-detail",
      tileWorld: 1.1
    },
    textureUrl: TEXTURE_URLS.bricks.fieldstone1
  });
}
function box6(x, y, z, width, height, depth) {
  return {
    position: { x, y, z },
    size: { x: width, y: height, z: depth },
    yaw: 0
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageStreetFurniture.js
function createLamppostDefinitions(groundSampler) {
  return villageRing(6, 13).flatMap(({ x, z }, index) => {
    const y = villageGroundY(groundSampler, x, z);
    return [
      villageCylinder(`Awtsmoos_lamp_post_${index}`, x, y + 1.3, z, 0.08, 2.6, "#503421", TEXTURE_URLS.wood.bark1),
      lanternDefinition(x, y + 2.78, z, index)
    ];
  });
}
function createBenchDefinitions(groundSampler) {
  return villageRing(4, 8.5).flatMap(({ x, z }, index) => {
    const y = villageGroundY(groundSampler, x, z);
    const rotation = { y: Math.atan2(-x, -z) };
    return [
      villageBox(`Awtsmoos_bench_seat_${index}`, x, y + 0.45, z, 2.1, 0.18, 0.52, "#7a4b25", TEXTURE_URLS.wood.planks1, { rotation }),
      villageBox(`Awtsmoos_bench_back_${index}`, x, y + 0.82, z - 0.22, 2.1, 0.52, 0.14, "#6a3f20", TEXTURE_URLS.wood.planks1, { rotation, solid: false })
    ];
  });
}
function lanternDefinition(x, y, z, index) {
  const vertices = [];
  const faces = [];
  const sides = 8;
  for (let level = 0; level < 2; level += 1) {
    for (let side = 0; side < sides; side += 1) {
      const angle = side / sides * Math.PI * 2;
      vertices.push([
        x + Math.cos(angle) * 0.31,
        y + level * 0.62 - 0.31,
        z + Math.sin(angle) * 0.31
      ]);
    }
  }
  for (let side = 0; side < sides; side += 1) {
    const next = (side + 1) % sides;
    faces.push([side, next, sides + next, sides + side]);
  }
  faces.push(Array.from({ length: sides }, (_, side) => side));
  faces.push(Array.from({ length: sides }, (_, side) => sides * 2 - 1 - side));
  return {
    alphaMode: "BLEND",
    color: "#ffc86a",
    doubleSided: true,
    faces,
    id: `Awtsmoos_lamp_housing_${index}`,
    noEdge: true,
    opacity: 0.88,
    shape: "manual",
    solid: false,
    texturePolicy: { animated: true, role: "lantern-glass-housing", shader: "warm-lantern-flicker" },
    textureUrl: TEXTURE_URLS.metals.gold2,
    transparent: true,
    userData: { family: "canonical-village-lantern", part: "glass-and-housing" },
    vertices
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageFurnitureDefinitions.js
function createVillageFurnitureDefinitions(groundSampler) {
  const landmarks = villageLandmarks();
  const definitions = [
    ...createLamppostDefinitions(groundSampler),
    ...createBenchDefinitions(groundSampler),
    ...createWell(landmarks.well, groundSampler),
    ...createMarketFurniture(landmarks.market, groundSampler),
    ...createStoneBridgeDefinitions(landmarks.bridge, groundSampler)
  ];
  return {
    definitions,
    stats: {
      benches: 4,
      bridgePieces: 5,
      lampposts: 6,
      marketPieces: 9,
      well: true
    }
  };
}
function createWell(center, groundSampler) {
  const y = villageGroundY(groundSampler, center.x, center.z);
  return [
    villageCylinder("Awtsmoos_village_stone_well_ring", center.x, y + 0.48, center.z, 1.05, 0.95, "#8c8c84", TEXTURE_URLS.stone.cobblestone),
    villageBox("Awtsmoos_well_roof_beam", center.x, y + 2, center.z, 2.7, 0.16, 0.16, "#654021", TEXTURE_URLS.wood.bark1, { solid: false }),
    villageBox("Awtsmoos_well_bucket", center.x, y + 1.1, center.z, 0.42, 0.52, 0.42, "#5b3822", TEXTURE_URLS.wood.planks1, { solid: false })
  ];
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillagePedestrianWearSystem.js
var SHORTCUTS = Object.freeze([
  segment([-24, 57], [-35, 45], 1.05),
  segment([-29, 52], [-26, 12], 0.95),
  segment([-38, 18], [-20, 24], 1.1),
  segment([-25, -30], [-18, -43], 0.9),
  segment([1, -31], [10, -52], 0.95),
  segment([34, -4], [42, 12], 0.9),
  segment([46, 33], [-9, 38], 1.05)
]);
var APPROACHES = Object.freeze([
  [-35, 45, 0.4],
  [-26, 12, -0.2],
  [-34, -24, 0.6],
  [43, 39, -0.7],
  [52, -42, 0.2]
]);
function createVillagePedestrianWearDefinitions(groundSampler, quality = "high") {
  const shortcuts = selected(SHORTCUTS, quality).map((item) => routeBox(item, groundSampler));
  const approaches = selected(APPROACHES, quality).map((item) => approachBox(item, groundSampler));
  const definitions = [
    batch9("wear-foot-shortcuts", shortcuts, "#55483b", "foot-shortcut"),
    batch9("wear-threshold-approaches", approaches, "#625346", "threshold-approach")
  ];
  definitions.stats = {
    approaches: approaches.length,
    batches: definitions.length,
    quality,
    shortcuts: shortcuts.length
  };
  return definitions;
}
function routeBox(item, sampler) {
  const dx = item.to[0] - item.from[0];
  const dz = item.to[1] - item.from[1];
  const x = (item.from[0] + item.to[0]) / 2;
  const z = (item.from[1] + item.to[1]) / 2;
  return {
    position: { x, y: villageGroundHeight(sampler, x, z) + 0.025, z },
    size: { x: item.width, y: 0.05, z: Math.hypot(dx, dz) },
    yaw: Math.atan2(dx, dz)
  };
}
function approachBox(item, sampler) {
  const [x, z, yaw] = item;
  return {
    position: { x, y: villageGroundHeight(sampler, x, z) + 0.03, z },
    size: { x: 1.35, y: 0.06, z: 5.2 },
    yaw
  };
}
function batch9(id, boxes, color, part4) {
  return createVillageBoxBatch(id, boxes, {
    color,
    family: "canonical-pedestrian-wear",
    part: part4,
    texturePolicy: { role: part4, shader: "compacted-foot-wear", tileWorld: 0.8 },
    textureUrl: TEXTURE_URLS.terrain.dirt1
  });
}
function selected(items, quality) {
  const count = quality === "low" ? 3 : quality === "medium" ? 5 : items.length;
  return items.slice(0, count);
}
function segment(from, to, width) {
  return Object.freeze({ from: Object.freeze(from), to: Object.freeze(to), width });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageStreetHierarchySystem.js
var ROUTES = Object.freeze([
  route("main", [-12, 14], [-35, 45], 4.8),
  route("main", [-12, 14], [-34, -24], 4.8),
  route("main", [-12, 14], [18, 7], 4.8),
  route("lane", [18, 7], [38, 4], 2.8),
  route("lane", [18, 7], [43, 39], 2.8),
  route("lane", [-34, -24], [-8, -36], 2.8),
  route("lane", [-8, -36], [18, -48], 2.8),
  route("lane", [38, 4], [52, -42], 2.8)
]);
var COURTYARDS = Object.freeze([
  [-35, 45, 7],
  [-26, 12, 8],
  [-34, -24, 7],
  [56, -49, 6],
  [43, 39, 6]
]);
function createVillageStreetHierarchyDefinitions(groundSampler, quality = "high") {
  const routes = selectedRoutes(quality);
  const main = routes.filter((item) => item.kind === "main").map((item) => segmentBox(item, groundSampler));
  const lanes = routes.filter((item) => item.kind === "lane").map((item) => segmentBox(item, groundSampler));
  const courtyards = selectedCourtyards(quality).map((item) => courtyardBox(item, groundSampler));
  const definitions = [
    batch10("street-main-bands", main, "#766958", TEXTURE_URLS.stone.floor2, "main-street"),
    batch10("street-neighborhood-lanes", lanes, "#655b4d", TEXTURE_URLS.stone.cobblestone, "neighborhood-lane"),
    batch10("street-courtyard-thresholds", courtyards, "#837564", TEXTURE_URLS.stone.floor1, "courtyard-threshold")
  ].filter(Boolean);
  definitions.stats = {
    batches: definitions.length,
    courtyards: courtyards.length,
    mainRoutes: main.length,
    neighborhoodRoutes: lanes.length,
    quality
  };
  return definitions;
}
function segmentBox(item, sampler) {
  const dx = item.to[0] - item.from[0];
  const dz = item.to[1] - item.from[1];
  const x = (item.from[0] + item.to[0]) / 2;
  const z = (item.from[1] + item.to[1]) / 2;
  return {
    position: { x, y: villageGroundHeight(sampler, x, z) + 0.035, z },
    size: { x: item.width, y: 0.07, z: Math.hypot(dx, dz) },
    yaw: Math.atan2(dx, dz)
  };
}
function courtyardBox(item, sampler) {
  const [x, z, diameter] = item;
  return {
    position: { x, y: villageGroundHeight(sampler, x, z) + 0.045, z },
    size: { x: diameter, y: 0.09, z: diameter * 0.72 },
    yaw: 0
  };
}
function batch10(id, boxes, color, textureUrl, part4) {
  if (boxes.length === 0) return null;
  return createVillageBoxBatch(id, boxes, {
    color,
    family: "canonical-street-hierarchy",
    part: part4,
    texturePolicy: { role: part4, shader: "terrain-worn-street", tileWorld: 1.1 },
    textureUrl
  });
}
function selectedRoutes(quality) {
  const count = quality === "low" ? 4 : quality === "medium" ? 6 : ROUTES.length;
  return ROUTES.slice(0, count);
}
function selectedCourtyards(quality) {
  const count = quality === "low" ? 2 : quality === "medium" ? 4 : COURTYARDS.length;
  return COURTYARDS.slice(0, count);
}
function route(kind, from, to, width) {
  return Object.freeze({ from: Object.freeze(from), kind, to: Object.freeze(to), width });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageTerrainBlendSystem.js
function createVillageTerrainBlendDefinitions(groundSampler, quality = "high") {
  const houses = selectedHouses3(quality);
  const aprons = houses.map((house2, index) => apronFor(house2, index, groundSampler));
  const seams = houses.flatMap((house2, index) => seamFor(house2, index, groundSampler));
  const definitions = [
    batch11("terrain-house-aprons", aprons, "#665542", TEXTURE_URLS.terrain.dirt1, "house-apron"),
    batch11("terrain-house-seams", seams, "#526044", TEXTURE_URLS.terrain.grass1, "house-seam")
  ];
  definitions.stats = {
    aprons: aprons.length,
    batches: definitions.length,
    houses: houses.length,
    quality,
    seams: seams.length
  };
  return definitions;
}
function apronFor(house2, index, sampler) {
  const width = 4.8 + index % 3 * 0.45;
  const depth = 2.1 + index % 2 * 0.35;
  return groundBox(house2, 0, 3.1, width, 0.06, depth, sampler);
}
function seamFor(house2, index, sampler) {
  const span = 5.6 + index % 4 * 0.35;
  return [
    groundBox(house2, -3.2, 0.2, 0.32, 0.05, span, sampler),
    groundBox(house2, 3.2, 0.2, 0.32, 0.05, span, sampler)
  ];
}
function groundBox(house2, localX, localZ, sizeX, sizeY, sizeZ, sampler) {
  const cosine = Math.cos(house2.yaw);
  const sine = Math.sin(house2.yaw);
  const x = house2.x + localX * cosine + localZ * sine;
  const z = house2.z - localX * sine + localZ * cosine;
  return {
    position: { x, y: villageGroundHeight(sampler, x, z) + sizeY / 2 + 0.02, z },
    size: { x: sizeX, y: sizeY, z: sizeZ },
    yaw: house2.yaw
  };
}
function batch11(id, boxes, color, textureUrl, part4) {
  return createVillageBoxBatch(id, boxes, {
    color,
    family: "canonical-terrain-blend",
    part: part4,
    texturePolicy: { role: part4, shader: "terrain-transition", tileWorld: 1.15 },
    textureUrl
  });
}
function selectedHouses3(quality) {
  const count = quality === "low" ? 8 : quality === "medium" ? 13 : 18;
  return CANONICAL_VILLAGE_HOUSES.slice(0, count);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillagePropSystem.js?v=20260720-canonical-valley-pass-04
function createVillagePropDefinitions(groundSampler, quality = "high") {
  const furniture = createVillageFurnitureDefinitions(groundSampler);
  const signs = createVillageDestinationSignDefinitions(groundSampler);
  const dressing = createVillageDistrictDressingDefinitions(groundSampler, quality);
  const history = createVillageEnvironmentalHistoryDefinitions(groundSampler, quality);
  const pedestrianWear = createVillagePedestrianWearDefinitions(groundSampler, quality);
  const streets = createVillageStreetHierarchyDefinitions(groundSampler, quality);
  const terrainBlend = createVillageTerrainBlendDefinitions(groundSampler, quality);
  const definitions = [
    ...streets,
    ...pedestrianWear,
    ...terrainBlend,
    ...furniture.definitions,
    ...dressing,
    ...history,
    ...signs.definitions
  ];
  return {
    definitions,
    stats: {
      districtDressing: dressing.stats,
      environmentalHistory: history.stats,
      pedestrianWear: pedestrianWear.stats,
      propCount: definitions.length,
      streetHierarchy: streets.stats,
      terrainBlend: terrainBlend.stats,
      ...furniture.stats,
      ...signs.stats
    }
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageRiverChannelProfile.js
var MINIMUM_DEPTH = 0.48;
var MAXIMUM_DEPTH = 2.35;
function riverChannelProfileAt(t, width) {
  const position = clamp8(Number(t) || 0, 0, 1);
  const channelWidth = Math.max(1, Number(width) || 1);
  const plungeInfluence = gaussian2(position, 0.16, 0.075);
  const narrowInfluence = gaussian2(position, 0.42, 0.1);
  const lowerPoolInfluence = gaussian2(position, RIVER_LAKE_T, 0.14);
  const depth = clamp8(
    0.58 + plungeInfluence * 1.42 + narrowInfluence * 0.2 + lowerPoolInfluence * 0.72 + Math.max(0, channelWidth - 3.1) * 0.035,
    MINIMUM_DEPTH,
    MAXIMUM_DEPTH
  );
  const bankWetness = clamp8(
    0.4 + plungeInfluence * 0.34 + narrowInfluence * 0.16 + lowerPoolInfluence * 0.2,
    0.35,
    0.96
  );
  const flowRegime = flowRegimeAt(position);
  const flowSpeed = flowSpeedFor(flowRegime, channelWidth);
  return {
    bankWetness,
    depth,
    flowRegime,
    flowSpeed
  };
}
function flowRegimeAt(position) {
  if (position < 0.09) return "mountain-source";
  if (position < 0.25) return "plunge-pool";
  if (position < 0.5) return "fast-narrows";
  if (position < RIVER_LAKE_T - 0.06) return "village-current";
  if (position < RIVER_LAKE_T + 0.14) return "calm-lower-pool";
  return "outlet-run";
}
function flowSpeedFor(regime, width) {
  const regimeSpeed = {
    "calm-lower-pool": 0.34,
    "fast-narrows": 1.18,
    "mountain-source": 0.82,
    "outlet-run": 0.62,
    "plunge-pool": 0.76,
    "village-current": 0.88
  }[regime];
  return clamp8(regimeSpeed * (4.2 / Math.max(3.1, width)), 0.18, 1.35);
}
function gaussian2(value, center, radius) {
  const normalized3 = (value - center) / radius;
  return Math.exp(-(normalized3 * normalized3));
}
function clamp8(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageRiverHydrology.js
var RIVER_CASCADES = CANONICAL_RIVER_CASCADES;
function createRiverHydrology(groundSampler, samples = 64) {
  const points = sampleRiverPath(samples).map((point3) => ({ ...point3 }));
  const lake = villageLandmarks().lake;
  const lakeLevel = villageGroundHeight(groundSampler, lake.x, lake.z) + 0.18;
  const lakeIndex = Math.round(RIVER_LAKE_T * (points.length - 1));
  points[lakeIndex].y = lakeLevel;
  resolveUpstreamHeights(points, lakeIndex, groundSampler);
  resolveDownstreamHeights(points, lakeIndex, groundSampler);
  appendChannelProfiles(points);
  appendFrames(points);
  const depths = points.map((point3) => point3.depth);
  const flowRegimes = [...new Set(points.map((point3) => point3.flowRegime))];
  return {
    lakeIndex,
    lakeLevel,
    points,
    stats: {
      cascades: RIVER_CASCADES.length,
      flowRegimes,
      lakeT: RIVER_LAKE_T,
      maximumDepth: Math.max(...depths),
      minimumDepth: Math.min(...depths),
      outletY: points.at(-1).y,
      sourceY: points[0].y,
      totalDrop: points[0].y - points.at(-1).y
    }
  };
}
function sampleHydrologyAt(profile, t) {
  const scaled = clamp9(t, 0, 1) * (profile.points.length - 1);
  const firstIndex = Math.min(profile.points.length - 2, Math.floor(scaled));
  const amount = scaled - firstIndex;
  return interpolatePoint(
    profile.points[firstIndex],
    profile.points[firstIndex + 1],
    amount
  );
}
function resolveUpstreamHeights(points, lakeIndex, groundSampler) {
  for (let index = lakeIndex - 1; index >= 0; index -= 1) {
    const point3 = points[index];
    const next = points[index + 1];
    const ground = villageGroundHeight(groundSampler, point3.x, point3.z) + 0.16;
    const cascade = cascadeDrop(point3.t, next.t);
    const preferred = Math.max(ground, next.y + 0.04 + cascade);
    point3.y = Math.min(preferred, next.y + 0.18 + cascade);
  }
}
function resolveDownstreamHeights(points, lakeIndex, groundSampler) {
  for (let index = lakeIndex + 1; index < points.length; index += 1) {
    const point3 = points[index];
    const previous = points[index - 1];
    const ground = villageGroundHeight(groundSampler, point3.x, point3.z) + 0.14;
    const preferred = Math.min(ground, previous.y - 0.04);
    point3.y = Math.max(preferred, previous.y - 0.18);
  }
}
function appendChannelProfiles(points) {
  for (const point3 of points) {
    Object.assign(point3, riverChannelProfileAt(point3.t, point3.width));
  }
}
function appendFrames(points) {
  for (let index = 0; index < points.length; index += 1) {
    points[index].normal = normalBetween(
      points[Math.max(0, index - 1)],
      points[Math.min(points.length - 1, index + 1)]
    );
  }
}
function cascadeDrop(start, end) {
  return RIVER_CASCADES.reduce((sum, cascade) => {
    const crossesCascade = cascade.t > start && cascade.t <= end;
    return sum + (crossesCascade ? cascade.drop : 0);
  }, 0);
}
function interpolatePoint(first, second, amount) {
  return {
    bankWetness: interpolate(first.bankWetness, second.bankWetness, amount),
    depth: interpolate(first.depth, second.depth, amount),
    flowRegime: amount < 0.5 ? first.flowRegime : second.flowRegime,
    flowSpeed: interpolate(first.flowSpeed, second.flowSpeed, amount),
    normal: {
      x: interpolate(first.normal.x, second.normal.x, amount),
      z: interpolate(first.normal.z, second.normal.z, amount)
    },
    t: interpolate(first.t, second.t, amount),
    width: interpolate(first.width, second.width, amount),
    x: interpolate(first.x, second.x, amount),
    y: interpolate(first.y, second.y, amount),
    z: interpolate(first.z, second.z, amount)
  };
}
function interpolate(first, second, amount) {
  return first + (second - first) * amount;
}
function clamp9(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, Number(value) || 0));
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageWaterMaterialPolicy.js
var WATER_SHADER = "alpine-two-fetch-variant-flow-fresnel-foam-water";
function waterShaderPolicy(waterVariant = "lake") {
  return Object.freeze({
    animated: true,
    flowLayers: 2,
    shader: WATER_SHADER,
    textureDriven: true,
    waterClass: waterVariant === "river" ? "stream" : waterVariant,
    waterVariant
  });
}
function createAnimatedWaterTexturePolicy(options) {
  assertLocalWaterTexture(options.primaryUrl, `${options.waterVariant} primary`);
  if (options.mixUrl) assertLocalWaterTexture(options.mixUrl, `${options.waterVariant} mix`);
  return {
    ...waterShaderPolicy(options.waterVariant),
    fallbackFirst: true,
    publicFirebase: false,
    realMaterialRequired: true,
    sameOrigin: true
  };
}
function createStaticWaterTexturePolicy(options) {
  assertLocalWaterTexture(options.primaryUrl, options.role);
  const policy2 = {
    fallbackFirst: true,
    publicFirebase: false,
    realMaterialRequired: true,
    role: options.role,
    sameOrigin: true
  };
  if (options.shader) policy2.shader = options.shader;
  if (Number.isFinite(options.tileWorld)) policy2.tileWorld = options.tileWorld;
  return policy2;
}
function assertLocalWaterTexture(url, role) {
  assertProductionMaterialUrl(url, `village water ${role}`);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageFoamBatchGeometry.js
function createFoamBatchDefinition(groundSampler, hydrology = null) {
  const profile = hydrology || createRiverHydrology(groundSampler);
  const geometry = { faces: [], uvs: [], vertices: [] };
  appendLakeFoam(geometry, villageLandmarks().lake, profile.lakeLevel, 32);
  appendRiverFoam(geometry, profile);
  return {
    alphaMode: "BLEND",
    color: "#e8fbff",
    doubleSided: true,
    ...geometry,
    id: "Awtsmoos_connected_water_foam_batch",
    mapRepeat: [12, 1],
    noEdge: true,
    opacity: 0.72,
    shape: "manual",
    solid: false,
    texturePolicy: {
      ...createAnimatedWaterTexturePolicy({
        primaryUrl: TEXTURE_URLS.water.bright,
        waterVariant: "foam"
      }),
      alpha: 0.72,
      role: "connected-water-foam"
    },
    textureUrl: TEXTURE_URLS.water.bright,
    transparent: true,
    userData: {
      family: "connected-water-foam",
      staticBatch: true,
      waterVariant: "foam"
    }
  };
}
function appendLakeFoam(output, lake, level, segments) {
  for (let index = 0; index <= segments; index += 1) {
    const ratio = index / segments;
    const angle = ratio * Math.PI * 2;
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    appendPair2(
      output,
      [lake.x + cosine * (lake.radiusX - 0.3), level + 0.035, lake.z + sine * (lake.radiusZ - 0.3)],
      [lake.x + cosine * (lake.radiusX + 0.65), level + 0.025, lake.z + sine * (lake.radiusZ + 0.65)],
      ratio
    );
  }
}
function appendRiverFoam(output, profile) {
  for (const side of [-1, 1]) {
    let previous = null;
    for (let index = 0; index < profile.points.length; index += 2) {
      const point3 = profile.points[index];
      const edge = bank(point3, side, point3.width - 0.12);
      const outer = bank(point3, side, point3.width + 0.38);
      if (previous) appendQuad2(output, previous.edge, previous.outer, outer, edge, point3.t);
      previous = { edge, outer };
    }
  }
}
function bank(point3, side, distance) {
  return [
    point3.x + point3.normal.x * distance * side,
    point3.y + 0.035,
    point3.z + point3.normal.z * distance * side
  ];
}
function appendPair2(output, inner, outer, ratio) {
  if (output.vertices.length >= 2) {
    const start = output.vertices.length - 2;
    output.faces.push([start, start + 1, start + 3, start + 2]);
  }
  output.vertices.push(inner, outer);
  output.uvs.push(ratio, 0, ratio, 1);
}
function appendQuad2(output, a, b, c, d, ratio) {
  const start = output.vertices.length;
  output.vertices.push(a, b, c, d);
  output.faces.push([start, start + 1, start + 2, start + 3]);
  output.uvs.push(ratio, 0, ratio, 1, ratio + 0.1, 1, ratio + 0.1, 0);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageRiparianReedPlacement.js
var RIPARIAN_REED_COUNT = 64;
var RIPARIAN_CLEARING_MARGIN = 1.4;
var SAMPLE_OFFSETS = Object.freeze([0, -0.012, 0.012, -0.026, 0.026, -0.045, 0.045]);
var REGIME_GROWTH = Object.freeze({
  "calm-lower-pool": 0.28,
  "fast-narrows": -0.12,
  "mountain-source": -0.18,
  "outlet-run": 0.16,
  "plunge-pool": 0.12,
  "village-current": 0.04
});
function createRiparianReedPlacements(groundSampler, profile) {
  return Array.from({ length: RIPARIAN_REED_COUNT }, (_, index) => resolvePlacement(index, groundSampler, profile));
}
function isOutsideRiparianClearings(x, z) {
  return CANONICAL_VILLAGE_CLEARINGS.every((clearing2) => Math.hypot(x - clearing2.x, z - clearing2.z) > clearing2.radius + RIPARIAN_CLEARING_MARGIN);
}
function resolvePlacement(index, groundSampler, profile) {
  const baseT = (index + 0.5) / RIPARIAN_REED_COUNT;
  const preferredSide = index % 2 === 0 ? 1 : -1;
  const candidates = [];
  for (const offset of SAMPLE_OFFSETS) {
    for (const side of [preferredSide, -preferredSide]) {
      const candidate = placementCandidate(index, baseT + offset, side, groundSampler, profile);
      if (isOutsideRiparianClearings(candidate.x, candidate.z)) candidates.push(candidate);
    }
  }
  if (!candidates.length) throw new Error(`No valid riparian reed placement for band ${index}.`);
  return candidates.sort((first, second) => second.score - first.score)[0];
}
function placementCandidate(index, t, side, groundSampler, profile) {
  const point3 = sampleHydrologyAt(profile, clamp10(t));
  const variation = Math.sin(index * 1.73 + side * 0.61);
  const regimeGrowth = REGIME_GROWTH[point3.flowRegime] || 0;
  const bankDistance = point3.width + 0.5 + (1 - point3.bankWetness) * 0.52 + variation * 0.18;
  const x = point3.x + point3.normal.x * bankDistance * side;
  const z = point3.z + point3.normal.z * bankDistance * side;
  const flowLean = 0.035 + point3.flowSpeed * 0.035;
  return {
    bankDistance,
    bankWetness: point3.bankWetness,
    flowRegime: point3.flowRegime,
    height: 0.56 + point3.bankWetness * 0.52 + regimeGrowth + variation * 0.07,
    leanX: -point3.normal.z * flowLean + point3.normal.x * variation * 0.025,
    leanZ: point3.normal.x * flowLean + point3.normal.z * variation * 0.025,
    score: point3.bankWetness + regimeGrowth - Math.abs(point3.t - clamp10(t)) * 4,
    side,
    t: point3.t,
    x,
    y: villageGroundHeight(groundSampler, x, z) + 0.025,
    z
  };
}
function clamp10(value) {
  return Math.max(2e-3, Math.min(0.998, Number(value) || 0));
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageReedBatchGeometry.js
function createReedBatchDefinition(groundSampler, hydrology = null) {
  const profile = hydrology || createRiverHydrology(groundSampler, 64);
  const placements = createRiparianReedPlacements(groundSampler, profile);
  const geometry = { faces: [], vertices: [] };
  for (const placement2 of placements) appendCrossedReed(geometry, placement2);
  return {
    color: "#769756",
    doubleSided: true,
    ...geometry,
    id: "Awtsmoos_stream_reeds_batch",
    noEdge: true,
    shape: "manual",
    solid: false,
    texturePolicy: createStaticWaterTexturePolicy({
      primaryUrl: TEXTURE_URLS.terrain.marshGrass,
      role: "connected-river-reed-batch"
    }),
    textureUrl: TEXTURE_URLS.terrain.marshGrass,
    userData: {
      ecology: "moisture-flow-terrain-clearings",
      family: "stream-reeds",
      instances: placements.length,
      staticBatch: true
    }
  };
}
function appendCrossedReed(geometry, placement2) {
  const width = 0.038 + placement2.bankWetness * 0.018;
  const top = placement2.y + placement2.height;
  appendQuad3(geometry, [
    [placement2.x - width, placement2.y, placement2.z],
    [placement2.x + width, placement2.y, placement2.z],
    [placement2.x + width + placement2.leanX, top, placement2.z + placement2.leanZ],
    [placement2.x - width + placement2.leanX, top, placement2.z + placement2.leanZ]
  ]);
  appendQuad3(geometry, [
    [placement2.x, placement2.y, placement2.z - width],
    [placement2.x, placement2.y, placement2.z + width],
    [placement2.x + placement2.leanX, top, placement2.z + width + placement2.leanZ],
    [placement2.x + placement2.leanX, top, placement2.z - width + placement2.leanZ]
  ]);
}
function appendQuad3(geometry, vertices) {
  const start = geometry.vertices.length;
  geometry.vertices.push(...vertices);
  geometry.faces.push([start, start + 1, start + 2, start + 3]);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageLakeGeometry.js
function createLakeGeometry(lake, level, segments = 64) {
  const vertices = [[lake.x, level, lake.z]];
  const faces = [];
  const uvs = [0.5, 0.5];
  for (let index = 0; index < segments; index += 1) {
    const angle = index / segments * Math.PI * 2;
    const pulse = 1 + Math.sin(angle * 5 + 0.7) * 0.035 + Math.cos(angle * 3) * 0.022;
    const x = lake.x + Math.cos(angle) * lake.radiusX * pulse;
    const z = lake.z + Math.sin(angle) * lake.radiusZ * pulse;
    vertices.push([x, level, z]);
    uvs.push(0.5 + Math.cos(angle) * 0.5, 0.5 + Math.sin(angle) * 0.5);
  }
  for (let index = 0; index < segments; index += 1) {
    const current = index + 1;
    const next = (index + 1) % segments + 1;
    faces.push([0, current, next]);
  }
  return { faces, uvs, vertices };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageRiverBedGeometry.js
var RIVER_BED_BANDS = 5;
var CHANNEL_OFFSETS = Object.freeze([-1.16, -0.68, 0, 0.68, 1.16]);
var DEPTH_FACTORS = Object.freeze([0.06, 0.28, 1, 0.28, 0.06]);
function createRiverBedGeometry(profile) {
  const vertices = [];
  const faces = [];
  const uvs = [];
  for (const [index, point3] of profile.points.entries()) {
    appendCrossSection(vertices, uvs, point3, index);
  }
  for (let index = 0; index < profile.points.length - 1; index += 1) {
    appendSectionFaces(faces, index * RIVER_BED_BANDS);
  }
  return {
    faces,
    uvs,
    vertices
  };
}
function appendCrossSection(vertices, uvs, point3, index) {
  for (let band = 0; band < RIVER_BED_BANDS; band += 1) {
    const lateralOffset = point3.width * CHANNEL_OFFSETS[band];
    const depth = depthForBand(point3, band);
    vertices.push([
      point3.x + point3.normal.x * lateralOffset,
      point3.y - depth,
      point3.z + point3.normal.z * lateralOffset
    ]);
    uvs.push(index / 5.5, band / (RIVER_BED_BANDS - 1));
  }
}
function appendSectionFaces(faces, start) {
  const next = start + RIVER_BED_BANDS;
  for (let band = 0; band < RIVER_BED_BANDS - 1; band += 1) {
    faces.push([
      start + band,
      next + band,
      next + band + 1,
      start + band + 1
    ]);
  }
}
function depthForBand(point3, band) {
  const wetShoulderDepth = 0.035 + point3.bankWetness * 0.085;
  if (band === 0 || band === RIVER_BED_BANDS - 1) {
    return wetShoulderDepth;
  }
  return Math.max(wetShoulderDepth, point3.depth * DEPTH_FACTORS[band]);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageRiverSurfaceSection.js
var LANE_FACTORS = Object.freeze([-1, -0.76, -0.42, 0, 0.42, 0.76, 1]);
var LANE_UVS = Object.freeze([0, 0.1, 0.29, 0.5, 0.71, 0.9, 1]);
var RIVER_SURFACE_LANE_COUNT = LANE_FACTORS.length;
function appendRiverSurfaceSection(point3, pointIndex, traveledDistance, vertices, uvs) {
  const normal = resolveSurfaceNormal(point3);
  const width = Math.max(0.2, numberOr(point3?.width, 1));
  const asymmetry = Math.sin(numberOr(point3?.t, 0) * 11.3 + pointIndex * 0.37) * 0.055;
  const leftWidth = width * (1 + asymmetry);
  const rightWidth = width * (1 - asymmetry);
  const longitudinalUv = traveledDistance / 4.5;
  for (let laneIndex = 0; laneIndex < LANE_FACTORS.length; laneIndex += 1) {
    const lane = LANE_FACTORS[laneIndex];
    const offset = lane < 0 ? lane * leftWidth : lane * rightWidth;
    vertices.push([
      point3.x + normal.x * offset,
      point3.y + surfaceElevation(point3, lane, pointIndex),
      point3.z + normal.z * offset
    ]);
    uvs.push(longitudinalUv, LANE_UVS[laneIndex]);
  }
}
function resolveSurfaceNormal(point3) {
  const normalX = numberOr(point3?.normal?.x, numberOr(point3?.normalX, 1));
  const normalZ = numberOr(point3?.normal?.z, numberOr(point3?.normalZ, 0));
  const length3 = Math.hypot(normalX, normalZ);
  if (length3 < 1e-4) return { x: 1, z: 0 };
  return { x: normalX / length3, z: normalZ / length3 };
}
function surfaceElevation(point3, lane, pointIndex) {
  if (lane === 0) return 0;
  const lateralDistance = Math.abs(lane);
  const flowSpeed = clamp11(numberOr(point3?.flowSpeed, 0.7), 0.18, 1.35);
  const bankWetness = clamp11(numberOr(point3?.bankWetness, 0.5), 0.35, 0.96);
  const depthWeight = clamp11(numberOr(point3?.depth, 0.7) / 2.35, 0, 1);
  const bankLift = Math.pow(lateralDistance, 1.7) * (8e-3 + bankWetness * 0.012);
  const shoulderDraw = -Math.sin(Math.PI * lateralDistance) * (4e-3 + flowSpeed * 6e-3);
  const ripplePhase = numberOr(point3?.t, 0) * 19.7 + lane * 4.6 + pointIndex * 0.41;
  const ripple = Math.sin(ripplePhase) * lateralDistance * (3e-3 + flowSpeed * 4e-3) * (1 - depthWeight * 0.45);
  return bankLift + shoulderDraw + ripple;
}
function numberOr(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}
function clamp11(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageRiverSurfaceGeometry.js?v=20260720-canonical-valley-pass-04
function createRiverSurfaceGeometry(profile) {
  const points = Array.isArray(profile?.points) ? profile.points : [];
  const vertices = [];
  const faces = [];
  const uvs = [];
  let traveledDistance = 0;
  for (let index = 0; index < points.length; index += 1) {
    if (index > 0) {
      traveledDistance += centerlineDistance(points[index - 1], points[index]);
    }
    appendRiverSurfaceSection(points[index], index, traveledDistance, vertices, uvs);
  }
  for (let index = 0; index < points.length - 1; index += 1) {
    appendSectionFaces2(faces, index);
  }
  return { faces, uvs, vertices };
}
function appendSectionFaces2(faces, sectionIndex) {
  const current = sectionIndex * RIVER_SURFACE_LANE_COUNT;
  const next = current + RIVER_SURFACE_LANE_COUNT;
  for (let lane = 0; lane < RIVER_SURFACE_LANE_COUNT - 1; lane += 1) {
    faces.push([
      current + lane,
      next + lane,
      next + lane + 1,
      current + lane + 1
    ]);
  }
}
function centerlineDistance(first, second) {
  return Math.hypot(
    second.x - first.x,
    second.y - first.y,
    second.z - first.z
  );
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageWaterBodies.js?v=20260720-canonical-valley-pass-04
function createWaterBodyDefinitions(groundSampler, hydrology = null) {
  const profile = hydrology || createRiverHydrology(groundSampler);
  const lake = villageLandmarks().lake;
  const definitions = [
    waterManual({
      color: "#1f6470",
      geometry: createLakeGeometry(lake, profile.lakeLevel),
      id: "Awtsmoos_lake_basin_alpine_reflection_water",
      mapRepeat: [6.8, 5.2],
      mixStrength: 0.18,
      mixTextureUrl: MOUNTAIN_VILLAGE_SOURCES.waterStream,
      opacity: 0.7,
      textureUrl: MOUNTAIN_VILLAGE_SOURCES.waterLake,
      waterVariant: "lake"
    }),
    riverBedManual(profile),
    waterManual({
      color: "#286d77",
      geometry: createRiverSurfaceGeometry(profile),
      id: "Awtsmoos_flowing_stream_alpine_current_water",
      mapRepeat: [22, 2.6],
      mixStrength: 0.22,
      mixTextureUrl: MOUNTAIN_VILLAGE_SOURCES.waterLake,
      opacity: 0.67,
      textureUrl: MOUNTAIN_VILLAGE_SOURCES.waterStream,
      waterVariant: "river"
    })
  ];
  definitions.hydrology = profile;
  return definitions;
}
function riverBedManual(profile) {
  return {
    color: "#394843",
    doubleSided: true,
    ...createRiverBedGeometry(profile),
    id: "Awtsmoos_river_bed_thalweg_wet_fieldstone",
    mapImage: cachedTextureImage(MOUNTAIN_VILLAGE_SOURCES.fieldstone),
    mapRepeat: [20, 3.4],
    noEdge: true,
    shape: "manual",
    solid: false,
    texturePolicy: createStaticWaterTexturePolicy({
      primaryUrl: MOUNTAIN_VILLAGE_SOURCES.fieldstone,
      role: "wet-river-stone",
      shader: "terrain-transition",
      tileWorld: 0.92
    }),
    textureUrl: MOUNTAIN_VILLAGE_SOURCES.fieldstone,
    transparent: false,
    userData: {
      family: "connected-alpine-village-hydrology",
      part: "river-bed-channel",
      staticGeometry: true
    }
  };
}
function waterManual(options) {
  return {
    alphaMode: "BLEND",
    color: options.color,
    doubleSided: true,
    ...options.geometry,
    id: options.id,
    mapImage: cachedTextureImage(options.textureUrl),
    mapRepeat: options.mapRepeat,
    mixImage: cachedTextureImage(options.mixTextureUrl),
    mixPatchScale: 0.038,
    mixPatchSharpness: 0.31,
    mixRepeat: options.mapRepeat,
    mixStrength: options.mixStrength,
    mixTextureUrl: options.mixTextureUrl,
    noEdge: true,
    opacity: options.opacity,
    shape: "manual",
    solid: false,
    texturePolicy: createAnimatedWaterTexturePolicy({
      mixUrl: options.mixTextureUrl,
      primaryUrl: options.textureUrl,
      waterVariant: options.waterVariant
    }),
    textureUrl: options.textureUrl,
    transparent: true,
    userData: {
      family: "connected-alpine-village-hydrology",
      waterClass: options.waterVariant,
      waterVariant: options.waterVariant
    }
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageWaterfallGeometryMath.js
function cascadeFrame(profile, t) {
  const top = sampleHydrologyAt(profile, Math.max(0, t - 0.014));
  const bottom = sampleHydrologyAt(profile, Math.min(1, t + 0.014));
  const deltaX = bottom.x - top.x;
  const deltaZ = bottom.z - top.z;
  const inverseLength = 1 / (Math.hypot(deltaX, deltaZ) || 1);
  return {
    bottom,
    direction: { x: deltaX * inverseLength, z: deltaZ * inverseLength },
    halfWidth: Math.min(top.width, bottom.width) * 0.9,
    top
  };
}
function interpolateCascadePoint(frame, ratio, forwardOffset = 0) {
  const normalX = mix5(frame.top.normal.x, frame.bottom.normal.x, ratio);
  const normalZ = mix5(frame.top.normal.z, frame.bottom.normal.z, ratio);
  const inverseLength = 1 / (Math.hypot(normalX, normalZ) || 1);
  return {
    normal: { x: normalX * inverseLength, z: normalZ * inverseLength },
    x: mix5(frame.top.x, frame.bottom.x, ratio) + frame.direction.x * forwardOffset,
    y: mix5(frame.top.y, frame.bottom.y, ratio),
    z: mix5(frame.top.z, frame.bottom.z, ratio) + frame.direction.z * forwardOffset
  };
}
function offsetPoint(point3, distance, y = point3.y) {
  return [
    point3.x + point3.normal.x * distance,
    y,
    point3.z + point3.normal.z * distance
  ];
}
function mix5(first, second, ratio) {
  return first + (second - first) * ratio;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageWaterfallImpactGeometry.js
var DISTANCES = Object.freeze([0, 1.1, 2.6, 4.4]);
var WIDTH_SCALES = Object.freeze([0.86, 1.18, 1.08, 0.72]);
function createWaterfallImpactGeometry(profile) {
  const output = { faces: [], uvs: [], vertices: [] };
  for (const cascade of RIVER_CASCADES) {
    appendImpact(output, cascadeFrame(profile, cascade.t));
  }
  return output;
}
function appendImpact(output, frame) {
  const firstVertex = output.vertices.length;
  for (let row = 0; row < DISTANCES.length; row += 1) {
    const distance = DISTANCES[row];
    const center = {
      normal: frame.bottom.normal,
      x: frame.bottom.x + frame.direction.x * distance,
      y: frame.bottom.y + 0.045 - row * 8e-3,
      z: frame.bottom.z + frame.direction.z * distance
    };
    const width = frame.halfWidth * WIDTH_SCALES[row];
    output.vertices.push(
      offsetPoint(center, -width),
      offsetPoint(center, width)
    );
    const ratio = row / (DISTANCES.length - 1);
    output.uvs.push(ratio * 2.4, 0, ratio * 2.4, 1);
    if (row > 0) output.faces.push([
      firstVertex + row * 2 - 2,
      firstVertex + row * 2,
      firstVertex + row * 2 + 1,
      firstVertex + row * 2 - 1
    ]);
  }
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageWaterfallLedgeGeometry.js
function createWaterfallLedgeDefinition(profile) {
  const textureUrl = TEXTURE_URLS.bricks.fieldstone1;
  const ledges = RIVER_CASCADES.map((cascade) => {
    const frame = cascadeFrame(profile, cascade.t);
    return {
      position: {
        x: frame.top.x,
        y: frame.bottom.y - 0.16,
        z: frame.top.z
      },
      size: {
        x: frame.halfWidth * 2.5,
        y: 0.55,
        z: 1.05
      },
      yaw: Math.atan2(-frame.top.normal.z, frame.top.normal.x)
    };
  });
  return createVillageBoxBatch("stream-cascade-fieldstone-ledges", ledges, {
    color: "#6f6a61",
    family: "connected-stream-cascade",
    part: "fieldstone-ledge",
    texturePolicy: createStaticWaterTexturePolicy({
      primaryUrl: textureUrl,
      role: "waterfall-fieldstone-ledge"
    }),
    textureUrl
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageWaterfallMistGeometry.js
function createWaterfallMistGeometry(profile) {
  const output = { faces: [], uvs: [], vertices: [] };
  for (const [index, cascade] of RIVER_CASCADES.entries()) {
    appendMistCross(output, cascadeFrame(profile, cascade.t), index);
  }
  return output;
}
function appendMistCross(output, frame, index) {
  const centerX = frame.bottom.x + frame.direction.x * 0.62;
  const centerZ = frame.bottom.z + frame.direction.z * 0.62;
  const halfWidth = frame.halfWidth * (0.62 + index * 0.05);
  const bottomY = frame.bottom.y + 0.06;
  const topY = bottomY + 1.7 + index * 0.22;
  appendVeil(output, centerX, centerZ, bottomY, topY, {
    x: frame.bottom.normal.x,
    z: frame.bottom.normal.z
  }, halfWidth);
  appendVeil(output, centerX, centerZ, bottomY, topY, frame.direction, halfWidth * 0.72);
}
function appendVeil(output, centerX, centerZ, bottomY, topY, axis, halfWidth) {
  const start = output.vertices.length;
  output.vertices.push(
    [centerX - axis.x * halfWidth, bottomY, centerZ - axis.z * halfWidth],
    [centerX + axis.x * halfWidth, bottomY, centerZ + axis.z * halfWidth],
    [centerX + axis.x * halfWidth * 1.18, topY, centerZ + axis.z * halfWidth * 1.18],
    [centerX - axis.x * halfWidth * 1.18, topY, centerZ - axis.z * halfWidth * 1.18]
  );
  output.faces.push([start, start + 1, start + 2, start + 3]);
  output.uvs.push(0, 1, 1, 1, 1, 0, 0, 0);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageWaterfallSheetGeometry.js
var RIBBON_PROFILES = Object.freeze([
  Object.freeze({
    center: 0,
    forwardBulge: 0.32,
    halfWidth: 0.68,
    lateralDrift: 0.018,
    phase: 0,
    uvScale: 3.2
  }),
  Object.freeze({
    center: -0.82,
    forwardBulge: 0.23,
    halfWidth: 0.09,
    lateralDrift: 0.028,
    phase: 0.7,
    uvScale: 4.1
  }),
  Object.freeze({
    center: 0.82,
    forwardBulge: 0.25,
    halfWidth: 0.09,
    lateralDrift: 0.028,
    phase: 2.4,
    uvScale: 4.35
  })
]);
var WATERFALL_RIBBON_COUNT = RIBBON_PROFILES.length;
var WATERFALL_SHEET_ROWS = 7;
function createWaterfallSheetGeometry(profile) {
  const output = { faces: [], uvs: [], vertices: [] };
  for (const cascade of RIVER_CASCADES) {
    const frame = cascadeFrame(profile, cascade.t);
    for (const ribbon of RIBBON_PROFILES) {
      appendRibbon(output, frame, ribbon);
    }
  }
  return output;
}
function appendRibbon(output, frame, ribbon) {
  const firstVertex = output.vertices.length;
  for (let row = 0; row <= WATERFALL_SHEET_ROWS; row += 1) {
    const ratio = row / WATERFALL_SHEET_ROWS;
    const arc = Math.sin(ratio * Math.PI);
    const center = interpolateCascadePoint(frame, ratio, arc * ribbon.forwardBulge);
    const lateralDrift = arc * Math.sin(ratio * Math.PI * 2 + ribbon.phase) * ribbon.lateralDrift;
    const centerOffset = frame.halfWidth * (ribbon.center + lateralDrift);
    const widthScale = 1 - arc * 0.14 + ratio * 0.08;
    const halfWidth = frame.halfWidth * ribbon.halfWidth * widthScale;
    output.vertices.push(
      offsetPoint(center, centerOffset - halfWidth),
      offsetPoint(center, centerOffset + halfWidth)
    );
    output.uvs.push(0, ratio * ribbon.uvScale, 1, ratio * ribbon.uvScale);
    if (row > 0) {
      appendRowFace(output.faces, firstVertex + row * 2 - 2);
    }
  }
}
function appendRowFace(faces, start) {
  faces.push([start, start + 2, start + 3, start + 1]);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageWaterfallSystem.js
function createWaterfallDefinitions(groundSampler, hydrology = null) {
  const profile = hydrology || createRiverHydrology(groundSampler);
  return [
    waterDefinition({
      color: "#d7f6ff",
      geometry: createWaterfallSheetGeometry(profile),
      id: "stream-waterfall-sheets",
      mapRepeat: [4.2, 2.8],
      mixStrength: 0.24,
      mixTextureUrl: MOUNTAIN_VILLAGE_SOURCES.waterLake,
      opacity: 0.84,
      textureUrl: MOUNTAIN_VILLAGE_SOURCES.waterStream,
      waterVariant: "waterfall"
    }),
    waterDefinition({
      color: "#effcff",
      geometry: createWaterfallImpactGeometry(profile),
      id: "stream-whitewater-impact",
      mapRepeat: [7, 1.2],
      mixStrength: 0.2,
      mixTextureUrl: MOUNTAIN_VILLAGE_SOURCES.waterStream,
      opacity: 0.78,
      textureUrl: TEXTURE_URLS.water.bright,
      waterVariant: "foam"
    }),
    waterDefinition({
      color: "#d9f8ff",
      geometry: createWaterfallMistGeometry(profile),
      id: "stream-waterfall-impact-mist",
      mapRepeat: [2.6, 2.2],
      mixStrength: 0,
      mixTextureUrl: null,
      opacity: 0.34,
      textureUrl: TEXTURE_URLS.water.bright,
      waterVariant: "mist"
    }),
    createWaterfallLedgeDefinition(profile)
  ];
}
function waterDefinition(options) {
  const definition4 = {
    alphaMode: "BLEND",
    color: options.color,
    doubleSided: true,
    ...options.geometry,
    id: `Awtsmoos_${options.id}`,
    mapImage: cachedTextureImage(options.textureUrl),
    mapRepeat: options.mapRepeat,
    noEdge: true,
    opacity: options.opacity,
    shape: "manual",
    solid: false,
    texturePolicy: createAnimatedWaterTexturePolicy({
      mixUrl: options.mixTextureUrl,
      primaryUrl: options.textureUrl,
      waterVariant: options.waterVariant
    }),
    textureUrl: options.textureUrl,
    transparent: true,
    userData: {
      family: "connected-stream-cascade",
      instances: RIVER_CASCADES.length,
      part: options.id,
      waterVariant: options.waterVariant
    }
  };
  if (options.mixTextureUrl) addMixTexture(definition4, options);
  return definition4;
}
function addMixTexture(definition4, options) {
  definition4.mixImage = cachedTextureImage(options.mixTextureUrl);
  definition4.mixRepeat = options.mapRepeat;
  definition4.mixStrength = options.mixStrength;
  definition4.mixTextureUrl = options.mixTextureUrl;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageWaterSystem.js?v=20260720-canonical-valley-pass-04
function createVillageWaterDefinitions(groundSampler) {
  const hydrology = createRiverHydrology(groundSampler);
  const waterBodies = createWaterBodyDefinitions(groundSampler, hydrology);
  const foamBatch = createFoamBatchDefinition(groundSampler, hydrology);
  const reedBatch = createReedBatchDefinition(groundSampler, hydrology);
  const waterfalls = createWaterfallDefinitions(groundSampler, hydrology);
  const definitions = [
    ...waterBodies,
    foamBatch,
    reedBatch,
    ...waterfalls
  ];
  const animatedWater = definitions.filter(isAnimatedWater);
  const surfaceWaterBodies = waterBodies.filter(isAnimatedWater);
  const riverBedDraws = waterBodies.filter(isRiverBed).length;
  return {
    definitions,
    stats: {
      connectedSourceToOutlet: true,
      definitionCount: definitions.length,
      foamDraws: countVariant(animatedWater, "foam"),
      hydrology: hydrology.stats,
      mistDraws: countVariant(animatedWater, "mist"),
      reedBatches: 1,
      reedInstances: 64,
      riverBedDraws,
      shader: "alpine-two-fetch-variant-flow-fresnel-foam-water",
      surfaceWaterBodies: surfaceWaterBodies.length,
      textureDriven: true,
      transparentWaterDraws: animatedWater.length,
      waterBodies: surfaceWaterBodies.length,
      waterDraws: animatedWater.length,
      waterfallBatches: waterfalls.length,
      waterfallCascades: hydrology.stats.cascades,
      waterfallDraws: waterfalls.filter(isAnimatedWater).length
    }
  };
}
function isAnimatedWater(definition4) {
  return definition4?.texturePolicy?.animated === true && typeof definition4?.userData?.waterVariant === "string";
}
function isRiverBed(definition4) {
  return definition4?.userData?.part === "river-bed-channel" && definition4?.userData?.staticGeometry === true;
}
function countVariant(definitions, variant) {
  return definitions.filter((definition4) => definition4.userData.waterVariant === variant).length;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageWorldLayers.js
var VILLAGE_WORLD_LAYERS = Object.freeze([
  "mountains",
  "water",
  "props",
  "arrival-composition",
  "foundations",
  "districts",
  "house-bubbles",
  "practical-lighting",
  "landscape",
  "hero-cottage-craft",
  "hero-gardens",
  "forest-edge",
  "living-simulation",
  "animated-chossid-population",
  "creatures"
]);

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageWorldSystem.js?v=20260720-canonical-valley-pass-04
function createVillageWorldDefinitions(groundSampler, quality = "high") {
  const systems = createSystems(groundSampler, quality);
  const definitions = flattenSystems(systems);
  return {
    definitions,
    stats: createStats2(systems, definitions, quality)
  };
}
function createSystems(groundSampler, quality) {
  const architecture = createVillageDistrictArchitecture(groundSampler, quality);
  return {
    architecture,
    arrival: createVillageArrivalComposition(groundSampler),
    budget: villageWorldBudget(quality),
    cottageCraft: createHeroCottageCraftDefinitions(groundSampler),
    creatures: createVillageCreatureDefinitions(groundSampler, quality),
    forestEdge: createForestEdgeDefinitions(groundSampler, quality),
    foundations: createVillageFoundationDefinitions(architecture, groundSampler),
    heroGardens: createHeroValleyGardenDefinitions(groundSampler),
    houseBubbles: createVillageHouseBubbleDefinitions(groundSampler, quality),
    landscape: createVillageEssentialLandscapeDefinitions(groundSampler, quality),
    life: createVillageLifeContracts(quality),
    mountains: createAtmosphericMountainDefinitions(quality),
    population: emptyAnimatedPopulation(),
    practicalLights: createVillagePracticalLightDefinitions(groundSampler, quality),
    props: createVillagePropDefinitions(groundSampler, quality),
    water: createVillageWaterDefinitions(groundSampler)
  };
}
function flattenSystems(systems) {
  return [
    ...systems.mountains,
    ...systems.water.definitions,
    ...systems.props.definitions,
    ...systems.arrival,
    ...systems.foundations,
    ...systems.architecture,
    ...systems.houseBubbles,
    ...systems.practicalLights,
    ...systems.landscape.definitions,
    ...systems.cottageCraft,
    ...systems.heroGardens,
    ...systems.forestEdge,
    ...systems.population,
    ...systems.creatures
  ];
}
function createStats2(s, definitions, quality) {
  return {
    architecture: s.architecture.stats,
    arrival: s.arrival.stats,
    botanicalEnrichment: "deferred-after-movement",
    budget: s.budget,
    creatures: s.creatures.stats,
    definitionCount: definitions.length,
    forestEdge: s.forestEdge.stats,
    foundations: s.foundations.stats,
    heroCraftDefinitions: s.cottageCraft.length,
    heroGardenDefinitions: s.heroGardens.length,
    houseBubbles: s.houseBubbles.stats,
    landscape: s.landscape.stats,
    layers: VILLAGE_WORLD_LAYERS,
    life: s.life.stats,
    mountains: s.mountains.stats,
    name: "Reference golden-hour Awtsmoos mountain village",
    population: s.population.stats,
    practicalLights: s.practicalLights.stats,
    props: s.props.stats,
    quality,
    water: s.water.stats
  };
}
function emptyAnimatedPopulation() {
  return Object.assign([], {
    stats: {
      definitions: 0,
      people: 0,
      realtimeAnimations: "skeletal-chossid.glb-runtime-population",
      visualPolicy: "no-primitive-humans"
    }
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/Terrain3D.js
var heightAt = terrainHeightAt;
async function createTerrainPackage(obstacles, grassImage, dirtImage, groundSampler, options = {}) {
  const quality = options.quality || "medium";
  const boot = options.boot || globalThis.AwtsmoosBootTracker;
  const onProgress = options.onProgress;
  const yieldWork = options.yieldWork || browserYield4;
  const steps = options.steps || terrainStepsForQuality(quality);
  report(onProgress, boot, "Sampling the canonical valley\u2026", 0.52);
  const terrain = await createTerrainGeometryAsync(void 0, steps, {
    onPhase: (message, progress) => report(onProgress, boot, message, progress),
    onProgress: (current, total) => boot?.progress(
      "terrain-grid",
      current,
      total,
      "Building exact terrain while the interface remains responsive"
    ),
    yieldEvery: options.terrainYieldEvery,
    yieldWork
  });
  report(onProgress, boot, "Laying the road and inhabited stone\u2026", 0.85);
  const road2 = houseRoadSystem(obstacles.assets || {}, groundSampler, obstacles);
  const village = createVillageWorldDefinitions(groundSampler, quality);
  await yieldWork();
  const roadColliders = primitiveColliders(road2.visual);
  const obstacleColliders = await collectPrimitiveColliders(obstacles, {
    onProgress,
    progress: 0.87,
    yieldWork
  });
  const villageColliders = await collectPrimitiveColliders(village.definitions, {
    onProgress,
    progress: 0.89,
    yieldWork
  });
  const forest = createDeferredForestState();
  const textLandmark = createDeferredTextLandmarkState();
  const occupiedColliders = [...obstacleColliders, ...villageColliders];
  const assembly = {
    dirtImage,
    forest,
    grassImage,
    groundSampler,
    obstacles,
    occupiedColliders,
    quality,
    road: road2,
    roadColliders,
    signTextures: { status: "streaming-after-playable-frame" },
    terrain,
    textLandmark,
    village
  };
  const group = await createTerrainGroupAsync(assembly, REAL_GRASS_URL, {
    onProgress,
    yieldWork
  });
  const stats = createTerrainPackageStats(assembly);
  const colliders = [...terrain.colliders, ...roadColliders, ...occupiedColliders];
  stats.deferredTerrainEnrichment = "forest-landmark-and-signs-after-movement";
  stats.quality = quality;
  stats.terrainPreparation = { ...terrain.preparation };
  const signTexturePromise = startVillageSignTextureStreaming({ environment: options.environment });
  signTexturePromise.then((value) => {
    stats.signTextures = value;
  });
  return createTerrainPackageResult({
    assembly,
    colliders,
    group,
    quality,
    signTexturePromise,
    stats,
    steps,
    terrain
  });
}
function createTerrainPackageResult(context) {
  const { assembly, colliders, group, quality, signTexturePromise, stats, steps, terrain } = context;
  return {
    colliders,
    deferredTerrainContext: {
      colliderStore: colliders,
      forest: assembly.forest,
      groundSampler: assembly.groundSampler,
      halfSize: terrain.size / 2 - 20,
      obstacleTriangles: assembly.occupiedColliders,
      quality,
      roadTriangles: assembly.roadColliders,
      textLandmark: assembly.textLandmark
    },
    forest: assembly.forest,
    group,
    heightAt,
    roadStats: assembly.road.stats,
    signTexturePromise,
    stats,
    textLandmark: assembly.textLandmark,
    village: assembly.village,
    worldMetadata: {
      ...assembly.obstacles.userData || {},
      deferredTerrainEnrichment: true,
      forest: assembly.forest.stats,
      quality,
      terrainGridSteps: steps,
      terrainPreparation: { ...terrain.preparation },
      textLandmark: assembly.textLandmark.stats,
      village: assembly.village.stats
    }
  };
}
function report(onProgress, boot, message, progress) {
  onProgress?.({ message, progress });
  boot?.progress("terrain-grid", Math.round(progress * 100), 100, message);
}
function browserYield4() {
  if (typeof globalThis.scheduler?.yield === "function") return globalThis.scheduler.yield();
  return new Promise((resolve) => setTimeout(resolve, 0));
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/assets/HouseAssets.js
var HOUSE_IMAGE_ENTRIES = Object.freeze([
  entry("whiteBrickImage", TEXTURE_PURPOSES.houseWall, "white-brick-house-wall"),
  entry("redBrickImage", TEXTURE_PURPOSES.lavaPlatform, "red-brick-lava-platform"),
  entry("redBrick1Image", TEXTURE_URLS.bricks.red1, "red-brick-variant-1"),
  entry("redBrick2Image", TEXTURE_URLS.bricks.red2, "red-brick-variant-2"),
  entry("yellowBrickImage", TEXTURE_PURPOSES.road, "yellow-brick-road"),
  entry("goldImage", TEXTURE_PURPOSES.coin, "gold-coin"),
  entry("stoneImage", TEXTURE_PURPOSES.houseFloor, "stone-house-floor"),
  entry("woodImage", TEXTURE_PURPOSES.houseDoor, "wood-door-roof"),
  entry("dirt1Image", TEXTURE_URLS.terrain.dirt1, "terrain-dirt-1"),
  entry("dirt2Image", TEXTURE_URLS.terrain.dirt2, "terrain-dirt-2"),
  entry("dirtGrass1Image", TEXTURE_URLS.terrain.dirtGrass1, "terrain-dirt-grass-1"),
  entry("dirtGrass2Image", TEXTURE_URLS.terrain.dirtGrass2, "terrain-dirt-grass-2"),
  entry("terrainMixImage", highestResolutionSurface("dirt"), "terrain-dirt-chai-pot")
]);
async function loadHouseAssets(loadFirstImage) {
  const records = await Promise.all(
    HOUSE_IMAGE_ENTRIES.map((definition4) => loadPreferredEntry(
      definition4,
      loadFirstImage
    ))
  );
  const assets = Object.fromEntries(
    records.map((record) => [record.key, record.image])
  );
  assets.brickImage = assets.whiteBrickImage;
  assets.lavaImage = assets.redBrickImage;
  assets.terrainDirtImages = [
    assets.dirt1Image,
    assets.dirt2Image,
    assets.dirtGrass1Image,
    assets.dirtGrass2Image,
    assets.terrainMixImage
  ];
  assets.houseMaterialDegradation = records.filter((record) => !record.image).map(({ error, key, kind, url }) => ({ error, key, kind, url }));
  assets.publicUrls = Object.fromEntries(
    HOUSE_IMAGE_ENTRIES.map((definition4) => [definition4.kind, definition4.url])
  );
  return assets;
}
function houseImageEntries() {
  return HOUSE_IMAGE_ENTRIES.map((definition4) => ({ ...definition4 }));
}
async function loadPreferredEntry(definition4, loadFirstImage) {
  let image = null;
  let error = null;
  try {
    image = await loadFirstImage([definition4.url], 15e3);
  } catch (caught) {
    error = caught?.message || String(caught);
  }
  if (!validImage2(image)) image = null;
  if (image) {
    image.dataset ||= {};
    image.dataset.AwtsmoosTextureKind = definition4.kind;
    image.dataset.requestedAlias = definition4.url;
  }
  return {
    ...definition4,
    error: image ? null : error || "unavailable",
    image
  };
}
function validImage2(image) {
  if (!image) return false;
  if (image.naturalWidth === void 0) return true;
  return image.naturalWidth > 0 && image.naturalHeight > 0;
}
function entry(key, url, kind) {
  return Object.freeze({ key, kind, url });
}

export {
  Vec3,
  v,
  add,
  sub,
  scale2 as scale,
  dot,
  cross,
  length,
  normalize,
  negate,
  projectToPlane,
  triangleContainsPoint,
  closestPointsSegmentSegment,
  rayTriangle,
  PLAYER_CAPSULE,
  HOUSE_ARCHITECTURE,
  DEFAULT_HOUSE_SPEC,
  resolveHouseSpec,
  floorBottomY,
  floorTopY,
  storyCeilingY,
  localToWorld2 as localToWorld,
  houseBasis,
  DETAIL_TEXTURE_FAMILIES,
  TEXTURE_URLS,
  TEXTURE_PURPOSES,
  createHouseFenceSegments,
  createHouseYardPatches,
  REPEAT_HOOKS,
  materialTexture,
  bindMaterialPair,
  cottageSurfaceStack,
  identity,
  copyMat4,
  mat4FromArray,
  multiply,
  inverse,
  transformPoint,
  ROOT_WORLD_MATRIX,
  updateCachedWorldMatrix,
  Group,
  Scene,
  Bone,
  Mesh,
  BufferGeometry,
  BufferAttribute,
  MeshStandardMaterial,
  PerspectiveCamera,
  REFERENCE_GOLDEN_HOUR,
  referenceLightingBudget,
  Aabb,
  createPrimitiveMesh,
  primitiveColliders,
  canonicalVillageRoadRoutes,
  CANONICAL_HOUSES_BY_ID,
  GRASS_URLS,
  createLoftedAnimalGeometry,
  createVillageBoxBatch,
  CANONICAL_VILLAGE_PLAN,
  heightAt,
  createTerrainPackage,
  loadHouseAssets,
  houseImageEntries
};
