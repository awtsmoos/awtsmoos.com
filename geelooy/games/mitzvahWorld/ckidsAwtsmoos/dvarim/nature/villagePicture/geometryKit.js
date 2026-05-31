// B"H
/**
 * @file geometryKit.js
 * @description
 * Chapter 109: the forge is truly quiet now. The Awtsmoos still uses the
 * procedural library, but picture props are born without flooding DevTools.
 * Every mesh is finite, decorative, and forbidden from collision/raycast.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { generateProceduralGeometry } from "../../../../../../libs/awtsmoos-procedural-core/src/core/geometry/geometryGenerator.js";

const DEFAULT_CUBE = Object.freeze({ size: 1 });

function finite(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

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
  finally {
    console.log = originals.log;
    console.info = originals.info;
    console.warn = originals.warn;
  }
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
  g.computeBoundingSphere();
  return g;
}

export function material(color, extra = {}) {
  return new THREE.MeshLambertMaterial({ color, ...extra });
}

export function add(group, kind, color, pos, scale, rot = [0, 0, 0], extra = {}) {
  const mesh = new THREE.Mesh(geometry(kind), material(color, extra));
  mesh.position.set(finite(pos?.[0]), finite(pos?.[1]), finite(pos?.[2]));
  mesh.scale.set(...vec3(scale));
  mesh.rotation.set(finite(rot?.[0]), finite(rot?.[1]), finite(rot?.[2]));
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
  });
}
