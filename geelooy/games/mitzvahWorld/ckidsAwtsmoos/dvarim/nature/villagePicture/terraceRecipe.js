// B"H
/**
 * @file terraceRecipe.js
 * @description
 * Chapter 107: the pale slab becomes a retaining wall. The Awtsmoos stacks
 * uneven stones, steps, and coping blocks like the picture, yet every block is
 * visual only and never joins the collision furnace.
 */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { add } from "./geometryKit.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { PICTURE_COLORS as C } from "./palette.js?compact=true&v=full-chain-cache-bust-20260708-bh10";

const STONES = [C.stone, 0xd2c3a1, 0x9f927d, C.stoneDark];

export function pictureTerraceWall() {
  const group = new THREE.Group();
  add(group, "cube", 0xcfc3a5, [0, 0.14, -1.5], [18.5, 0.28, 7.8]);
  for (let row = 0; row < 4; row += 1) {
    for (let i = 0; i < 18; i += 1) {
      const x = -8.5 + i * 1.0 + (row % 2 ? 0.35 : 0);
      const y = -0.18 + row * 0.22;
      add(group, "cube", STONES[(i + row) % STONES.length], [x, y, 2.55], [0.85, 0.19, 0.28]);
    }
  }
  for (let i = 0; i < 13; i += 1) add(group, "cube", 0xe1d2ae, [-8.4 + i * 1.4, 0.72, 2.63], [1.1, 0.16, 0.45]);
  return group;
}

export function pictureStoneSteps() {
  const group = new THREE.Group();
  for (let i = 0; i < 6; i += 1) {
    add(group, "cube", STONES[i % STONES.length], [0, i * 0.12, i * 0.48], [4.8 - i * 0.32, 0.15, 0.5]);
    add(group, "cube", 0x7f7668, [-2.55 + i * 0.15, i * 0.12, i * 0.48], [0.22, 0.16, 0.5]);
    add(group, "cube", 0x7f7668, [2.55 - i * 0.15, i * 0.12, i * 0.48], [0.22, 0.16, 0.5]);
  }
  return group;
}
