// B"H
/**
 * @file geometryKit.js
 * @description
 * Chapter 150: Textured village materials, safe in main thread or worker.
 *
 * The Awtsmoos now paints every visible village piece with a tiny procedural
 * canvas texture. No dead solid colors. If the code runs in a worker, it uses
 * OffscreenCanvas; if neither canvas exists, it falls back to color only rather
 * than crashing creation.
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

function hexParts(hex) {
  return { r: (hex >> 16) & 255, g: (hex >> 8) & 255, b: hex & 255 };
}

function shade(hex, amount) {
  const c = hexParts(hex);
  const mix = v => Math.max(0, Math.min(255, Math.round(v + amount)));
  return `rgb(${mix(c.r)},${mix(c.g)},${mix(c.b)})`;
}

function drawPattern(ctx, base, mode) {
  ctx.fillStyle = shade(base, 0);
  ctx.fillRect(0, 0, 64, 64);
  if (mode === "wood") for (let y = 0; y < 64; y += 8) { ctx.fillStyle = shade(base, y % 16 ? -28 : 22); ctx.fillRect(0, y, 64, 3); }
  if (mode === "stone") for (let i = 0; i < 45; i += 1) { ctx.fillStyle = shade(base, i % 3 === 0 ? 30 : -22); ctx.fillRect((i * 17) % 64, (i * 29) % 64, 11, 3); }
  if (mode === "roof") for (let x = 0; x < 64; x += 8) { ctx.fillStyle = shade(base, x % 16 ? -38 : 24); ctx.fillRect(x, 0, 4, 64); }
  if (mode === "floor") for (let y = 0; y < 64; y += 16) for (let x = 0; x < 64; x += 16) { ctx.fillStyle = shade(base, (x + y) % 32 ? 18 : -18); ctx.fillRect(x, y, 14, 14); }
  if (mode === "cloth") for (let x = 0; x < 64; x += 6) { ctx.fillStyle = shade(base, x % 12 ? 16 : -16); ctx.fillRect(x, 0, 2, 64); }
}

export function textureFor(base, mode = "stone") {
  const key = `${base}:${mode}`;
  if (cache.has(key)) return cache.get(key);
  const canvas = canvas64();
  const ctx = canvas?.getContext?.("2d");
  if (!canvas || !ctx) return null;
  drawPattern(ctx, base, mode);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(mode === "floor" ? 3 : 1.8, mode === "floor" ? 3 : 1.8);
  cache.set(key, tex);
  return tex;
}

export function material(color, extra = {}) {
  const { textureMode = "stone", ...rest } = extra;
  const map = textureFor(color, textureMode);
  const mat = new THREE.MeshLambertMaterial({ color, ...(map ? { map } : {}), ...rest });
  if (extra.emissive !== undefined && mat.emissive) mat.emissive.setHex(extra.emissive);
  if (extra.emissiveIntensity !== undefined) mat.emissiveIntensity = extra.emissiveIntensity;
  return mat;
}

export function add(group, kind, color, pos, scale, rot = [0, 0, 0], extra = {}) {
  const mesh = new THREE.Mesh(geometry(kind), material(color, extra));
  mesh.position.set(finite(pos?.[0]), finite(pos?.[1]), finite(pos?.[2]));
  mesh.scale.set(...vec3(scale));
  mesh.rotation.set(finite(rot?.[0]), finite(rot?.[1]), finite(rot?.[2]));
  mesh.castShadow = false;
  mesh.receiveShadow = false;
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
    child.userData ||= {};
    child.userData.skipOctree = true;
    child.userData.noOctree = true;
    child.userData.skipRaycast = true;
    child.userData.villageDecor = true;
    if (child.isMesh) child.frustumCulled = true;
  });
}
