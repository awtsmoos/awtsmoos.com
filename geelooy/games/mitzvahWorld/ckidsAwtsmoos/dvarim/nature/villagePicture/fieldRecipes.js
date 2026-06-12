// B"H
/**
 * @file fieldRecipes.js
 * @description
 * Chapter 104: the empty green carpet receives little witnesses. Grass clumps,
 * flower knots, and low stones are scattered in deliberate clusters, like the
 * picture, but remain only visual breath and never collision weight.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { foliageBatch, setFoliageInstance } from "./FoliageAtlas.js";

const rand = value => { const x = Math.sin(value * 91.173) * 43758.5453; return x - Math.floor(x); };

export function meadowDetail(options = {}) {
  const group = new THREE.Group();
  const clusters = options.clusters || [[-7, 8], [-3, 6], [5, -1], [8, -6], [-15, 7], [12, 2]];
  const placements = [];
  clusters.forEach(([x, z], c) => { for (let i = 0; i < 9; i += 1) placements.push({ x: x + Math.sin(i * 1.7 + c) * 1.35, z: z + Math.cos(i * 1.3 + c) * 1.05, seed: c * 20 + i }); });
  for (let variant = 0; variant < 4; variant += 1) {
    const rows = placements.filter((_, index) => index % 4 === variant);
    const mesh = foliageBatch({ file: "grass-atlas.png", cell: variant, count: rows.length, planes: 2, wind: 0.035, alphaTest: 0.3, name: `meadow_grass_atlas_${variant}` });
    rows.forEach((p, index) => { const size = 0.58 + rand(p.seed) * 0.36; setFoliageInstance(mesh, index, new THREE.Vector3(p.x, 0.01, p.z), new THREE.Euler(0, rand(p.seed + 4) * Math.PI, 0), new THREE.Vector3(size * 0.78, size, size * 0.78)); });
    mesh.instanceMatrix.needsUpdate = true; mesh.computeBoundingSphere?.(); group.add(mesh);
  }
  return group;
}
