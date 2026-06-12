// B"H
/** @file RegionGrassRenderer.js @description Dense instanced grass and wheat blades with quality-aware counts. */
import { makeInstancedLayer } from "./RegionInstancer.js";
import { rand } from "./RegionRandom.js";
import { qualityCount } from "./RegionQuality.js?v=region-quality-20260612-bh1";
export function buildGrassRenderer(olam) {
  const count = qualityCount(olam, 5200);
  return makeInstancedLayer({ olam, name: "living_region_dense_grass_blades", geometry: "blade", material: "grass", count, build: i => { const ring = Math.sqrt(i / count) * 210, a = i * 2.399963; const x = Math.cos(a) * ring + (rand(i, 2) - .5) * 10, z = Math.sin(a) * ring * .62 + (rand(i, 3) - .5) * 10; return { x, z, sx: .45 + rand(i, 4) * .45, sy: .55 + rand(i, 5) * 1.4, sz: .45, yaw: a, lift: .02 }; } });
}
export function buildWheatRenderer(olam) {
  const count = qualityCount(olam, 2800);
  return makeInstancedLayer({ olam, name: "living_region_farm_wheat_field", geometry: "blade", material: "straw", count, build: i => { const row = i % 70, col = Math.floor(i / 70); return { x: -165 + row * 1.05 + (rand(i, 1) - .5) * .25, z: -64 + col * 1.25 + (rand(i, 2) - .5) * .4, sx: .35, sy: 1.25 + rand(i, 6) * .55, sz: .35, yaw: rand(i, 7) * 6.28, lift: .02 }; } });
}
