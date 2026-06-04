// B"H
/**
 * @file pathRecipe.js
 * @description
 * Chapter 425: The path stops floating and starts remembering footsteps.
 *
 * A village road is not a tiled ruler. It is compacted dust, bruised grass,
 * half-buried stones, and little side tufts where the meadow tries to return.
 * This recipe stays decorative and cheap, but the silhouette becomes lived-in.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { add } from "./geometryKit.js";

const DIRT = 0x9f7042;
const DIRT_DARK = 0x6d4a2d;
const DIRT_LIGHT = 0xbc8750;
const STONE_A = 0xb8aa8a;
const STONE_B = 0xd1c39f;
const GRASS_EDGE = 0x4d8c3c;

/**
 * Deterministic ripple number for path scatter.
 *
 * @param {number} seed Numeric seed.
 * @returns {number} Value between 0 and 1.
 */
function pulse(seed) {
  const x = Math.sin(seed * 91.17 + 13.31) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Adds a cuboid path tile.
 *
 * @param {THREE.Group} group Destination group.
 * @param {number} color Material color.
 * @param {number[]} position Local position.
 * @param {number[]} scale Local scale.
 * @param {number} yaw Local yaw.
 * @returns {THREE.Mesh} Added mesh.
 */
function tile(group, color, position, scale, yaw = 0) {
  return add(group, "cube", color, position, scale, [0, yaw, 0], { textureMode: color === GRASS_EDGE ? "leaf" : color === STONE_A || color === STONE_B ? "rock" : "floor" });
}

/**
 * Builds an irregular dirt-and-stone village path.
 *
 * @returns {THREE.Group} Decorative path group.
 */
export function pictureDirtPath() {
  const group = new THREE.Group();

  for (let i = 0; i < 34; i += 1) {
    const t = i / 33;
    const z = -16.5 + t * 33.0;
    const curve = Math.sin(t * Math.PI * 1.12) * 2.7;
    const yaw = curve * 0.025 + Math.sin(i * 0.7) * 0.035;
    const width = 3.75 - Math.abs(t - 0.5) * 0.86 + pulse(i) * 0.35;
    tile(group, i % 3 ? DIRT : DIRT_DARK, [curve, -0.102, z], [width, 0.034, 1.08], yaw);
    if (i % 2 === 0) tile(group, DIRT_LIGHT, [curve + (pulse(i + 4) - 0.5) * width * 0.55, -0.096, z + 0.2], [0.72, 0.018, 0.28], yaw + 0.2);
  }

  for (let i = 0; i < 58; i += 1) {
    const t = i / 57;
    const z = -15.7 + t * 31.4;
    const curve = Math.sin(t * Math.PI * 1.14) * 2.55;
    const offset = (pulse(i + 9) - 0.5) * 1.85;
    if (pulse(i + 20) > 0.22) {
      tile(group, i % 2 ? STONE_A : STONE_B, [curve + offset, -0.058, z], [0.38 + pulse(i) * 0.42, 0.04, 0.28 + pulse(i + 1) * 0.24], curve * 0.04 + i * 0.17);
    }
  }

  for (let i = 0; i < 22; i += 1) {
    const side = i % 2 ? -1 : 1;
    const t = pulse(i + 33);
    const z = -15 + t * 30;
    const curve = Math.sin(t * Math.PI * 1.1) * 2.55;
    tile(group, GRASS_EDGE, [curve + side * (1.9 + pulse(i) * 0.7), -0.054, z], [0.08, 0.18 + pulse(i + 1) * 0.22, 0.08], pulse(i + 2) * Math.PI);
  }

  return group;
}

