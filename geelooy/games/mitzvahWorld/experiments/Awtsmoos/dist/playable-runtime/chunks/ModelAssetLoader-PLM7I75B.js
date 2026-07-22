import {
  accessorSummary,
  bindTinySkeletons,
  normalizeWeightsAttribute,
  parseTinyAnimations,
  readAccessor,
  summarizeAnimations
} from "./chunk-2UWXRKAB.js";
import {
  Bone,
  BufferGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  copyMat4,
  mat4FromArray
} from "./chunk-XAIHDDDJ.js";

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-gltf-materials.js
var DEFAULT_COLOR = [1, 1, 1, 1];
async function createTinyMaterials(doc, buffers, baseUrl) {
  const images = await loadImages(doc, buffers, baseUrl);
  const materials = (doc.materials || []).map((def, index) => materialFromDef(doc, def, index, images));
  return { materials, images, diagnostics: materialDiagnostics(doc, materials, images) };
}
function materialFromDef(doc, def = {}, index = 0, images = []) {
  const pbr = def.pbrMetallicRoughness || {}, factor = pbr.baseColorFactor || DEFAULT_COLOR;
  const tex = textureImage(doc, pbr.baseColorTexture, images);
  const color = tex ? factor : displayColor(factor);
  const mat = new MeshStandardMaterial({ name: def.name || `material_${index}`, color, opacity: factor[3] ?? 1, alphaMode: def.alphaMode || "OPAQUE", alphaCutoff: def.alphaCutoff ?? 0.5, transparent: (def.alphaMode || "OPAQUE") === "BLEND" || (factor[3] ?? 1) < 1, doubleSided: def.doubleSided === true });
  Object.assign(mat, { metallicFactor: pbr.metallicFactor ?? 1, roughnessFactor: pbr.roughnessFactor ?? 1, baseColorFactor: factor, sourceColorSpace: tex ? "texture+sRGB-factor" : "gltf-factor-linear-to-display", mapImage: tex?.image || null, textureUrl: tex?.url || null, mapRepeat: tex?.repeat || [1, 1], anisotropy: true });
  return mat;
}
function defaultTinyMaterial() {
  const mat = new MeshStandardMaterial({ name: "material_default", color: DEFAULT_COLOR, opacity: 1, alphaMode: "OPAQUE" });
  Object.assign(mat, { sourceColorSpace: "neutral-default", mapRepeat: [1, 1], anisotropy: true });
  return mat;
}
function textureImage(doc, info, images) {
  if (!info) return null;
  const tex = doc.textures?.[info.index];
  if (!tex) return null;
  const image = images[tex.source];
  if (!image) return null;
  const sampler = doc.samplers?.[tex.sampler] || {};
  return { image, url: image.dataset?.url || image.src || `image_${tex.source}`, repeat: sampler.wrapS === 33071 || sampler.wrapT === 33071 ? [1, 1] : [1, 1] };
}
async function loadImages(doc, buffers, baseUrl) {
  return await Promise.all((doc.images || []).map((image, index) => loadOneImage(doc, buffers, baseUrl, image, index)));
}
async function loadOneImage(doc, buffers, baseUrl, image, index) {
  if (image.uri) return await loadUriImage(new URL(image.uri, baseUrl).href, index);
  if (image.bufferView !== void 0) {
    const bv = doc.bufferViews[image.bufferView], buffer = buffers[bv.buffer];
    const bytes = buffer.slice(bv.byteOffset || 0, (bv.byteOffset || 0) + bv.byteLength);
    const blob = new Blob([bytes], { type: image.mimeType || "image/png" });
    const url = URL.createObjectURL(blob);
    try {
      return await loadUriImage(url, index, `glb-bufferView:${image.bufferView}`);
    } finally {
      setTimeout(() => URL.revokeObjectURL(url), 2e3);
    }
  }
  return null;
}
function loadUriImage(src, index, label = src) {
  return new Promise((resolve) => {
    const img = new Image();
    let done = false;
    const finish = (value) => {
      if (!done) {
        done = true;
        resolve(value);
      }
    };
    img.crossOrigin = src.startsWith("blob:") ? null : "anonymous";
    img.onload = () => {
      img.dataset.url = label;
      img.dataset.index = String(index);
      finish(img);
    };
    img.onerror = () => finish(null);
    img.src = src;
  });
}
function displayColor(color) {
  return [toSrgb(color[0] ?? 1), toSrgb(color[1] ?? 1), toSrgb(color[2] ?? 1), color[3] ?? 1];
}
function toSrgb(v) {
  v = Math.max(0, Math.min(1, v));
  return v <= 31308e-7 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
}
function materialDiagnostics(doc, materials, images) {
  return { count: materials.length, images: images.filter(Boolean).length, textures: (doc.textures || []).length, defaultColor: DEFAULT_COLOR, colorsConverted: true, entries: materials.map((m, i) => ({ i, name: m.name, color: m.color, raw: m.baseColorFactor, hasMap: !!m.mapImage, textureSize: m.mapImage ? `${m.mapImage.naturalWidth}x${m.mapImage.naturalHeight}` : null, sourceColorSpace: m.sourceColorSpace })).slice(0, 64) };
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-gltf-loader.js
var GLB_MAGIC = 1179937895;
var JSON_CHUNK = 1313821514;
var BIN_CHUNK = 5130562;
var ATTR = { POSITION: "position", NORMAL: "normal", TEXCOORD_0: "uv", COLOR_0: "color", JOINTS_0: "joints", WEIGHTS_0: "weights" };
async function fetchBuffer(url) {
  const r = await fetch(url, { mode: "cors" });
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
  return await r.arrayBuffer();
}
function dataUri(uri) {
  const raw = atob(uri.split(",")[1] || ""), out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out.buffer;
}
async function loadBuffers(doc, baseUrl, bin) {
  return await Promise.all((doc.buffers || []).map((b) => b.uri ? b.uri.startsWith("data:") ? dataUri(b.uri) : fetchBuffer(new URL(b.uri, baseUrl).href) : bin));
}
function parseGlb(buffer) {
  const view = new DataView(buffer);
  if (view.getUint32(0, true) !== GLB_MAGIC) throw new Error("Not a GLB container");
  let json = null, bin = null, chunks = [];
  for (let off = 12; off + 8 <= buffer.byteLength; ) {
    const len = view.getUint32(off, true), type = view.getUint32(off + 4, true), bytes = buffer.slice(off + 8, off + 8 + len);
    chunks.push({ type, byteOffset: off + 8, byteLength: len });
    if (type === JSON_CHUNK) json = JSON.parse(new TextDecoder().decode(bytes));
    if (type === BIN_CHUNK) bin = bytes;
    off += 8 + len;
  }
  if (!json) throw new Error("GLB missing JSON chunk");
  return { json, bin, chunks };
}
function markBones(doc) {
  const bones = /* @__PURE__ */ new Set();
  for (const s of doc.skins || []) for (const j of s.joints || []) bones.add(j);
  return bones;
}
function makeAccessorGetter(doc, buffers, cache) {
  return (i) => cache[i] || (cache[i] = readAccessor(doc, buffers, i));
}
function warmAnimationAccessors(doc, getAccessor) {
  for (const a of doc.animations || []) for (const s of a.samplers || []) {
    if (s.input !== void 0) getAccessor(s.input);
    if (s.output !== void 0) getAccessor(s.output);
  }
}
function primitiveMesh(materials, getAccessor, primitive, meshDef, nodeDef, primitiveIndex) {
  const geometry = new BufferGeometry();
  geometry.mode = primitive.mode ?? 4;
  geometry.userData = { primitive, primitiveIndex };
  for (const [semantic, accessorIndex] of Object.entries(primitive.attributes || {})) {
    const key = ATTR[semantic];
    if (!key) continue;
    let attribute = getAccessor(accessorIndex);
    if (key === "weights") attribute = normalizeWeightsAttribute(attribute);
    geometry.setAttribute(key, attribute);
  }
  if (primitive.indices !== void 0) geometry.setIndex(getAccessor(primitive.indices));
  const mesh = new Mesh(geometry, primitive.material !== void 0 ? materials[primitive.material] : defaultTinyMaterial());
  mesh.name = meshDef.name || nodeDef.name || `mesh_${nodeDef.mesh}_${primitiveIndex}`;
  mesh.skinIndex = nodeDef.skin ?? null;
  mesh.primitiveMode = geometry.mode;
  mesh.userData = { meshDef, primitive, primitiveIndex };
  return mesh;
}
function applyNodeTransform(obj, nodeDef, index) {
  obj.userData.nodeIndex = index;
  obj.userData.gltfNode = nodeDef;
  if (nodeDef.name) {
    obj.name = nodeDef.name;
    obj.userData.name = nodeDef.name;
  }
  if (nodeDef.matrix) obj.matrix = mat4FromArray(nodeDef.matrix);
  else {
    if (nodeDef.translation) obj.position.fromArray(nodeDef.translation);
    if (nodeDef.rotation) obj.quaternion.fromArray(nodeDef.rotation);
    if (nodeDef.scale) obj.scale.fromArray(nodeDef.scale);
  }
  obj.setBaseTransform();
}
function buildNodes(doc, materials, getAccessor, bones, stats) {
  const nodeMap = /* @__PURE__ */ new Map(), nodes = [];
  for (let i = 0; i < (doc.nodes || []).length; i++) {
    const def = doc.nodes[i] || {}, node = bones.has(i) ? new Bone() : new Group();
    applyNodeTransform(node, def, i);
    nodes[i] = node;
    nodeMap.set(i, node);
    stats.nodes++;
    if (def.skin !== void 0) stats.skinnedNodes++;
  }
  for (let i = 0; i < nodes.length; i++) {
    const def = doc.nodes[i] || {}, node = nodes[i], meshDef = doc.meshes?.[def.mesh];
    if (!meshDef) continue;
    for (let p = 0; p < (meshDef.primitives || []).length; p++) {
      const mesh = primitiveMesh(materials, getAccessor, meshDef.primitives[p], meshDef, def, p);
      mesh.nodeIndex = i;
      mesh.setBaseTransform();
      node.add(mesh);
      stats.meshes++;
      stats.primitives++;
      if (mesh.skinIndex !== null && mesh.geometry.attributes.joints && mesh.geometry.attributes.weights) stats.skinnedPrimitives++;
    }
  }
  for (let i = 0; i < nodes.length; i++) for (const childIndex of doc.nodes[i]?.children || []) nodes[i].add(nodes[childIndex]);
  return { nodes, nodeMap };
}
function skinDetails(doc) {
  return (doc.skins || []).map((s, index) => ({ index, name: s.name || null, joints: (s.joints || []).length, skeleton: s.skeleton ?? null, hasInverseBind: s.inverseBindMatrices !== void 0, inverseBindAccessor: s.inverseBindMatrices }));
}
function accessorDetails(doc) {
  const out = [];
  for (const m of doc.meshes || []) for (const p of m.primitives || []) for (const [sem, i] of Object.entries(p.attributes || {})) if (sem === "JOINTS_0" || sem === "WEIGHTS_0") out.push(`${sem}: ${accessorSummary(doc, i)}`);
  return [...new Set(out)].slice(0, 24);
}
async function loadTinyGltf(url) {
  const started = performance.now(), buffer = await fetchBuffer(url), glb = parseGlb(buffer), doc = glb.json, buffers = await loadBuffers(doc, url, glb.bin), accessors = [], getAccessor = makeAccessorGetter(doc, buffers, accessors), root = new Group(), bones = markBones(doc), materialPack = await createTinyMaterials(doc, buffers, url);
  root.name = "AwtsmoosTinyGltfRoot";
  const stats = { nodes: 0, meshes: 0, primitives: 0, materials: (doc.materials || []).length, images: (doc.images || []).length, textures: (doc.textures || []).length, animations: (doc.animations || []).length, skins: (doc.skins || []).length, skinnedNodes: 0, skinnedPrimitives: 0, bytes: buffer.byteLength, chunks: glb.chunks, skinDetails: skinDetails(doc), animationDetails: summarizeAnimations(doc), accessorDetails: accessorDetails(doc), materialDetails: materialPack.diagnostics };
  for (let i = 0; i < (doc.accessors || []).length; i++) if (doc.accessors[i].type === "MAT4" || doc.accessors[i].type === "SCALAR") getAccessor(i);
  warmAnimationAccessors(doc, getAccessor);
  const built = buildNodes(doc, materialPack.materials, getAccessor, bones, stats), scene = doc.scenes?.[doc.scene || 0] || doc.scenes?.[0] || { nodes: built.nodes.map((_, i) => i) };
  for (const nodeIndex of scene.nodes || []) root.add(built.nodes[nodeIndex]);
  Object.assign(root.userData, { gltf: doc, nodeMap: built.nodeMap, allNodes: built.nodes, skins: doc.skins || [], accessors, sourceUrl: url, materials: materialPack.materials, materialDetails: materialPack.diagnostics });
  const clips = parseTinyAnimations(doc, accessors, built.nodeMap);
  Object.assign(stats, bindTinySkeletons(root, doc, accessors));
  stats.joints = (doc.skins || []).reduce((n, s) => n + (s.joints?.length || 0), 0);
  stats.skeletonName = doc.skins?.[0]?.name || null;
  stats.hasInverseBind = !!doc.skins?.[0]?.inverseBindMatrices;
  stats.clips = clips.map((c) => ({ index: c.index, name: c.name, duration: c.duration, channels: c.channels.length }));
  stats.ms = Math.round(performance.now() - started);
  root.userData.animations = clips;
  return { scene: root, json: doc, stats, animations: clips, experimental: true };
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-gltf-instance.js
function instantiateTinyGltf(template, options = {}) {
  if (!template?.scene) throw new Error("A parsed GLTF template is required.");
  const nodeMap = /* @__PURE__ */ new Map();
  const resources = {
    geometries: /* @__PURE__ */ new Set(),
    materials: /* @__PURE__ */ new Set()
  };
  const scene = cloneNode(
    template.scene,
    nodeMap,
    resources,
    options.materialResolver
  );
  const sourceData = template.scene.userData || {};
  const document = template.json || sourceData.gltf || {};
  const accessors = sourceData.accessors || [];
  const sourceNodes = sourceData.allNodes || [];
  const allNodes = sourceNodes.map((_, index) => nodeMap.get(index) || null);
  Object.assign(scene.userData, {
    accessors,
    allNodes,
    gltf: document,
    instanceLabel: options.label || "instance",
    materials: sourceData.materials || [],
    nodeMap,
    sharedSourceUrl: sourceData.sourceUrl || null,
    skins: document.skins || []
  });
  const skinStats = bindTinySkeletons(scene, document, accessors);
  const animations = parseTinyAnimations(document, accessors, nodeMap);
  scene.userData.animations = animations;
  scene.name = `${options.label || "instance"}_shared_gltf_scene`;
  return {
    animations,
    experimental: true,
    json: document,
    scene,
    stats: {
      ...template.stats || {},
      ...skinStats,
      instanceLabel: options.label || "instance",
      sharedGeometries: resources.geometries.size,
      sharedMaterials: resources.materials.size,
      sharedTemplate: true
    }
  };
}
function cloneNode(source, nodeMap, resources, materialResolver) {
  const target = createNode(source, resources, materialResolver);
  copyNodeState(source, target);
  const nodeIndex = source.userData?.nodeIndex;
  if (Number.isInteger(nodeIndex)) nodeMap.set(nodeIndex, target);
  for (const child of source.children || []) {
    target.add(cloneNode(child, nodeMap, resources, materialResolver));
  }
  target.setBaseTransform();
  return target;
}
function createNode(source, resources, materialResolver) {
  if (source.isBone) return new Bone();
  if (!source.isMesh) return new Group();
  resources.geometries.add(source.geometry);
  collectMaterials(resources.materials, source.material);
  const material = resolveMaterial(
    source.material,
    source,
    materialResolver
  );
  const mesh = new Mesh(source.geometry, material);
  mesh.skinIndex = source.skinIndex;
  mesh.primitiveMode = source.primitiveMode;
  mesh.nodeIndex = source.nodeIndex;
  return mesh;
}
function copyNodeState(source, target) {
  target.name = source.name;
  target.visible = source.visible !== false;
  target.position.copy(source.position);
  target.quaternion.copy(source.quaternion);
  target.scale.copy(source.scale);
  target.matrix = source.matrix ? copyMat4(source.matrix) : null;
  target.userData = { ...source.userData || {} };
}
function resolveMaterial(material, node, resolver) {
  if (Array.isArray(material)) {
    return material.map((item) => resolver?.(item, node) || item);
  }
  return resolver?.(material, node) || material;
}
function collectMaterials(target, material) {
  for (const item of Array.isArray(material) ? material : [material]) {
    if (item) target.add(item);
  }
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/assets/ModelAssetLoader.js?v=20260722-idle-actor-02
var templatePromises = /* @__PURE__ */ new Map();
var templateLoads = 0;
var instancesCreated = 0;
async function loadSharedGltfTemplate(url) {
  const resourceUrl = absoluteUrl(url);
  if (!templatePromises.has(resourceUrl)) {
    templateLoads += 1;
    templatePromises.set(resourceUrl, loadTinyGltf(resourceUrl));
  }
  return templatePromises.get(resourceUrl);
}
async function loadIsolatedGltf(url, label, options = {}) {
  const resourceUrl = absoluteUrl(url);
  const template = await loadSharedGltfTemplate(resourceUrl);
  const gltf = instantiateTinyGltf(template, {
    label,
    materialResolver: options.materialResolver
  });
  instancesCreated += 1;
  gltf.scene.userData.isolatedModelLoad = {
    instanceLabel: label,
    originalUrl: url,
    sharedNetworkResource: resourceUrl,
    sharedTemplate: true
  };
  return gltf;
}
function sharedGltfAssetStats() {
  return {
    instancesCreated,
    templateLoads,
    templatesCached: templatePromises.size
  };
}
function clearSharedGltfAssetCache() {
  templatePromises.clear();
  templateLoads = 0;
  instancesCreated = 0;
}
function absoluteUrl(url) {
  const base = globalThis.location?.href || "http://localhost/";
  return new URL(url, base).href;
}
export {
  clearSharedGltfAssetCache,
  loadIsolatedGltf,
  loadSharedGltfTemplate,
  sharedGltfAssetStats
};
