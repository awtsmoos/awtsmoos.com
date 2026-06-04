// B"H
/**
 * @file pathRecipe.js
 * @description
 * Chapter 103: The road becomes a readable village road.
 * It is still decorative and grounded by the village pass, but now has a broad
 * compacted dirt bed, layered cobbles, edge grass, and varied stones. Collision
 * belongs to VillageRoadCollider, keeping visuals beautiful and physics simple.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { add } from "./geometryKit.js";

const DIRT = 0x9f7042, DARK = 0x6d4a2d, LIGHT = 0xbc8750;
const STONE = [0xb8aa8a, 0xd1c39f, 0x9f9477, 0xc8bd9d];
const EDGE = [0x4d8c3c, 0x6aa84a, 0x3c7f32];
const pulse = seed => { const x = Math.sin(seed * 91.17 + 13.31) * 43758.5453; return x - Math.floor(x); };

function curve(t) { return Math.sin(t * Math.PI * 1.12) * 2.7 + Math.sin(t * Math.PI * 2.1) * 0.42; }
function tile(group, color, position, scale, yaw = 0, mode = "floor") {
  return add(group, "cube", color, position, scale, [0, yaw, 0], { textureMode: mode });
}
function dirtBed(group) {
  for (let i = 0; i < 38; i += 1) {
    const t = i / 37, z = -17.5 + t * 35, x = curve(t), yaw = x * 0.026 + Math.sin(i * 0.7) * 0.035;
    const w = 4.25 - Math.abs(t - 0.5) * 0.7 + pulse(i) * 0.34;
    tile(group, i % 3 ? DIRT : DARK, [x, -0.108, z], [w, 0.034, 1.15], yaw);
    if (i % 2 === 0) tile(group, LIGHT, [x + (pulse(i + 4) - 0.5) * w * 0.58, -0.093, z + 0.14], [0.82, 0.018, 0.3], yaw + 0.24);
  }
}
function stones(group) {
  for (let i = 0; i < 88; i += 1) {
    const t = i / 87, z = -16.7 + t * 33.4, x = curve(t), off = (pulse(i + 9) - 0.5) * 2.6;
    if (pulse(i + 20) < 0.16) continue;
    tile(group, STONE[i % STONE.length], [x + off, -0.052, z], [0.34 + pulse(i) * 0.48, 0.045, 0.26 + pulse(i + 1) * 0.28], x * 0.045 + i * 0.19, "rock");
  }
}
function edges(group) {
  for (let i = 0; i < 38; i += 1) {
    const side = i % 2 ? -1 : 1, t = pulse(i + 33), z = -16 + t * 32, x = curve(t);
    tile(group, EDGE[i % EDGE.length], [x + side * (2.1 + pulse(i) * 0.82), -0.052, z], [0.08, 0.2 + pulse(i + 1) * 0.3, 0.08], pulse(i + 2) * Math.PI, "leaf");
  }
}

export function pictureDirtPath() {
  const group = new THREE.Group();
  group.name = "pictureDirtPath_grounded_rich_collidable_partner";
  dirtBed(group);
  stones(group);
  edges(group);
  Object.assign(group.userData ||= {}, { suggestedRoadCollider: { width: 4.6, length: 35, height: 0.18 } });
  return group;
}
