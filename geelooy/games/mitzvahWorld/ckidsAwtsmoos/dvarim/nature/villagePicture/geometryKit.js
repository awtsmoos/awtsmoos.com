// B"H
/**
 * @file geometryKit.js
 * @description
 * Chapter 204: The dead slab receives skin.
 * The custom cube generator did not guarantee stable UVs, so textures existed
 * in code but rendered as flat colors. Cube-like village parts now use
 * THREE.BoxGeometry with real UVs, and every texture is a DataTexture that works
 * in workers and mobile contexts without canvas support.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { generateProceduralGeometry } from "../../../../../../libs/awtsmoos-procedural-core/src/core/geometry/geometryGenerator.js";

const cache = new Map();
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

function quietGeometry(factory) {
  const originals = { log: console.log, info: console.info, warn: console.warn };
  const quiet = (...args) => { if (!String(args[0] || "").includes("picture_")) originals.log(...args); };
  console.log = quiet; console.info = quiet; console.warn = quiet;
  try { return factory(); } finally { console.log = originals.log; console.info = originals.info; console.warn = originals.warn; }
}

export function vec3(values) { return [finite(values?.[0], 1), finite(values?.[1], 1), finite(values?.[2], 1)]; }

export function geometry(kind) {
  if (kind === "cube" || kind === "box") {
    const g = new THREE.BoxGeometry(1, 1, 1);
    g.computeBoundingBox(); g.computeBoundingSphere();
    return g;
  }
  const data = quietGeometry(() => generateProceduralGeometry(kind, { size: 1 }, [], { id: `picture_${kind}` }));
  const g = new THREE.BufferGeometry();
  const pos = data.positions || data.verts || data.vertices || [];
  const nor = data.normals || [], uv = data.uvs || [], ind = data.indices || [];
  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pos), 3));
  if (nor.length) g.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(nor), 3));
  if (uv.length) g.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(uv), 2));
  if (ind.length) g.setIndex(new THREE.BufferAttribute(Math.max(...ind) > 65535 ? new Uint32Array(ind) : new Uint16Array(ind), 1));
  if (!nor.length) g.computeVertexNormals();
  g.computeBoundingBox(); g.computeBoundingSphere();
  return g;
}

function clamp(v) { return Math.max(0, Math.min(255, Math.round(v))); }
function parts(hex) { return [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255]; }
function put(data, i, base, d = 0) { data[i] = clamp(base[0] + d); data[i + 1] = clamp(base[1] + d); data[i + 2] = clamp(base[2] + d); data[i + 3] = 255; }
function noise(x, y, s = 1) { const n = Math.sin(x * 127.1 + y * 311.7 + s * 91.3) * 43758.5453; return n - Math.floor(n); }

function drawStone(data, size, base) {
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = (y * size + x) * 4, row = Math.floor(y / 10), off = row % 2 ? 10 : 0;
    const mortar = y % 10 < 2 || ((x + off) % 20) < 2;
    const chip = noise(x, y, 4) > 0.82 ? -38 : 0;
    put(data, i, base, mortar ? -54 : 16 + chip + noise(x, y, 2) * 24);
  }
}
function drawWood(data, size, base) {
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = (y * size + x) * 4;
    const board = x % 16 < 2 ? -54 : 0, grain = Math.sin(y * 0.42 + noise(x, y, 3) * 5) * 28;
    const knot = Math.hypot((x % 32) - 17, (y % 32) - 16) < 4 ? -45 : 0;
    put(data, i, base, 12 + board + grain + knot);
  }
}
function drawRoof(data, size, base) {
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) put(data, (y * size + x) * 4, base, (x % 9 < 3 ? 36 : -18) + noise(x, y, 6) * 14);
}
function drawFloor(data, size, base) {
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) put(data, (y * size + x) * 4, base, (y % 16 < 2 || x % 32 < 2 ? -38 : 12) + noise(x, y, 8) * 18);
}
function drawCloth(data, size, base) {
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) put(data, (y * size + x) * 4, base, (x % 8 < 2 || y % 8 < 2 ? 30 : -8) + noise(x, y, 9) * 10);
}

export function textureFor(color, mode = "stone") {
  const key = `${color}:${mode}:uv-data-204`;
  if (cache.has(key)) return cache.get(key);
  const size = 64, data = new Uint8Array(size * size * 4), base = parts(color || 0xffffff);
  if (mode === "wood") drawWood(data, size, base); else if (mode === "roof") drawRoof(data, size, base);
  else if (mode === "floor") drawFloor(data, size, base); else if (mode === "cloth") drawCloth(data, size, base); else drawStone(data, size, base);
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.UnsignedByteType);
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter;
  tex.repeat.set(mode === "floor" ? 4 : 2.8, mode === "floor" ? 4 : 2.8);
  tex.needsUpdate = true; cache.set(key, tex); return tex;
}

export function material(color, extra = {}) {
  const { textureMode = "stone", ...rest } = extra;
  const mat = new THREE.MeshLambertMaterial({ color: 0xffffff, map: textureFor(color, textureMode), ...rest });
  if (extra.emissive !== undefined && mat.emissive) mat.emissive.setHex(extra.emissive);
  if (extra.emissiveIntensity !== undefined) mat.emissiveIntensity = extra.emissiveIntensity;
  return mat;
}

export function add(group, kind, color, pos, scale, rot = [0, 0, 0], extra = {}) {
  const mesh = new THREE.Mesh(geometry(kind), material(color, extra));
  mesh.position.set(finite(pos?.[0]), finite(pos?.[1]), finite(pos?.[2]));
  mesh.scale.set(...vec3(scale)); mesh.rotation.set(finite(rot?.[0]), finite(rot?.[1]), finite(rot?.[2]));
  mesh.castShadow = false; mesh.receiveShadow = false; group.add(mesh); return mesh;
}

export function light(group, color, pos, intensity = 1, distance = 7) {
  const point = new THREE.PointLight(color, finite(intensity, 1), finite(distance, 7), 2);
  point.position.set(finite(pos?.[0]), finite(pos?.[1]), finite(pos?.[2])); group.add(point); return point;
}

export function markDecorative(root) {
  root.traverse(child => { Object.assign(child.userData ||= {}, { skipOctree: true, noOctree: true, skipRaycast: true, villageDecor: true }); if (child.isMesh) child.frustumCulled = true; });
}
