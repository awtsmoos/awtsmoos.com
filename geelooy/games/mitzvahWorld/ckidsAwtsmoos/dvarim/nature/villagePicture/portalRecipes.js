// B"H
/**
 * @file portalRecipes.js
 * @description
 * Chapter 102: the lantern and pergola glow like the picture. The Awtsmoos
 * separates sacred green gate-light from warm human window-light.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { add, light } from "./geometryKit.js";
import { PICTURE_COLORS as C } from "./palette.js";

export function lantern() {
  const group = new THREE.Group();
  add(group, "cube", C.darkWood, [0, 1.37, 0], [0.14, 2.74, 0.14]);
  add(group, "cube", C.darkWood, [0.3, 2.78, 0], [0.92, 0.13, 0.13]);
  add(group, "cube", C.warm, [0.68, 2.38, 0], [0.36, 0.52, 0.36], [0, 0, 0], { emissive: C.warm, emissiveIntensity: 0.35 });
  light(group, C.warm, [0.68, 2.38, 0], 1.05, 8);
  return group;
}

export function pergolaPortal() {
  const group = new THREE.Group();
  [-1.65, 1.65].forEach(x => [-0.92, 0.92].forEach(z => add(group, "cube", C.wood, [x, 1.16, z], [0.16, 2.32, 0.16])));
  add(group, "cube", C.wood, [0, 2.42, -0.92], [3.9, 0.16, 0.16]);
  add(group, "cube", C.wood, [0, 2.42, 0.92], [3.9, 0.16, 0.16]);
  for (let i = -2; i <= 2; i += 1) add(group, "cube", C.leafVine, [i * 0.8, 2.66, 0], [0.12, 0.12, 2.2]);
  add(group, "cube", C.portal, [0, 1.0, 0.03], [0.56, 1.55, 0.16], [0, 0, 0], { emissive: C.portal, emissiveIntensity: 0.48 });
  light(group, C.portal, [0, 1.1, 0.45], 1.25, 7);
  return group;
}
