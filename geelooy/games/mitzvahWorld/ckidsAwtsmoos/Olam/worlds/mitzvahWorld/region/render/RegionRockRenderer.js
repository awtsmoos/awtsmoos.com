// B"H
/** @file RegionRockRenderer.js @description Rock fields, moss stones, and hard-collider candidates with density law. */
import { makeInstancedLayer } from "./RegionInstancer.js";
import { rand } from "./RegionRandom.js";
import { qualityCount } from "./RegionQuality.js?v=region-quality-20260612-bh1";
export function buildRockRenderer(olam) {
  const count = qualityCount(olam, 520);
  return makeInstancedLayer({ olam, name: "living_region_granite_slate_rocks", geometry: "rock", material: "graniteRock", count, simple: false, build: i => { const side = i % 2 ? 1 : -1, x = side * (120 + rand(i, 1) * 95), z = -105 + rand(i, 2) * 220; const big = rand(i, 3) > .86; return { x, z, sx: big ? 2.6 : .7 + rand(i, 4) * 1.2, sy: big ? 1.25 : .35 + rand(i, 5) * .55, sz: big ? 2.1 : .55 + rand(i, 6) * 1, yaw: rand(i, 7) * 6.28, lift: .04 }; } });
}
