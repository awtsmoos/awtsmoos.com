// B"H
/**
 * @file treeCanopyRecipe.js
 * @description
 * Chapter 106: the canopy stops being a handful of shapes and becomes a cloud
 * of green chambers. The Awtsmoos packs many cheap icosphere leaf masses into a
 * rounded crown, dense from afar, finite up close, and still forbidden from
 * collision, raycast, and octree.
 */
import { add } from "./geometryKit.js";

const LEAF = [0x2f7d2f, 0x4f9b36, 0x77b94b, 0x245f25];

/**
 * Adds a clustered, rounded canopy around the trunk crown.
 *
 * @param {THREE.Group} group
 * Tree group.
 *
 * @returns {void}
 */
export function addDenseCanopy(group) {
  const rings = [
    { y: 5.9, r: 2.25, n: 10, sx: 1.25, sy: 0.85, sz: 1.05 },
    { y: 6.85, r: 2.95, n: 14, sx: 1.45, sy: 1.0, sz: 1.18 },
    { y: 7.75, r: 2.25, n: 11, sx: 1.35, sy: 0.88, sz: 1.1 },
    { y: 8.45, r: 1.15, n: 6, sx: 1.15, sy: 0.75, sz: 1.0 }
  ];
  rings.forEach((ring, ri) => {
    for (let i = 0; i < ring.n; i += 1) {
      const a = (Math.PI * 2 * i / ring.n) + ri * 0.31;
      const wobble = 0.78 + ((i * 37 + ri * 19) % 31) / 100;
      const x = Math.cos(a) * ring.r * wobble;
      const z = Math.sin(a) * ring.r * (0.82 + ri * 0.06);
      const y = ring.y + Math.sin(i * 1.7) * 0.28;
      add(group, "icosphere", LEAF[(i + ri) % LEAF.length], [x, y, z], [ring.sx, ring.sy, ring.sz]);
    }
  });
  add(group, "icosphere", 0x3f8d32, [0, 7.15, 0.2], [2.2, 1.55, 1.9]);
  add(group, "icosphere", 0x6fb446, [-0.65, 8.55, 0.1], [1.55, 0.95, 1.35]);
}
