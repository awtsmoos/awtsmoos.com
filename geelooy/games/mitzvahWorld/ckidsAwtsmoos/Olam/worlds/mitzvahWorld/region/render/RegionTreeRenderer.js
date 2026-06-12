// B"H
/** @file RegionTreeRenderer.js @description Instanced forest/orchard trunks and canopies with quality-aware counts. */
import * as THREE from "/games/scripts/build/three.module.js";
import { makeInstancedLayer } from "./RegionInstancer.js";
import { rand } from "./RegionRandom.js";
import { sealRegionVisual } from "./RegionSeal.js";
import { qualityCount } from "./RegionQuality.js?v=region-quality-20260612-bh1";
export function buildTreeRenderer(olam) {
  const root = new THREE.Group(); root.name = "living_region_forest_and_orchard_trees"; const count = qualityCount(olam, 620);
  const spec = i => { const forest = i < count * .68; const a = i * 2.399, r = forest ? 150 + rand(i, 1) * 80 : 80 + rand(i, 2) * 50; const x = forest ? -90 + Math.cos(a) * r : 105 + (i % 24) * 4.6; const z = forest ? 45 + Math.sin(a) * r * .55 : 35 + Math.floor(i / 24) * 7.2; const h = forest ? 5 + rand(i, 3) * 7 : 3 + rand(i, 4) * 3; return { x, z, h, a }; };
  root.add(makeInstancedLayer({ olam, name: "instanced_tree_trunks", geometry: "trunk", material: "barkOak", count, build: i => { const s = spec(i); return { x: s.x, z: s.z, sx: .35 + s.h * .045, sy: s.h, sz: .35 + s.h * .045, yaw: s.a, lift: 0 }; } }));
  root.add(makeInstancedLayer({ olam, name: "instanced_tree_canopies", geometry: "canopy", material: "leaf", count, build: i => { const s = spec(i); return { x: s.x, z: s.z, sx: 2.5 + s.h * .35, sy: 1.8 + s.h * .18, sz: 2.5 + s.h * .35, yaw: s.a, lift: s.h }; } }));
  root.userData.stats = { trees: count }; return sealRegionVisual(root);
}
