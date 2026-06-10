// B"H
/**
 * @file grassField.js
 * @description
 * Chapter 543: The meadow stops rendering as black scratches on mobile.
 *
 * Some phone GPUs made lit instanced blade triangles read nearly black. This
 * field now uses unlit mobile-safe colors, clamps every tint into a bright green
 * range, disables shadows, and keeps the whole meadow visual-only.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { finite, hash, setInstance } from "../math.js";
import { finishInstanced, markDecorative } from "../decor.js";
const color = new THREE.Color();
const mix = (a, b, t) => a + (b - a) * t;
function bladeGeo(height = 0.26, width = 0.026) {
  const geo = new THREE.BufferGeometry();
  const p = [-width, 0, 0, width, 0, 0, width * 0.22, height, 0.012, 0, 0, -width, width, 0, 0.006, -width * 0.2, height * 0.9, 0];
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(p), 3));
  geo.setIndex(new THREE.BufferAttribute(new Uint16Array([0, 1, 2, 3, 4, 5]), 1));
  geo.computeBoundingSphere();
  return geo;
}
function flowerGeo() {
  const geo = new THREE.BufferGeometry(), verts = [0, 0, 0.012];
  for (let i = 0; i < 8; i += 1) { const a = i * Math.PI * 2 / 8; verts.push(Math.cos(a) * 0.04, Math.sin(a) * 0.04, 0.012); }
  const idx = []; for (let i = 1; i <= 8; i += 1) idx.push(0, i, i === 8 ? 1 : i + 1);
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(verts), 3));
  geo.setIndex(new THREE.BufferAttribute(new Uint16Array(idx), 1));
  geo.computeBoundingSphere();
  return geo;
}
function patchPoint(patch, seed, i) { const a = hash(i, seed, 1) * Math.PI * 2, r = finite(patch.radius, 12) * Math.sqrt(hash(i, seed, 2)); return { x: finite(patch.x) + Math.cos(a) * r, z: finite(patch.z) + Math.sin(a) * r }; }
function choose(patches, seed, i, radius) { return patches.length ? patches[Math.floor(hash(i, seed, 4) * patches.length)] : { x: 0, z: 0, radius }; }
function safeTint(mesh, i, base, alt, seed, warmth = 0) {
  const a = new THREE.Color(base || 0x6fbf55), b = new THREE.Color(alt || 0xa6df70);
  color.setRGB(mix(a.r, b.r, hash(i, seed, 70)), mix(a.g, b.g, hash(i, seed, 71)), mix(a.b, b.b, hash(i, seed, 72)));
  color.offsetHSL((hash(i, seed, 73) - 0.5) * 0.02, 0.08, 0.12 + warmth);
  color.r = Math.max(color.r, 0.22); color.g = Math.max(color.g, 0.48); color.b = Math.max(color.b, 0.18);
  mesh.setColorAt(i, color);
}
function blade(mesh, i, p, y, seed, tall = 1) {
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler((hash(i, seed, 21) - 0.5) * 0.18, hash(i, seed, 2) * Math.PI * 2, (hash(i, seed, 22) - 0.5) * 0.12));
  const s = new THREE.Vector3(0.7 + hash(i, seed, 9) * 0.65, (0.58 + hash(i, seed, 12) * 0.92) * tall, 0.7 + hash(i, seed, 15) * 0.65);
  setInstance(mesh, i, new THREE.Vector3(p.x, y, p.z), q, s);
}
function flower(mesh, i, p, y, seed) {
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2 + (hash(i, seed, 29) - 0.5) * 0.14, 0, hash(i, seed, 31) * Math.PI * 2));
  const s = new THREE.Vector3(0.72 + hash(i, seed, 34) * 0.82, 0.72 + hash(i, seed, 35) * 0.82, 1);
  setInstance(mesh, i, new THREE.Vector3(p.x, y + 0.03, p.z), q, s);
}
function mat() { return new THREE.MeshBasicMaterial({ color: 0xffffff, vertexColors: true, side: THREE.DoubleSide }); }
function makeMesh(geo, material, count, name) {
  const mesh = new THREE.InstancedMesh(geo, material, count); mesh.name = name; mesh.castShadow = false; mesh.receiveShadow = false; return mesh;
}
export function createGrassField(op = {}, heightAt = () => 0) {
  const patches = op.patches || [];
  const count = Math.max(1, Math.floor(finite(op.count, 1600)));
  const tallCount = Math.floor(count * Math.min(finite(op.tallRatio, 0.16), 0.16));
  const flowerCount = Math.floor(count * Math.min(finite(op.flowerRatio, 0.18), 0.18));
  const short = makeMesh(bladeGeo(0.24, 0.022), mat(), count, "mobile_safe_meadow_short_green_not_black");
  const tall = makeMesh(bladeGeo(0.42, 0.02), mat(), tallCount, "mobile_safe_meadow_tall_green_not_black");
  const flowers = makeMesh(flowerGeo(), mat(), flowerCount, "mobile_safe_meadow_flowers_not_black");
  for (let i = 0; i < count; i += 1) { const p = patchPoint(choose(patches, 7, i, finite(op.radius, 60)), 7, i); blade(short, i, p, heightAt(p.x, p.z) + finite(op.groundLift, 0.014), 7, 0.78); safeTint(short, i, 0x6fc95a, 0xb5e878, 7, 0.02); }
  for (let i = 0; i < tallCount; i += 1) { const p = patchPoint(choose(patches, 43, i, finite(op.radius, 60)), 43, i); blade(tall, i, p, heightAt(p.x, p.z) + finite(op.groundLift, 0.016), 43, 0.96); safeTint(tall, i, 0x74bc4d, 0xd6e86f, 43, 0.02); }
  for (let i = 0; i < flowerCount; i += 1) { const p = patchPoint(choose(patches, 91, i, finite(op.radius, 60)), 91, i); flower(flowers, i, p, heightAt(p.x, p.z) + finite(op.groundLift, 0.02), 91); safeTint(flowers, i, op.flowerColor || 0xffe776, op.flowerAltColor || 0xffb8df, 91, 0.08); }
  finishInstanced([short, tall, flowers]);
  const group = new THREE.Group(); group.name = op.name || "AwtsmoosGrassField_mobile_safe_no_black"; group.add(short, tall, flowers); return markDecorative(group);
}
