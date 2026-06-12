// B"H
/** @file RegionBushRenderer.js @description Shrubs and cabbage-like leaf clusters with density law. */
import { makeInstancedLayer } from "./RegionInstancer.js";
import { rand } from "./RegionRandom.js";
import { qualityCount } from "./RegionQuality.js?v=region-quality-20260612-bh1";
export function buildBushRenderer(olam) {
  const count = qualityCount(olam, 640);
  return makeInstancedLayer({ olam, name: "living_region_bush_and_shrub_clusters", geometry: "canopy", material: "cabbageLeaf", count, build: i => { const a = i * 1.71, radius = 72 + rand(i, 2) * 130; return { x: Math.cos(a) * radius + (rand(i, 3) - .5) * 22, z: Math.sin(a) * radius * .7 + (rand(i, 4) - .5) * 18, sx: .9 + rand(i, 5) * 1.5, sy: .45 + rand(i, 6) * .9, sz: .9 + rand(i, 7) * 1.5, yaw: a, lift: .08 }; } });
}
