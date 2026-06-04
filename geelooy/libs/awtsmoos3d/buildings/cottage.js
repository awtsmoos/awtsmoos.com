// B"H
/**
 * @file cottage.js
 * @description
 * Chapter 76: The cottage plaster, roof, and door are shader snapshots.
 * The building remains Lambert and cheap, while its visual surfaces are baked
 * once from custom procedural shaders through the active renderer.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { finite } from "../math.js";
import { markDecorative } from "../decor.js";
import { lambertNoise, basicGlow } from "../lambert.js?v=shader-lambert-20260604-bh437";

const box = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
function tileRows(width, depth, y, z, color, ctx) {
  const group = new THREE.Group();
  const mat = lambertNoise(color, 0x9e3c25, ctx);
  for (let i = 0; i < 8; i += 1) {
    const row = box(width * 1.08, 0.08, 0.16, mat);
    row.position.set(0, y - i * 0.09, z + i * depth * 0.055);
    group.add(row);
  }
  return group;
}
function windowBox(x, y, z, ctx) {
  const group = new THREE.Group();
  group.add(box(1.05, 0.92, 0.08, lambertNoise(0x3a2417, 0x4c2d18, ctx)));
  const flower = box(1.15, 0.16, 0.18, new THREE.MeshLambertMaterial({ color: 0x5b3a1f }));
  flower.position.set(0, -0.56, 0.05);
  group.add(flower);
  group.position.set(x, y, z);
  return group;
}
function lantern(x, y, z) {
  const group = new THREE.Group();
  group.add(box(0.18, 0.46, 0.18, new THREE.MeshLambertMaterial({ color: 0x24150c })));
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 8), basicGlow(0xffb45d, 0.33));
  glow.position.y = -0.02;
  group.add(glow);
  group.position.set(x, y, z);
  return group;
}
function ivy(x, z, height) {
  const mat = new THREE.MeshLambertMaterial({ color: 0x2f6f2f, transparent: true, opacity: 0.72, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.2, height), mat);
  mesh.position.set(x, height / 2, z);
  return mesh;
}

/** @param {Object} op @param {Object} ctx @returns {THREE.Group} */
export function createCottage(op = {}, ctx = {}) {
  const w = finite(op.width, 8);
  const d = finite(op.depth, 6);
  const h = finite(op.height, 4.2);
  const renderCtx = { renderer: ctx.renderer || ctx.olam?.renderer || op.renderer };
  const group = new THREE.Group();
  group.name = op.name || "AwtsmoosCottage_reusable_lambert";
  const wall = box(w, h, d, lambertNoise(finite(op.wallColor, 0xb8aa89), 0xb8aa89, renderCtx));
  wall.position.y = h / 2;
  group.add(wall);
  const roof = tileRows(w, d, h + 0.75, -d * 0.15, finite(op.roofColor, 0x9e3c25), renderCtx);
  roof.rotation.x = -0.38;
  const roof2 = tileRows(w, d, h + 0.75, d * 0.15, finite(op.roofColor, 0x9e3c25), renderCtx);
  roof2.rotation.x = 0.38;
  const door = box(1.45, 2.5, 0.14, lambertNoise(0x4b2c18, 0x4b2c18, renderCtx));
  door.position.set(-0.7, 1.25, d / 2 + 0.08);
  group.add(roof, roof2, door, windowBox(2.15, 2.15, d / 2 + 0.1, renderCtx), windowBox(-3.05, 2.1, d / 2 + 0.1, renderCtx), lantern(1, 2.1, d / 2 + 0.25), ivy(3.55, d / 2 + 0.12, 3.4));
  group.position.set(finite(op.position?.x), finite(op.position?.y), finite(op.position?.z));
  group.rotation.y = finite(op.rotationY, 0);
  group.scale.setScalar(finite(op.scale, 1));
  return markDecorative(group);
}
