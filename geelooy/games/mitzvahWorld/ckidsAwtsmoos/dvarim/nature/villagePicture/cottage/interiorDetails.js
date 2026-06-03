// B"H
/**
 * @file interiorDetails.js
 * @description
 * Chapter 230: The house stays large, but the table bows to human scale.
 * The Awtsmoos gives a broad interior yet keeps furniture modest: table below a
 * person, stool low, bed human-sized. Rugs and lamps remain decorative only.
 */
import { add, light } from "../geometryKit.js";

const cube = (g, color, p, s, r = [0, 0, 0], mode = "wood", extra = {}) => add(g, "cube", color, p, s, r, { textureMode: mode, ...extra });

function rugAndLantern(g) {
  cube(g, 0x8c2c24, [-0.55, 0.095, 0.48], [1.25, 0.018, 0.78], [0, 0.08, 0], "cloth");
  cube(g, 0xd8a33e, [-0.55, 0.11, 0.48], [0.94, 0.012, 0.5], [0, 0.08, 0], "cloth");
  cube(g, 0x4a2a16, [0.85, 1.3, -1.9], [0.045, 0.16, 0.045]);
  cube(g, 0xffd98a, [0.85, 1.13, -1.9], [0.09, 0.12, 0.09], [0, 0, 0], "cloth", { emissive: 0xffd98a, emissiveIntensity: 0.65 });
  light(g, 0xffd98a, [0.85, 1.24, -1.9], 0.5, 4.8);
}

function tableAndLight(g) {
  cube(g, 0x80502a, [0.35, 0.23, -0.55], [0.46, 0.06, 0.32], [0, 0.05, 0]);
  for (const x of [0.19, 0.51]) for (const z of [-0.69, -0.41]) cube(g, 0x5b351d, [x, 0.105, z], [0.035, 0.22, 0.035]);
  cube(g, 0xffdd88, [0.43, 0.36, -0.61], [0.035, 0.08, 0.035], [0, 0, 0], "cloth", { emissive: 0xffc45c, emissiveIntensity: 0.55 });
  light(g, 0xffd98a, [0.43, 0.51, -0.61], 0.42, 4.2);
}

function storageAndPlant(g) {
  cube(g, 0x4b2b17, [-2.55, 0.45, 0.2], [0.2, 0.72, 0.44]);
  for (let i = 0; i < 4; i += 1) cube(g, [0x6d3b2a, 0x2c67aa, 0xaa362c, 0xd6a536][i], [-2.42, 0.24 + i * 0.12, 0.2], [0.04, 0.085, 0.32], [0, 0, 0], "cloth");
  cube(g, 0x70451f, [-1.25, 0.28, -1.35], [0.38, 0.4, 0.24]);
  cube(g, 0xaa6a32, [-1.25, 0.54, -1.35], [0.13, 0.11, 0.13], [0, 0, 0], "stone");
  for (const r of [-0.6, 0, 0.6]) cube(g, 0x2f9b4f, [-1.25, 0.76, -1.35], [0.05, 0.2, 0.03], [0, r, 0.7], "cloth");
}

function bedChestStool(g) {
  cube(g, 0x70451f, [2.15, 0.18, 0.7], [0.52, 0.14, 0.38]);
  cube(g, 0xf0e3b0, [2.15, 0.3, 0.7], [0.44, 0.07, 0.3], [0, 0, 0], "cloth");
  cube(g, 0xffffff, [2.33, 0.37, 0.6], [0.14, 0.045, 0.18], [0, 0, 0], "cloth");
  cube(g, 0x6b3b1b, [1.25, 0.18, 1.1], [0.32, 0.22, 0.22], [0, 0.2, 0]);
  cube(g, 0x6a3c1c, [-0.55, 0.115, -0.46], [0.16, 0.16, 0.16], [0, 0.15, 0]);
}

/** @param {THREE.Group} group visual cottage group. */
export function buildInteriorDetails(group) {
  cube(group, 0xb89b64, [0, 0.02, -0.1], [6.25, 0.04, 4.15], [0, 0, 0], "floor");
  rugAndLantern(group); tableAndLight(group); storageAndPlant(group); bedChestStool(group);
}
