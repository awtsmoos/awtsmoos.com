import {
  BufferAttribute,
  ROOT_WORLD_MATRIX,
  identity,
  inverse,
  multiply,
  updateCachedWorldMatrix
} from "./chunk-XAIHDDDJ.js";

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-gltf-accessors.js
var COMPONENTS = { 5120: Int8Array, 5121: Uint8Array, 5122: Int16Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array };
var TYPE_SIZES = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT2: 4, MAT3: 9, MAT4: 16 };
function componentName(t) {
  return { 5120: "BYTE", 5121: "UNSIGNED_BYTE", 5122: "SHORT", 5123: "UNSIGNED_SHORT", 5125: "UNSIGNED_INT", 5126: "FLOAT" }[t] || String(t);
}
function normalizedScale(Ctor) {
  if (Ctor === Int8Array) return 1 / 127;
  if (Ctor === Uint8Array) return 1 / 255;
  if (Ctor === Int16Array) return 1 / 32767;
  if (Ctor === Uint16Array) return 1 / 65535;
  return 1;
}
function scalar(view, off, Ctor) {
  if (Ctor === Float32Array) return view.getFloat32(off, true);
  if (Ctor === Uint32Array) return view.getUint32(off, true);
  if (Ctor === Uint16Array) return view.getUint16(off, true);
  if (Ctor === Uint8Array) return view.getUint8(off);
  if (Ctor === Int16Array) return view.getInt16(off, true);
  return view.getInt8(off);
}
function writeTuple(target, index, values, itemSize) {
  for (let k = 0; k < itemSize; k++) target[index * itemSize + k] = values[k] ?? 0;
}
function readAccessor(doc, buffers, index) {
  const a = doc.accessors[index], Ctor = COMPONENTS[a?.componentType], itemSize = TYPE_SIZES[a?.type] || 1;
  if (!a || !Ctor) throw new Error(`Unsupported accessor ${index}`);
  const normalized = a.normalized === true;
  let array;
  if (a.bufferView === void 0) {
    array = new Ctor(a.count * itemSize);
  } else {
    const bv = doc.bufferViews[a.bufferView], buffer = buffers[bv.buffer], base = (bv.byteOffset || 0) + (a.byteOffset || 0), stride = bv.byteStride || Ctor.BYTES_PER_ELEMENT * itemSize;
    if (stride === Ctor.BYTES_PER_ELEMENT * itemSize) {
      array = new Ctor(buffer, base, a.count * itemSize);
    } else {
      array = new Ctor(a.count * itemSize);
      const view = new DataView(buffer);
      for (let i = 0; i < a.count; i++) for (let k = 0; k < itemSize; k++) array[i * itemSize + k] = scalar(view, base + i * stride + k * Ctor.BYTES_PER_ELEMENT, Ctor);
    }
  }
  if (a.sparse) {
    array = new Ctor(array);
    applySparse(doc, buffers, a, array, itemSize, Ctor);
  }
  const attr = new BufferAttribute(array, itemSize, normalized, a.componentType);
  attr.accessorIndex = index;
  attr.min = a.min;
  attr.max = a.max;
  return attr;
}
function applySparse(doc, buffers, a, array, itemSize, Ctor) {
  const s = a.sparse, iv = doc.bufferViews[s.indices.bufferView], vv = doc.bufferViews[s.values.bufferView], ICtor = COMPONENTS[s.indices.componentType];
  const ib = buffers[iv.buffer], vb = buffers[vv.buffer], iBase = (iv.byteOffset || 0) + (s.indices.byteOffset || 0), vBase = (vv.byteOffset || 0) + (s.values.byteOffset || 0);
  const iView = new DataView(ib), vView = new DataView(vb);
  for (let n = 0; n < s.count; n++) {
    const idx = scalar(iView, iBase + n * ICtor.BYTES_PER_ELEMENT, ICtor), vals = [];
    for (let k = 0; k < itemSize; k++) vals[k] = scalar(vView, vBase + (n * itemSize + k) * Ctor.BYTES_PER_ELEMENT, Ctor);
    writeTuple(array, idx, vals, itemSize);
  }
}
function accessorFloatArray(attr) {
  const src = attr.array;
  if (src instanceof Float32Array && !attr.normalized) return src;
  const out = new Float32Array(src.length), scale = attr.normalized ? normalizedScale(src.constructor) : 1;
  for (let i = 0; i < src.length; i++) {
    let v = src[i] * scale;
    if (attr.normalized && (src instanceof Int8Array || src instanceof Int16Array)) v = Math.max(-1, v);
    out[i] = v;
  }
  return out;
}
function normalizeWeightsAttribute(attr) {
  const src = accessorFloatArray(attr), out = new Float32Array(src.length), size = attr.itemSize;
  for (let i = 0; i < attr.count; i++) {
    let sum = 0;
    for (let k = 0; k < size; k++) sum += Math.abs(src[i * size + k] || 0);
    if (sum > 0) {
      for (let k = 0; k < size; k++) out[i * size + k] = (src[i * size + k] || 0) / sum;
    } else out[i * size] = 1;
  }
  return new BufferAttribute(out, size, false, 5126);
}
function accessorSummary(doc, index) {
  const a = doc.accessors[index];
  return `${index} ${a.type} ${componentName(a.componentType)} norm=${!!a.normalized} count=${a.count}`;
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-animation-parser.js
var TARGET_SIZE = {
  rotation: 4,
  scale: 3,
  translation: 3,
  weights: 1
};
function summarizeAnimations(document) {
  return (document.animations || []).map((animation, index) => ({
    channels: (animation.channels || []).length,
    index,
    name: animation.name || `animation_${index}`,
    paths: [...new Set(
      (animation.channels || []).map((channel) => channel.target?.path).filter(Boolean)
    )],
    samplers: (animation.samplers || []).length
  }));
}
function parseTinyAnimations(document, accessors, nodeMap) {
  return (document.animations || []).map((animation, index) => parseAnimation(animation, index, accessors, nodeMap));
}
function parseAnimation(animation, index, accessors, nodeMap) {
  const channels = [];
  let duration = 0;
  for (const sourceChannel of animation.channels || []) {
    const channel = parseChannel(
      sourceChannel,
      animation.samplers || [],
      accessors,
      nodeMap
    );
    if (!channel) {
      continue;
    }
    channels.push(channel);
    duration = Math.max(duration, channel.input[channel.input.length - 1] || 0);
  }
  return {
    channels,
    duration,
    index,
    name: animation.name || `animation_${index}`
  };
}
function parseChannel(sourceChannel, samplers, accessors, nodeMap) {
  const sampler = samplers[sourceChannel.sampler];
  const target = sourceChannel.target || {};
  const node = nodeMap.get(target.node);
  const size = TARGET_SIZE[target.path];
  if (!sampler || !node || !size) {
    return null;
  }
  return {
    input: accessorFloatArray(accessors[sampler.input]),
    interpolation: sampler.interpolation || "LINEAR",
    node,
    nodeIndex: target.node,
    output: accessorFloatArray(accessors[sampler.output]),
    path: target.path,
    size
  };
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-animation-bindings.js
function createAnimationBindings(clips) {
  const bindingByNode = /* @__PURE__ */ new Map();
  const bindings = [];
  for (const clip of clips) {
    for (const channel of clip.channels || []) {
      let paths = bindingByNode.get(channel.node);
      if (!paths) {
        paths = /* @__PURE__ */ new Map();
        bindingByNode.set(channel.node, paths);
      }
      if (paths.has(channel.path)) {
        continue;
      }
      const binding = {
        base: readBaseValue(channel.node, channel.path),
        node: channel.node,
        path: channel.path
      };
      paths.set(channel.path, binding);
      bindings.push(binding);
    }
  }
  return bindings;
}
function captureClipPose(clip) {
  const pose = /* @__PURE__ */ new Map();
  for (const channel of clip?.channels || []) {
    pose.set(channel, readNodeValue(channel.node, channel.path));
  }
  return pose;
}
function resetAnimationBindings(bindings) {
  for (const binding of bindings) {
    writeNodeValue(binding.node, binding.path, binding.base);
  }
}
function writeNodeValue(node, path, values) {
  if (path === "translation") {
    node.position.set(values[0], values[1], values[2]);
    return;
  }
  if (path === "rotation") {
    node.quaternion.set(values[0], values[1], values[2], values[3]);
    return;
  }
  if (path === "scale") {
    node.scale.set(values[0], values[1], values[2]);
  }
}
function readBaseValue(node, path) {
  const base = node._base;
  if (path === "translation") {
    const value = base?.position || node.position;
    return [value.x, value.y, value.z];
  }
  if (path === "rotation") {
    const value = base?.quaternion || node.quaternion;
    return [value.x, value.y, value.z, value.w];
  }
  if (path === "scale") {
    const value = base?.scale || node.scale;
    return [value.x, value.y, value.z];
  }
  return [0];
}
function readNodeValue(node, path) {
  if (path === "translation") {
    return [node.position.x, node.position.y, node.position.z];
  }
  if (path === "rotation") {
    return [node.quaternion.x, node.quaternion.y, node.quaternion.z, node.quaternion.w];
  }
  if (path === "scale") {
    return [node.scale.x, node.scale.y, node.scale.z];
  }
  return [0];
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-animation-quaternion.js
function slerpQuaternionInto(output, ax, ay, az, aw, bx, by, bz, bw, amount) {
  let cosine = ax * bx + ay * by + az * bz + aw * bw;
  if (cosine < 0) {
    bx = -bx;
    by = -by;
    bz = -bz;
    bw = -bw;
    cosine = -cosine;
  }
  if (cosine > 0.9995) {
    return normalizeInto(
      output,
      ax + (bx - ax) * amount,
      ay + (by - ay) * amount,
      az + (bz - az) * amount,
      aw + (bw - aw) * amount
    );
  }
  const angle = Math.acos(Math.min(1, Math.max(-1, cosine)));
  const sine = Math.sin(angle);
  const leftWeight = Math.sin((1 - amount) * angle) / sine;
  const rightWeight = Math.sin(amount * angle) / sine;
  return normalizeInto(
    output,
    ax * leftWeight + bx * rightWeight,
    ay * leftWeight + by * rightWeight,
    az * leftWeight + bz * rightWeight,
    aw * leftWeight + bw * rightWeight
  );
}
function normalizeInto(output, x, y, z, w) {
  const scale = 1 / Math.max(1e-12, Math.hypot(x, y, z, w));
  output[0] = x * scale;
  output[1] = y * scale;
  output[2] = z * scale;
  output[3] = w * scale;
  return output;
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-animation-sampler.js
function applyChannelSample(channel, time, fadeFrom, fadeAmount = 1) {
  const span = resolveSpan(channel, time);
  if (channel.path === "rotation") {
    applyRotation(channel, span, fadeFrom, fadeAmount);
    return;
  }
  if (channel.path === "translation" || channel.path === "scale") {
    applyVector(channel, span, fadeFrom, fadeAmount);
  }
}
function applyVector(channel, span, fadeFrom, fadeAmount) {
  const values = channel._sampleScratch || (channel._sampleScratch = new Float64Array(3));
  for (let index = 0; index < 3; index += 1) {
    const sampled = sampleComponent(channel, span, index);
    values[index] = fadeFrom ? fadeFrom[index] + (sampled - fadeFrom[index]) * fadeAmount : sampled;
  }
  const target = channel.path === "translation" ? channel.node.position : channel.node.scale;
  target.set(values[0], values[1], values[2]);
}
function applyRotation(channel, span, fadeFrom, fadeAmount) {
  const output = channel._sampleScratch || (channel._sampleScratch = new Float64Array(4));
  const left = span.left * channel.size;
  const right = span.right * channel.size;
  const source = channel.output;
  if (span.step) {
    for (let index = 0; index < 4; index += 1) {
      output[index] = source[left + index] ?? (index === 3 ? 1 : 0);
    }
  } else {
    slerpQuaternionInto(
      output,
      source[left] || 0,
      source[left + 1] || 0,
      source[left + 2] || 0,
      source[left + 3] ?? 1,
      source[right] || 0,
      source[right + 1] || 0,
      source[right + 2] || 0,
      source[right + 3] ?? 1,
      span.amount
    );
  }
  if (fadeFrom) {
    slerpQuaternionInto(output, ...fadeFrom, ...output, fadeAmount);
  }
  channel.node.quaternion.set(output[0], output[1], output[2], output[3]);
}
function sampleComponent(channel, span, componentIndex) {
  const left = span.left * channel.size + componentIndex;
  const valueA = channel.output[left] ?? 0;
  if (span.step) return valueA;
  const right = span.right * channel.size + componentIndex;
  const valueB = channel.output[right] ?? valueA;
  return valueA + (valueB - valueA) * span.amount;
}
function resolveSpan(channel, time) {
  const times = channel.input;
  const span = channel._sampleSpan || (channel._sampleSpan = {});
  const last = times.length - 1;
  if (last <= 0 || time <= times[0]) return assignSpan(span, 0, 0, 0, true);
  if (time >= times[last]) return assignSpan(span, last, last, 0, true);
  let low = 0;
  let high = last;
  while (high - low > 1) {
    const middle = low + high >> 1;
    if (times[middle] <= time) low = middle;
    else high = middle;
  }
  const amount = (time - times[low]) / Math.max(1e-8, times[high] - times[low]);
  return assignSpan(span, low, high, amount, channel.interpolation === "STEP");
}
function assignSpan(span, left, right, amount, step) {
  span.left = left;
  span.right = right;
  span.amount = amount;
  span.step = step || left === right;
  return span;
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-animation-player.js
var TinyAnimationPlayer = class {
  constructor(root, clips = []) {
    this.root = root;
    this.clips = clips;
    this.bindings = createAnimationBindings(clips);
    this.currentIndex = clips.length ? 0 : -1;
    this.time = 0;
    this.playing = true;
    this.bindPose = false;
    this.lastApplied = null;
    this.fadeDuration = 0.18;
    this.fadeTime = 0;
    this.fadePose = null;
  }
  get current() {
    return this.clips[this.currentIndex] || null;
  }
  get names() {
    return this.clips.map((clip) => clip.name);
  }
  play(indexOrName) {
    const index = resolveClipIndex(this.clips, indexOrName);
    if (index < 0) return this.current;
    const target = this.clips[index];
    const alreadyApplied = this.lastApplied === target?.name;
    if (index === this.currentIndex && !this.bindPose && alreadyApplied) {
      this.playing = true;
      return this.current;
    }
    const hasAppliedPose = this.lastApplied !== null && this.lastApplied !== "bind";
    this.fadePose = hasAppliedPose ? captureClipPose(target) : null;
    this.fadeTime = hasAppliedPose ? 0 : this.fadeDuration;
    this.currentIndex = index;
    this.time = 0;
    this.bindPose = false;
    this.playing = true;
    this.apply(0);
    return this.current;
  }
  next() {
    return this.play((this.currentIndex + 1) % Math.max(1, this.clips.length));
  }
  setBindPose(enabled) {
    this.bindPose = Boolean(enabled);
    this.time = 0;
    this.fadePose = null;
    resetAnimationBindings(this.bindings);
    this.lastApplied = this.bindPose ? "bind" : null;
  }
  update(deltaTime) {
    if (this.bindPose || !this.current) return;
    const delta = Math.max(0, Number(deltaTime) || 0);
    if (this.playing) this.time += delta;
    if (this.fadePose) this.fadeTime += delta;
    const duration = this.current.duration || 1;
    this.apply(duration ? this.time % duration : 0);
  }
  apply(time) {
    const clip = this.current;
    if (!clip) return;
    resetAnimationBindings(this.bindings);
    const fadeAmount = this.fadePose ? smooth(Math.min(1, this.fadeTime / Math.max(1e-3, this.fadeDuration))) : 1;
    for (const channel of clip.channels) {
      applyChannelSample(channel, time, this.fadePose?.get(channel), fadeAmount);
    }
    if (this.fadePose && this.fadeTime >= this.fadeDuration) this.fadePose = null;
    this.lastApplied = clip.name;
  }
  diagnostics() {
    const clip = this.current;
    return {
      bindPose: this.bindPose,
      channels: clip?.channels.length || 0,
      clipCount: this.clips.length,
      currentAnimation: clip?.name || null,
      currentIndex: this.currentIndex,
      duration: Number((clip?.duration || 0).toFixed(3)),
      fade: this.fadePose ? Number((1 - this.fadeTime / this.fadeDuration).toFixed(3)) : 0,
      playing: this.playing,
      time: Number(this.time.toFixed(3))
    };
  }
};
function resolveClipIndex(clips, indexOrName) {
  return typeof indexOrName === "number" ? indexOrName : clips.findIndex((clip) => clip.name === indexOrName);
}
function smooth(amount) {
  return amount * amount * (3 - 2 * amount);
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-skin-cache.js
var SkinPaletteCache = class {
  constructor() {
    this.frameToken = null;
    this.meshWorld = new Float32Array(16);
    this.valid = false;
    this.revision = 0;
  }
  /** Returns true only when a fresh palette computation is required. */
  needsUpdate(frameToken, meshWorld) {
    if (!validFrameToken(frameToken) || !this.valid) {
      return true;
    }
    if (this.frameToken !== frameToken) {
      return true;
    }
    return !matrixEquals(this.meshWorld, meshWorld);
  }
  /** Records the exact transform and increments the palette revision. */
  markUpdated(frameToken, meshWorld) {
    this.frameToken = frameToken;
    copyMatrix(this.meshWorld, meshWorld);
    this.valid = validFrameToken(frameToken);
    this.revision += 1;
    return this.revision;
  }
  invalidate() {
    this.valid = false;
    this.frameToken = null;
  }
};
function matrixEquals(left, right) {
  if (!left || !right || left.length !== 16 || right.length !== 16) {
    return false;
  }
  for (let index = 0; index < 16; index += 1) {
    if (left[index] !== right[index]) {
      return false;
    }
  }
  return true;
}
function copyMatrix(target, source) {
  if (!source || source.length !== 16) {
    target.fill(Number.NaN);
    return;
  }
  for (let index = 0; index < 16; index += 1) {
    target[index] = source[index];
  }
}
function validFrameToken(frameToken) {
  return Number.isInteger(frameToken) && frameToken >= 0;
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-skin-lines.js
function skeletonLinePositions(root) {
  const positions = [];
  root.traverse((node) => {
    const skeletons = node.userData?.skeletons;
    if (!(skeletons instanceof Map)) {
      return;
    }
    for (const skeleton of skeletons.values()) {
      appendSkeletonLines(skeleton, positions);
    }
  });
  return new Float32Array(positions);
}
function appendSkeletonLines(skeleton, positions) {
  const jointSet = new Set(skeleton.joints.filter(Boolean));
  for (const joint of jointSet) {
    const parent = joint.parent;
    if (!parent || !jointSet.has(parent)) {
      continue;
    }
    positions.push(
      parent.matrixWorld[12],
      parent.matrixWorld[13],
      parent.matrixWorld[14],
      joint.matrixWorld[12],
      joint.matrixWorld[13],
      joint.matrixWorld[14]
    );
  }
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-skin-matrix.js
function readSkinMatrix(accessor, index) {
  const source = accessor?.array || accessor;
  if (!source) {
    return identity();
  }
  const matrix = new Float32Array(16);
  for (let component = 0; component < 16; component += 1) {
    matrix[component] = source[index * 16 + component] ?? (component % 5 === 0 ? 1 : 0);
  }
  return matrix;
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-skin-binding.js
function bindSceneSkeletons(root, doc, accessors, createSkeleton) {
  const nodeMap = root.userData?.nodeMap || /* @__PURE__ */ new Map();
  const skeletons = /* @__PURE__ */ new Map();
  let maxJoints = 0;
  let missingJoints = 0;
  for (let skinIndex = 0; skinIndex < (doc.skins || []).length; skinIndex += 1) {
    const skinDefinition = doc.skins[skinIndex] || {};
    const inverseBindAccessor = skinDefinition.inverseBindMatrices === void 0 ? null : accessors[skinDefinition.inverseBindMatrices];
    const skeleton = createSkeleton({
      inverseBindAccessor,
      nodeMap,
      skinDef: skinDefinition,
      skinIndex
    });
    skeletons.set(skinIndex, skeleton);
    maxJoints = Math.max(maxJoints, skeleton.jointCount);
    missingJoints += skeleton.joints.filter((joint) => !joint).length;
  }
  const meshStats = bindMeshes(root, skeletons);
  root.userData.skeletons = skeletons;
  return {
    maxJoints,
    missingJoints,
    skeletonCount: skeletons.size,
    ...meshStats
  };
}
function bindMeshes(root, skeletons) {
  let rigidMeshes = 0;
  let skinnedMeshes = 0;
  root.traverse((node) => {
    if (!node.isMesh) return;
    const hasSkinAttributes = Boolean(
      node.geometry?.attributes?.joints && node.geometry?.attributes?.weights
    );
    node.skeleton = skeletons.get(node.skinIndex) || null;
    node.isSkinnedMesh = Boolean(node.skeleton && hasSkinAttributes);
    if (node.isSkinnedMesh) skinnedMeshes += 1;
    else rigidMeshes += 1;
  });
  return {
    rigidMeshes,
    skinnedMeshes
  };
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-skin-scene.js
function collectWorldMatrices(root, reusableWorldByNode = null) {
  const worldByNode = reusableWorldByNode instanceof Map ? reusableWorldByNode : /* @__PURE__ */ new Map();
  worldByNode.clear();
  const stats = reusableStats(worldByNode.stats);
  updateVisibleBranch(
    root,
    ROOT_WORLD_MATRIX,
    0,
    worldByNode,
    stats,
    true
  );
  worldByNode.stats = stats;
  return worldByNode;
}
function updateVisibleBranch(node, parentWorld, parentRevision, worldByNode, stats, parentVisible) {
  const visible = parentVisible && node.visible !== false;
  if (!visible) {
    stats.skippedSubtrees += 1;
    return;
  }
  const changed = updateCachedWorldMatrix(
    node,
    parentWorld,
    parentRevision
  );
  if (changed) stats.updatedNodes += 1;
  else stats.reusedNodes += 1;
  node.userData ||= {};
  node.userData.worldMatrix = node.matrixWorld;
  worldByNode.set(node, node.matrixWorld);
  for (const child of node.children || []) {
    updateVisibleBranch(
      child,
      node.matrixWorld,
      node._worldRevision || 0,
      worldByNode,
      stats,
      visible
    );
  }
}
function reusableStats(stats) {
  const result = stats || {
    reusedNodes: 0,
    skippedSubtrees: 0,
    updatedNodes: 0
  };
  result.reusedNodes = 0;
  result.skippedSubtrees = 0;
  result.updatedNodes = 0;
  return result;
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-skin-system.js
var MAX_TINY_JOINTS = 96;
var TinySkeleton = class {
  constructor({
    skinIndex = 0,
    skinDef = {},
    nodeMap = /* @__PURE__ */ new Map(),
    inverseBindAccessor = null
  } = {}) {
    this.skinIndex = skinIndex;
    this.name = skinDef.name || `Skin_${skinIndex}`;
    this.joints = (skinDef.joints || []).map((index) => nodeMap.get(index));
    this.inverseBindMatrices = this.joints.map((_, index) => readSkinMatrix(inverseBindAccessor, index));
    this.jointCount = this.joints.length;
    this.jointMatrices = new Float32Array(Math.max(1, this.jointCount) * 16);
    this.paletteCache = new SkinPaletteCache();
    this.paletteRevision = 0;
    this.lastPaletteRecomputed = false;
    this.resetPalette();
  }
  resetPalette() {
    for (let index = 0; index < Math.max(1, this.jointCount); index += 1) {
      this.jointMatrices.set(identity(), index * 16);
    }
  }
  update(meshWorld = identity()) {
    this.computePalette(meshWorld);
    this.paletteRevision += 1;
    this.paletteCache.invalidate();
    this.lastPaletteRecomputed = true;
    return Math.min(this.jointCount, MAX_TINY_JOINTS);
  }
  updateCached(meshWorld = identity(), frameToken) {
    if (!this.paletteCache.needsUpdate(frameToken, meshWorld)) {
      this.lastPaletteRecomputed = false;
      return Math.min(this.jointCount, MAX_TINY_JOINTS);
    }
    this.computePalette(meshWorld);
    this.paletteCache.markUpdated(frameToken, meshWorld);
    this.paletteRevision += 1;
    this.lastPaletteRecomputed = true;
    return Math.min(this.jointCount, MAX_TINY_JOINTS);
  }
  invalidatePaletteCache() {
    this.paletteCache.invalidate();
  }
  computePalette(meshWorld) {
    const inverseMesh = inverse(meshWorld);
    const count = Math.min(this.jointCount, MAX_TINY_JOINTS);
    for (let index = 0; index < count; index += 1) {
      const joint = this.joints[index];
      const jointWorld = joint?.userData?.worldMatrix || joint?.matrixWorld || identity();
      const skinMatrix = multiply(
        inverseMesh,
        multiply(jointWorld, this.inverseBindMatrices[index])
      );
      this.jointMatrices.set(skinMatrix, index * 16);
    }
  }
};
function bindTinySkeletons(root, doc, accessors) {
  return bindSceneSkeletons(
    root,
    doc,
    accessors,
    (configuration) => new TinySkeleton(configuration)
  );
}

export {
  readAccessor,
  normalizeWeightsAttribute,
  accessorSummary,
  summarizeAnimations,
  parseTinyAnimations,
  TinyAnimationPlayer,
  skeletonLinePositions,
  collectWorldMatrices,
  bindTinySkeletons
};
