// B"H
/**
 * @file geometryKit.js
 * @description
 * Chapter 200: The grain screams quietly through every board.
 *
 * The Awtsmoos renews every surface from speech every instant; this helper does
 * the small game-world mirror of that truth. A cube is not allowed to remain a
 * dead flat color. Stone receives seams, flecks, and uneven courses. Wood gets
 * stripes, knots, and dark breaths between boards. Floor tiles receive grout so
 * the house under the chossid looks like a place he can actually stand.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { generateProceduralGeometry } from "../../../../../../libs/awtsmoos-procedural-core/src/core/geometry/geometryGenerator.js";

const DEFAULT_CUBE = Object.freeze({ size: 1 });
const cache = new Map();
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

function noisyGeometryLine(args) {
  const text = args.map(arg => String(arg || "")).join(" ");
  return text.includes("[picture_") || text.includes("MANIFESTING:") || text.includes("B\"H - 🌟") || /^B"H -\s*=+/.test(text);
}

function withQuietLogs(factory) {
  const originals = { log: console.log, info: console.info, warn: console.warn };
  const quiet = (...args) => { if (!noisyGeometryLine(args)) originals.log(...args); };
  console.log = quiet;
  console.info = (...args) => { if (!noisyGeometryLine(args)) originals.info(...args); };
  console.warn = (...args) => { if (!noisyGeometryLine(args)) originals.warn(...args); };
  try { return factory(); }
  finally { console.log = originals.log; console.info = originals.info; console.warn = originals.warn; }
}

export function vec3(values) {
  return [finite(values?.[0], 1), finite(values?.[1], 1), finite(values?.[2], 1)];
}

export function geometry(kind, params = DEFAULT_CUBE) {
  const data = withQuietLogs(() => generateProceduralGeometry(kind, params, [], { id: `picture_${kind}` }));
  const g = new THREE.BufferGeometry();
  const pos = data.positions || data.verts || data.vertices || [];
  const nor = data.normals || [];
  const uv = data.uvs || [];
  const ind = data.indices || [];
  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pos), 3));
  if (nor.length) g.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(nor), 3));
  if (uv.length) g.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(uv), 2));
  if (ind.length) g.setIndex(new THREE.BufferAttribute(Math.max(...ind) > 65535 ? new Uint32Array(ind) : new Uint16Array(ind), 1));
  if (!nor.length) g.computeVertexNormals();
  g.computeBoundingBox();
  g.computeBoundingSphere();
  return g;
}

function canvas64() {
  if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(64, 64);
  if (typeof document !== "undefined") { const c = document.createElement("canvas"); c.width = 64; c.height = 64; return c; }
  return null;
}

function hexParts(hex) { return { r: (hex >> 16) & 255, g: (hex >> 8) & 255, b: hex & 255 }; }
function css(hex, amount = 0) {
  const c = hexParts(hex);
  const v = n => Math.max(0, Math.min(255, Math.round(n + amount)));
  return `rgb(${v(c.r)},${v(c.g)},${v(c.b)})`;
}

function drawWood(ctx, base) {
  ctx.fillStyle = css(base, 24); ctx.fillRect(0, 0, 64, 64);
  for (let y = 0; y < 64; y += 5) {
    ctx.fillStyle = css(base, y % 15 ? -56 : 58); ctx.fillRect(0, y, 64, 2);
    ctx.fillStyle = css(base, y % 10 ? -24 : 34); ctx.fillRect((y * 9) % 64, y + 2, 34, 1);
  }
  for (const k of [11, 37, 53]) { ctx.strokeStyle = css(base, -66); ctx.strokeRect(k, (k * 5) % 54, 8, 5); }
}

function drawStone(ctx, base) {
  ctx.fillStyle = css(base, 10); ctx.fillRect(0, 0, 64, 64);
  for (let y = 0; y < 64; y += 12) { ctx.fillStyle = css(base, -72); ctx.fillRect(0, y, 64, 2); }
  for (let y = 0; y < 64; y += 12) for (let x = (y % 24 ? 9 : 0); x < 64; x += 18) {
    ctx.fillStyle = css(base, -62); ctx.fillRect(x, y, 2, 12);
    ctx.fillStyle = css(base, ((x + y) % 36 ? 42 : -34)); ctx.fillRect(x + 3, y + 4, 8, 2);
  }
}

function drawPattern(ctx, base, mode) {
  if (mode === "wood") return drawWood(ctx, base);
  if (mode === "stone") return drawStone(ctx, base);
  ctx.fillStyle = css(base, 0); ctx.fillRect(0, 0, 64, 64);
  if (mode === "roof") for (let x = 0; x < 64; x += 7) { ctx.fillStyle = css(base, x % 14 ? -58 : 54); ctx.fillRect(x, 0, 4, 64); }
  if (mode === "floor") for (let y = 0; y < 64; y += 16) for (let x = 0; x < 64; x += 16) { ctx.fillStyle = css(base, -58); ctx.fillRect(x, y, 16, 2); ctx.fillRect(x, y, 2, 16); ctx.fillStyle = css(base, (x + y) % 32 ? 34 : -32); ctx.fillRect(x + 3, y + 3, 11, 11); }
  if (mode === "cloth") for (let x = 0; x < 64; x += 5) { ctx.fillStyle = css(base, x % 10 ? 32 : -32); ctx.fillRect(x, 0, 2, 64); }
}

export function textureFor(base, mode = "stone") {
  const key = `${base}:${mode}`;
  if (cache.has(key)) return cache.get(key);
  const canvas = canvas64();
  const ctx = canvas?.getContext?.("2d");
  if (!canvas || !ctx) return null;
  drawPattern(ctx, base, mode);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter;
  tex.repeat.set(mode === "floor" ? 5 : 3.2, mode === "floor" ? 5 : 3.2);
  tex.needsUpdate = true;
  cache.set(key, tex);
  return tex;
}

export function material(color, extra = {}) {
  const { textureMode = "stone", ...rest } = extra;
  const map = textureFor(color, textureMode);
  const mat = new THREE.MeshLambertMaterial({ color: map ? 0xffffff : color, ...(map ? { map } : {}), ...rest });
  if (extra.emissive !== undefined && mat.emissive) mat.emissive.setHex(extra.emissive);
  if (extra.emissiveIntensity !== undefined) mat.emissiveIntensity = extra.emissiveIntensity;
  return mat;
}

export function add(group, kind, color, pos, scale, rot = [0, 0, 0], extra = {}) {
  const mesh = new THREE.Mesh(geometry(kind), material(color, extra));
  mesh.position.set(finite(pos?.[0]), finite(pos?.[1]), finite(pos?.[2]));
  mesh.scale.set(...vec3(scale)); mesh.rotation.set(finite(rot?.[0]), finite(rot?.[1]), finite(rot?.[2]));
  mesh.castShadow = false; mesh.receiveShadow = false;
  group.add(mesh);
  return mesh;
}

export function light(group, color, pos, intensity = 1, distance = 7) {
  const point = new THREE.PointLight(color, finite(intensity, 1), finite(distance, 7), 2);
  point.position.set(finite(pos?.[0]), finite(pos?.[1]), finite(pos?.[2]));
  group.add(point);
  return point;
}

export function markDecorative(root) {
  root.traverse(child => {
    Object.assign(child.userData ||= {}, { skipOctree: true, noOctree: true, skipRaycast: true, villageDecor: true });
    if (child.isMesh) child.frustumCulled = true;
  });
}
