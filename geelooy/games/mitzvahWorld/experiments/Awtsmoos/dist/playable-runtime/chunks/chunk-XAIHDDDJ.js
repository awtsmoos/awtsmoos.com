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
function reusableSnapshot(object, length) {
  if (!object._localTransformSnapshot || object._localTransformSnapshot.length !== length) {
    object._localTransformSnapshot = new Array(length);
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
  copy(vector) {
    return this.set(vector.x || 0, vector.y || 0, vector.z || 0);
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
  constructor(array, itemSize, normalized = false, componentType = null) {
    this.array = array;
    this.itemSize = itemSize;
    this.normalized = normalized;
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

export {
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
  PerspectiveCamera
};
