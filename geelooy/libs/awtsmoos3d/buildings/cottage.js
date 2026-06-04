// B"H
/**
 * @file cottage.js
 * @description
 * Chapter 47: The Awtsmoos gives the cottage a face.
 * A reusable Lambert cottage kit: plaster walls, red tiled roof rows, dark wood
 * door, window boxes, lantern glow, and ivy planes. Cheap geometry, strong art.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { finite } from "../math.js";
import { markDecorative } from "../decor.js";
import { lambertNoise, basicGlow } from "../lambert.js";

const box = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
function tileRows(width, depth, y, z, color) {
  const g = new THREE.Group();
  const mat = lambertNoise(color, "#9e3c25");
  for (let i = 0; i < 8; i += 1) {
    const row = box(width * 1.08, 0.08, 0.16, mat);
    row.position.set(0, y - i * 0.09, z + i * depth * 0.055);
    g.add(row);
  }
  return g;
}
function windowBox(x, y, z) {
  const g = new THREE.Group();
  g.add(box(1.05, 0.92, 0.08, lambertNoise(0x3a2417, "#4c2d18")));
  const flower = box(1.15, 0.16, 0.18, new THREE.MeshLambertMaterial({ color: 0x5b3a1f }));
  flower.position.set(0, -0.56, 0.05);
  g.add(flower); g.position.set(x, y, z); return g;
}
function lantern(x, y, z) {
  const g = new THREE.Group();
  g.add(box(0.18, 0.46, 0.18, new THREE.MeshLambertMaterial({ color: 0x24150c })));
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 8), basicGlow(0xffb45d, 0.33));
  glow.position.y = -0.02; g.add(glow); g.position.set(x, y, z); return g;
}
function ivy(x, z, height) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1.2, height), new THREE.MeshLambertMaterial({ color: 0x2f6f2f, transparent: true, opacity: 0.72, side: THREE.DoubleSide }));
  m.position.set(x, height / 2, z); return m;
}

/** @param {Object} op @returns {THREE.Group} */
export function createCottage(op = {}) {
  const w = finite(op.width, 8), d = finite(op.depth, 6), h = finite(op.height, 4.2);
  const group = new THREE.Group(); group.name = op.name || "AwtsmoosCottage_reusable_lambert";
  const wall = box(w, h, d, lambertNoise(finite(op.wallColor, 0xb8aa89), "#b8aa89")); wall.position.y = h / 2; group.add(wall);
  const roof = tileRows(w, d, h + 0.75, -d * 0.15, finite(op.roofColor, 0x9e3c25)); roof.rotation.x = -0.38; group.add(roof);
  const roof2 = tileRows(w, d, h + 0.75, d * 0.15, finite(op.roofColor, 0x9e3c25)); roof2.rotation.x = 0.38; group.add(roof2);
  const door = box(1.45, 2.5, 0.14, lambertNoise(0x4b2c18, "#4b2c18")); door.position.set(-0.7, 1.25, d / 2 + 0.08); group.add(door);
  group.add(windowBox(2.15, 2.15, d / 2 + 0.1), windowBox(-3.05, 2.1, d / 2 + 0.1), lantern(1.0, 2.1, d / 2 + 0.25), ivy(3.55, d / 2 + 0.12, 3.4));
  group.position.set(finite(op.position?.x), finite(op.position?.y), finite(op.position?.z));
  group.rotation.y = finite(op.rotationY, 0); group.scale.setScalar(finite(op.scale, 1));
  return markDecorative(group);
}
