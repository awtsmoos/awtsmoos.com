// B"H
/**
 * @file grassField.js
 * @description
 * Chapter 27: The Awtsmoos grows thousands of tiny testimonies.
 * Reusable instanced grass and flower flecks give mobile WebGL dense ground
 * life without skeletal animation, alpha blending storms, or custom shaders.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { finite, hash, setInstance } from "../math.js";
import { finishInstanced, markDecorative } from "../decor.js";

function bladeGeo(height = 0.26, width = 0.026) {
  const geo = new THREE.BufferGeometry();
  const p = [-width, 0, 0, width, 0, 0, width * 0.22, height, 0.012, 0, 0, -width, width, 0, 0.006, -width * 0.2, height * 0.9, 0];
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(p), 3));
  geo.setIndex(new THREE.BufferAttribute(new Uint16Array([0, 1, 2, 3, 4, 5]), 1));
  geo.computeVertexNormals();
  return geo;
}
const flowerGeo = () => new THREE.CircleGeometry(0.035, 6);
function patchPoint(patch, seed, i) {
  const a = hash(i, seed, 1) * Math.PI * 2;
  const r = finite(patch.radius, 12) * Math.sqrt(hash(i, seed, 2));
  return { x: finite(patch.x) + Math.cos(a) * r, z: finite(patch.z) + Math.sin(a) * r };
}
function choose(patches, seed, i, radius) {
  return patches.length ? patches[Math.floor(hash(i, seed, 4) * patches.length)] : { x: 0, z: 0, radius };
}
function blade(mesh, i, p, y, seed, tall = 1) {
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler((hash(i, seed, 21) - 0.5) * 0.13, hash(i, seed, 2) * Math.PI * 2, (hash(i, seed, 3) - 0.5) * 0.18));
  const s = new THREE.Vector3(0.7 + hash(i, seed, 9) * 0.8, (0.65 + hash(i, seed, 12) * 1.05) * tall, 0.7 + hash(i, seed, 15) * 0.8);
  setInstance(mesh, i, new THREE.Vector3(p.x, y, p.z), q, s);
}
function flower(mesh, i, p, y, seed) {
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, hash(i, seed, 31) * Math.PI * 2));
  const s = new THREE.Vector3(0.8 + hash(i, seed, 34), 0.8 + hash(i, seed, 35), 1);
  setInstance(mesh, i, new THREE.Vector3(p.x, y + 0.016, p.z), q, s);
}

/** @param {Object} op @param {(x:number,z:number)=>number} heightAt @returns {THREE.Group} */
export function createGrassField(op = {}, heightAt = () => 0) {
  const patches = op.patches || [];
  const count = Math.max(1, Math.floor(finite(op.count, 2200)));
  const tallCount = Math.floor(count * finite(op.tallRatio, 0.34));
  const flowerCount = Math.floor(count * finite(op.flowerRatio, 0.2));
  const short = new THREE.InstancedMesh(bladeGeo(0.24, 0.026), new THREE.MeshLambertMaterial({ color: op.shortColor || 0x4f9b3b, side: THREE.DoubleSide }), count);
  const tall = new THREE.InstancedMesh(bladeGeo(0.46, 0.022), new THREE.MeshLambertMaterial({ color: op.tallColor || 0x347a2e, side: THREE.DoubleSide }), tallCount);
  const flowers = new THREE.InstancedMesh(flowerGeo(), new THREE.MeshBasicMaterial({ color: op.flowerColor || 0xe8d860, side: THREE.DoubleSide }), flowerCount);
  for (let i = 0; i < count; i += 1) { const p = patchPoint(choose(patches, 7, i, finite(op.radius, 60)), 7, i); blade(short, i, p, heightAt(p.x, p.z) + finite(op.groundLift, 0.014), 7, 0.86); }
  for (let i = 0; i < tallCount; i += 1) { const p = patchPoint(choose(patches, 43, i, finite(op.radius, 60)), 43, i); blade(tall, i, p, heightAt(p.x, p.z) + finite(op.groundLift, 0.015), 43, 1.12); }
  for (let i = 0; i < flowerCount; i += 1) { const p = patchPoint(choose(patches, 91, i, finite(op.radius, 60)), 91, i); flower(flowers, i, p, heightAt(p.x, p.z) + finite(op.groundLift, 0.018), 91); }
  finishInstanced([short, tall, flowers]);
  const group = new THREE.Group(); group.name = op.name || "AwtsmoosGrassField_reusable"; group.add(short, tall, flowers);
  return markDecorative(group);
}
