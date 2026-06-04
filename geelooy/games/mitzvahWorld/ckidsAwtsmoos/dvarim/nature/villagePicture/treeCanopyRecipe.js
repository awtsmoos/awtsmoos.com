// B"H
/**
 * @file treeCanopyRecipe.js
 * @description
 * Chapter 101: The tree crown becomes layered instead of a green block.
 * The Awtsmoos scatters many small veined leaf clusters with openings, shadow
 * pockets, and sun flecks. It remains cheap mobile geometry, but the silhouette
 * reads like a living crown instead of one solid plane.
 */
import { add } from "./geometryKit.js";

const LEAF = [0x2f7d2f, 0x438e35, 0x68a943, 0x7fbd52, 0x245f25, 0x5f9f3a];
const GOLD = [0x8bc65a, 0x77b94b, 0x93ca60];
const pulse = seed => { const x = Math.sin(seed * 91.17 + 13.31) * 43758.5453; return x - Math.floor(x); };

function leafMass(group, color, p, s, seed) {
  const rot = [seed * 0.19, seed * 0.33, seed * 0.13];
  const mesh = add(group, "icosphere", color, p, s, rot, { textureMode: "leaf" });
  mesh.name = `veined_leaf_pocket_${seed}`;
  return mesh;
}

function ring(group, cfg, ri) {
  for (let i = 0; i < cfg.n; i += 1) {
    if (pulse(i + ri * 47) < cfg.gap) continue;
    const a = Math.PI * 2 * i / cfg.n + cfg.twist;
    const wobble = 0.72 + pulse(i + ri * 31) * 0.42;
    const x = Math.cos(a) * cfg.r * wobble;
    const z = Math.sin(a) * cfg.r * (0.72 + pulse(i + 9) * 0.22);
    const y = cfg.y + Math.sin(i * 1.7 + ri) * cfg.wave;
    const color = pulse(i + ri * 13) > 0.72 ? GOLD[i % GOLD.length] : LEAF[(i + ri) % LEAF.length];
    leafMass(group, color, [x, y, z], [cfg.sx * (0.82 + pulse(i) * 0.42), cfg.sy, cfg.sz * (0.84 + pulse(i + 2) * 0.32)], i + ri * 29);
  }
}

/** @param {THREE.Group} group */
export function addDenseCanopy(group) {
  [
    { y: 5.72, r: 2.15, n: 14, sx: 1.0, sy: 0.62, sz: 0.88, wave: 0.22, twist: 0.0, gap: 0.1 },
    { y: 6.34, r: 2.95, n: 18, sx: 1.12, sy: 0.68, sz: 0.94, wave: 0.34, twist: 0.24, gap: 0.06 },
    { y: 7.06, r: 3.25, n: 20, sx: 1.2, sy: 0.74, sz: 1.0, wave: 0.3, twist: 0.49, gap: 0.12 },
    { y: 7.78, r: 2.45, n: 15, sx: 1.04, sy: 0.62, sz: 0.86, wave: 0.26, twist: 0.13, gap: 0.08 },
    { y: 8.38, r: 1.25, n: 8, sx: 0.92, sy: 0.54, sz: 0.78, wave: 0.18, twist: 0.65, gap: 0.05 }
  ].forEach(ring);
  leafMass(group, 0x5fa83a, [0.15, 7.18, 0.08], [1.58, 1.0, 1.36], 199);
  leafMass(group, 0x88c65a, [-0.55, 8.58, 0.18], [1.18, 0.72, 1.04], 231);
}
