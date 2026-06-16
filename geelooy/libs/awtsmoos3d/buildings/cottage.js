// B"H
/** @file cottage.js @description Reusable cottage generator with explicit door contract alignment. */
import * as THREE from "/games/scripts/build/three.module.js";
import { finite } from "../math.js";
import { markDecorative } from "../decor.js";
import { lambertNoise, basicGlow } from "../lambert.js?v=shader-lambert-20260604-bh437";
const box = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
function material(color, alt, ctx) { return lambertNoise(color, alt, ctx); }
function tileRows(width, depth, y, z, color, ctx) {
  const group = new THREE.Group(), mat = material(color, 0x9e3c25, ctx);
  for (let i = 0; i < 8; i++) { const row = box(width * 1.08, 0.08, 0.16, mat); row.position.set(0, y - i * 0.09, z + i * depth * 0.055); group.add(row); }
  return group;
}
function windowBox(x, y, z, ctx) {
  const group = new THREE.Group();
  group.add(box(1.05, 0.92, 0.08, material(0x3a2417, 0x4c2d18, ctx)));
  const flower = box(1.15, 0.16, 0.18, new THREE.MeshLambertMaterial({ color:0x5b3a1f })); flower.position.set(0, -0.56, 0.05); group.add(flower); group.position.set(x, y, z); return group;
}
function lantern(x, y, z) {
  const group = new THREE.Group(); group.add(box(0.18, 0.46, 0.18, new THREE.MeshLambertMaterial({ color:0x24150c })));
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 8), basicGlow(0xffb45d, 0.33)); glow.position.y = -0.02; group.add(glow); group.position.set(x, y, z); return group;
}
function ivy(x, z, height) { const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.2, height), new THREE.MeshLambertMaterial({ color:0x2f6f2f, transparent:true, opacity:0.72, side:THREE.DoubleSide })); mesh.position.set(x, height / 2, z); return mesh; }
function doorSpec(op, d, h) { return { x:finite(op.doorX, 0), width:finite(op.doorWidth, 1.45), height:finite(op.doorHeight, Math.min(2.5, h * 0.68)), y:finite(op.doorY, Math.min(1.25, h * 0.34)), z:d / 2 + finite(op.doorFaceGap, 0.08) }; }
function addFrontDetails(group, op, w, d, h, ctx) {
  const ds = doorSpec(op, d, h), door = box(ds.width, ds.height, 0.14, material(finite(op.doorColor, 0x4b2c18), 0x4b2c18, ctx));
  door.name = "visual_cottage_door_contract_aligned"; door.position.set(ds.x, ds.y, ds.z); group.add(door);
  const leftWindowX = Math.max(-w * 0.36, ds.x - ds.width * 1.45 - 1.1), rightWindowX = Math.min(w * 0.36, ds.x + ds.width * 1.45 + 1.1);
  group.add(windowBox(rightWindowX, h * 0.51, d / 2 + 0.1, ctx), windowBox(leftWindowX, h * 0.5, d / 2 + 0.1, ctx), lantern(ds.x + ds.width * 0.95, h * 0.5, d / 2 + 0.25), ivy(w * 0.44, d / 2 + 0.12, Math.min(3.4, h * 0.82)));
}
export function createCottage(op = {}, ctx = {}) {
  const w = finite(op.width, 8), d = finite(op.depth, 6), h = finite(op.height, 4.2), renderCtx = { renderer:ctx.renderer || ctx.olam?.renderer || op.renderer };
  const group = new THREE.Group(); group.name = op.name || "AwtsmoosCottage_reusable_lambert";
  const wall = box(w, h, d, material(finite(op.wallColor, 0xb8aa89), 0xb8aa89, renderCtx)); wall.name = "visual_cottage_wall_mass"; wall.position.y = h / 2; group.add(wall);
  const roof = tileRows(w, d, h + 0.75, -d * 0.15, finite(op.roofColor, 0x9e3c25), renderCtx); roof.name = "visual_cottage_roof_left"; roof.rotation.x = -0.38;
  const roof2 = tileRows(w, d, h + 0.75, d * 0.15, finite(op.roofColor, 0x9e3c25), renderCtx); roof2.name = "visual_cottage_roof_right"; roof2.rotation.x = 0.38;
  group.add(roof, roof2); addFrontDetails(group, op, w, d, h, renderCtx);
  group.position.set(finite(op.position?.x), finite(op.position?.y), finite(op.position?.z)); group.rotation.y = finite(op.rotationY, 0); group.scale.setScalar(finite(op.scale, 1));
  Object.assign(group.userData ||= {}, { cottageGenerator:"awtsmoos3d", doorContractAligned:true, doorX:finite(op.doorX, 0) });
  return markDecorative(group);
}
