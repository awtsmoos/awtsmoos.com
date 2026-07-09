// B"H
/**
 * @file portalRecipes.js
 * @description
 * Chapter 103: the lamps become visible again. The Awtsmoos gives every
 * lantern a brighter flame, a glowing glass box, and a wider halo so the
 * village can be read in dusk without swallowing the screen.
 */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { add, light } from "./geometryKit.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { PICTURE_COLORS as C } from "./palette.js?compact=true&v=full-chain-cache-bust-20260708-bh10";

export function lantern() {
  const group = new THREE.Group();
  add(group, "cube", C.darkWood, [0, 1.37, 0], [0.14, 2.74, 0.14]);
  add(group, "cube", C.darkWood, [0.32, 2.78, 0], [0.98, 0.14, 0.14]);
  add(group, "cube", C.darkWood, [0.72, 2.48, 0], [0.44, 0.08, 0.44]);
  add(group, "cube", C.warm, [0.72, 2.32, 0], [0.46, 0.58, 0.46], [0, 0, 0], { emissive: C.warm, emissiveIntensity: 1.45 });
  add(group, "cube", 0xfff0b0, [0.72, 2.32, 0], [0.22, 0.32, 0.22], [0, 0, 0], { emissive: 0xfff0b0, emissiveIntensity: 2.2 });
  light(group, C.warm, [0.72, 2.32, 0], 3.2, 14);
  return group;
}

export function pergolaPortal() {
  const group = new THREE.Group();
  [-1.65, 1.65].forEach(x => [-0.92, 0.92].forEach(z => add(group, "cube", C.wood, [x, 1.16, z], [0.16, 2.32, 0.16])));
  add(group, "cube", C.wood, [0, 2.42, -0.92], [3.9, 0.16, 0.16]);
  add(group, "cube", C.wood, [0, 2.42, 0.92], [3.9, 0.16, 0.16]);
  for (let i = -2; i <= 2; i += 1) add(group, "cube", C.leafVine, [i * 0.8, 2.66, 0], [0.12, 0.12, 2.2]);
  add(group, "cube", C.portal, [0, 1.0, 0.03], [0.56, 1.55, 0.16], [0, 0, 0], { emissive: C.portal, emissiveIntensity: 0.8 });
  light(group, C.portal, [0, 1.1, 0.45], 1.9, 9);
  return group;
}
