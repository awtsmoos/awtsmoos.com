// B"H
/**
 * @file cobblePath.js
 * @description
 * Chapter 25: The Awtsmoos turns a flat road into individual remembered steps.
 * This reusable generator lays alpha-free Lambert cobbles over a warm dirt bed,
 * driven by polyline data and device-safe instancing.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { finite, hash, setInstance } from "../math.js";
import { markDecorative, finishInstanced } from "../decor.js";
import { lambertNoise } from "../lambert.js";

function stoneGeometry() {
  const shape = new THREE.Shape();
  const r = 0.14;
  shape.moveTo(-0.5 + r, -0.32);
  shape.lineTo(0.5 - r, -0.32);
  shape.quadraticCurveTo(0.5, -0.32, 0.5, -0.18);
  shape.lineTo(0.5, 0.18);
  shape.quadraticCurveTo(0.5, 0.32, 0.36, 0.32);
  shape.lineTo(-0.36, 0.32);
  shape.quadraticCurveTo(-0.5, 0.32, -0.5, 0.18);
  shape.lineTo(-0.5, -0.18);
  shape.quadraticCurveTo(-0.5, -0.32, -0.36, -0.32);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.025, bevelSegments: 1 });
  geo.rotateX(-Math.PI / 2);
  geo.center();
  return geo;
}

function sample(points, t) {
  const scaled = t * (points.length - 1);
  const i = Math.min(points.length - 2, Math.floor(scaled));
  const f = scaled - i;
  const a = points[i], b = points[i + 1];
  return { x: a[0] + (b[0] - a[0]) * f, z: a[1] + (b[1] - a[1]) * f, dx: b[0] - a[0], dz: b[1] - a[1] };
}

function place(mesh, i, point, op) {
  const lane = (hash(i, 4, 9) - 0.5) * finite(op.width, 4.2);
  const len = Math.hypot(point.dx, point.dz) || 1;
  const p = new THREE.Vector3(point.x + (-point.dz / len) * lane, finite(op.y, 0.05) + hash(i, 1, 2) * 0.025, point.z + (point.dx / len) * lane);
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.atan2(point.dx, point.dz) + lane * 0.08, 0));
  const s = new THREE.Vector3(0.72 + hash(i, 8, 1) * 0.75, 0.72 + hash(i, 8, 2) * 0.34, 0.5 + hash(i, 8, 3) * 0.45);
  setInstance(mesh, i, p, q, s);
}

/** @param {Object} op @returns {THREE.Group} */
export function createCobblePath(op = {}) {
  const points = op.points || [[-12, 17], [-6, 10], [0, 5.5], [7, 1.2], [13, -4.5]];
  const count = Math.max(4, Math.floor(finite(op.count, 110)));
  const group = new THREE.Group();
  group.name = op.name || "AwtsmoosCobblePath_reusable";
  const dirt = new THREE.Mesh(new THREE.PlaneGeometry(finite(op.length, 42), finite(op.width, 5.8)), lambertNoise(finite(op.dirtColor, 0x8b6741), "#8a673f"));
  dirt.rotation.x = -Math.PI / 2;
  dirt.rotation.z = finite(op.rotationY, -0.62);
  dirt.position.set(finite(op.dirtX), finite(op.y, 0.03), finite(op.dirtZ, 6.2));
  const stones = new THREE.InstancedMesh(stoneGeometry(), lambertNoise(finite(op.stoneColor, 0xb9ad91), "#b9ad91"), count);
  for (let i = 0; i < count; i += 1) place(stones, i, sample(points, i / Math.max(1, count - 1)), op);
  finishInstanced([stones]);
  group.add(dirt, stones);
  return markDecorative(group);
}
