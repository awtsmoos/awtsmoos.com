// B"H
/**
 * @file grassField.js
 * @description
 * Chapter 116: The meadow learns color variation without costing draw calls.
 *
 * The Awtsmoos scatters blades with per-instance greens, warm seed heads, and
 * tiny flower faces. The geometry remains instanced and decorative, so the
 * village gains texture and life without poisoning raycasts, octrees, or mobile
 * speed. Every blade is a small poem, but all of them share one breath.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { finite, hash, setInstance } from "../math.js";
import { finishInstanced, markDecorative } from "../decor.js";

const color = new THREE.Color();
const mix = (a, b, t) => a + (b - a) * t;

function bladeGeo(height = 0.26, width = 0.026) {
  const geo = new THREE.BufferGeometry();
  const p = [
    -width, 0, 0, width, 0, 0, width * 0.22, height, 0.012,
    0, 0, -width, width, 0, 0.006, -width * 0.2, height * 0.9, 0
  ];
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(p), 3));
  geo.setIndex(new THREE.BufferAttribute(new Uint16Array([0, 1, 2, 3, 4, 5]), 1));
  geo.computeVertexNormals();
  return geo;
}
function flowerGeo() {
  const geo = new THREE.BufferGeometry();
  const verts = [0, 0, 0.012];
  for (let i = 0; i < 8; i += 1) {
    const a = i * Math.PI * 2 / 8;
    verts.push(Math.cos(a) * 0.04, Math.sin(a) * 0.04, 0.012);
  }
  const idx = [];
  for (let i = 1; i <= 8; i += 1) idx.push(0, i, i === 8 ? 1 : i + 1);
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(verts), 3));
  geo.setIndex(new THREE.BufferAttribute(new Uint16Array(idx), 1));
  geo.computeVertexNormals();
  return geo;
}
function patchPoint(patch, seed, i) {
  const a = hash(i, seed, 1) * Math.PI * 2;
  const r = finite(patch.radius, 12) * Math.sqrt(hash(i, seed, 2));
  return { x: finite(patch.x) + Math.cos(a) * r, z: finite(patch.z) + Math.sin(a) * r };
}
function choose(patches, seed, i, radius) {
  return patches.length ? patches[Math.floor(hash(i, seed, 4) * patches.length)] : { x: 0, z: 0, radius };
}
function tint(mesh, i, base, alt, seed, warmth = 0) {
  const a = new THREE.Color(base || 0x4f9b3b), b = new THREE.Color(alt || 0x6aaa46);
  color.setRGB(mix(a.r, b.r, hash(i, seed, 70)), mix(a.g, b.g, hash(i, seed, 71)), mix(a.b, b.b, hash(i, seed, 72)));
  color.offsetHSL((hash(i, seed, 73) - 0.5) * 0.035, (hash(i, seed, 74) - 0.5) * 0.22, (hash(i, seed, 75) - 0.5) * 0.16 + warmth);
  mesh.setColorAt(i, color);
}
function blade(mesh, i, p, y, seed, tall = 1) {
  const leanX = (hash(i, seed, 21) - 0.5) * 0.22;
  const leanZ = (hash(i, seed, 22) - 0.5) * 0.18;
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(leanX, hash(i, seed, 2) * Math.PI * 2, leanZ));
  const s = new THREE.Vector3(0.65 + hash(i, seed, 9) * 0.9, (0.62 + hash(i, seed, 12) * 1.16) * tall, 0.65 + hash(i, seed, 15) * 0.9);
  setInstance(mesh, i, new THREE.Vector3(p.x, y, p.z), q, s);
}
function flower(mesh, i, p, y, seed) {
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2 + (hash(i, seed, 29) - 0.5) * 0.14, 0, hash(i, seed, 31) * Math.PI * 2));
  const s = new THREE.Vector3(0.7 + hash(i, seed, 34) * 1.1, 0.7 + hash(i, seed, 35) * 1.1, 1);
  setInstance(mesh, i, new THREE.Vector3(p.x, y + 0.03, p.z), q, s);
}

/**
 * Creates dense visual-only grass and flowers.
 * @param {Object} op Field options.
 * @param {(x:number,z:number)=>number} heightAt Terrain height sampler.
 * @returns {THREE.Group} Decorative instanced meadow group.
 */
export function createGrassField(op = {}, heightAt = () => 0) {
  const patches = op.patches || [];
  const count = Math.max(1, Math.floor(finite(op.count, 2400)));
  const tallCount = Math.floor(count * finite(op.tallRatio, 0.28));
  const flowerCount = Math.floor(count * finite(op.flowerRatio, 0.22));
  const short = new THREE.InstancedMesh(bladeGeo(0.25, 0.026), new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true, side: THREE.DoubleSide }), count);
  const tall = new THREE.InstancedMesh(bladeGeo(0.5, 0.023), new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true, side: THREE.DoubleSide }), tallCount);
  const flowers = new THREE.InstancedMesh(flowerGeo(), new THREE.MeshBasicMaterial({ color: 0xffffff, vertexColors: true, side: THREE.DoubleSide }), flowerCount);
  for (let i = 0; i < count; i += 1) {
    const p = patchPoint(choose(patches, 7, i, finite(op.radius, 60)), 7, i);
    blade(short, i, p, heightAt(p.x, p.z) + finite(op.groundLift, 0.014), 7, 0.86);
    tint(short, i, op.shortColor || 0x4f9b3b, op.shortAltColor || 0x82b85a, 7, 0.02);
  }
  for (let i = 0; i < tallCount; i += 1) {
    const p = patchPoint(choose(patches, 43, i, finite(op.radius, 60)), 43, i);
    blade(tall, i, p, heightAt(p.x, p.z) + finite(op.groundLift, 0.016), 43, 1.16);
    tint(tall, i, op.tallColor || 0x347a2e, op.tallAltColor || 0x6f8f35, 43, 0.01);
  }
  for (let i = 0; i < flowerCount; i += 1) {
    const p = patchPoint(choose(patches, 91, i, finite(op.radius, 60)), 91, i);
    flower(flowers, i, p, heightAt(p.x, p.z) + finite(op.groundLift, 0.02), 91);
    tint(flowers, i, op.flowerColor || 0xe8d860, op.flowerAltColor || 0xd99bd7, 91, 0.08);
  }
  finishInstanced([short, tall, flowers]);
  const group = new THREE.Group();
  group.name = op.name || "AwtsmoosGrassField_reusable_varied_meadow";
  group.add(short, tall, flowers);
  return markDecorative(group);
}
