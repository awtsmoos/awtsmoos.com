// B"H
/**
 * @file treeCanopyRecipe.js
 * @description
 * Chapter 256: The canopy stopped being green silence.
 *
 * The Awtsmoos scatters leaf chambers with varied scale, rotation, and a leaf
 * texture mode. Each cheap icosphere keeps mobile speed, yet every crown now
 * carries veins, shade, and sun-flecked change instead of one flat color.
 */
import { add } from "./geometryKit.js";

const LEAF = [0x2f7d2f, 0x4f9b36, 0x77b94b, 0x245f25, 0x5f9f3a];

function leafMass(group, color, p, s, seed) {
  const rot = [seed * 0.17, seed * 0.31, seed * 0.11];
  const mesh = add(group, "icosphere", color, p, s, rot, { textureMode: "leaf" });
  mesh.name = `veined_leaf_mass_${seed}`;
  return mesh;
}

/**
 * Adds a clustered, rounded canopy around the trunk crown.
 *
 * @param {THREE.Group} group Tree group receiving leaf masses.
 * @returns {void}
 */
export function addDenseCanopy(group) {
  const rings = [
    { y: 5.85, r: 2.2, n: 10, sx: 1.18, sy: 0.78, sz: 1.0 },
    { y: 6.75, r: 2.85, n: 14, sx: 1.36, sy: 0.92, sz: 1.12 },
    { y: 7.62, r: 2.18, n: 11, sx: 1.28, sy: 0.82, sz: 1.04 },
    { y: 8.3, r: 1.08, n: 6, sx: 1.08, sy: 0.7, sz: 0.94 }
  ];
  rings.forEach((ring, ri) => {
    for (let i = 0; i < ring.n; i += 1) {
      const a = (Math.PI * 2 * i / ring.n) + ri * 0.31;
      const wobble = 0.78 + ((i * 37 + ri * 19) % 31) / 100;
      const x = Math.cos(a) * ring.r * wobble;
      const z = Math.sin(a) * ring.r * (0.82 + ri * 0.06);
      const y = ring.y + Math.sin(i * 1.7) * 0.28;
      leafMass(group, LEAF[(i + ri) % LEAF.length], [x, y, z], [ring.sx, ring.sy, ring.sz], i + ri * 23);
    }
  });
  leafMass(group, 0x3f8d32, [0, 7.05, 0.2], [2.05, 1.42, 1.78], 91);
  leafMass(group, 0x6fb446, [-0.65, 8.36, 0.1], [1.42, 0.86, 1.24], 127);
}
