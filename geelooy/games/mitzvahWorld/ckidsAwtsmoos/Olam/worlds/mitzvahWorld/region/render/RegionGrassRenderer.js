// B"H
/**
 * @file RegionGrassRenderer.js
 * @description Chapter 988: grass now obeys ecology instances when the report speaks.
 */
import { makeInstancedLayer } from "./RegionInstancer.js";
import { rand } from "./RegionRandom.js";
import { qualityCount } from "./RegionQuality.js?v=region-quality-20260612-bh1";

export function buildGrassRenderer(olam, report = {}) {
  const specs = report.instances?.grass || [];
  if (specs.length) return grassFromSpecs(olam, specs);
  const count = qualityCount(olam, 5200);
  return makeInstancedLayer({ olam, name: "living_region_dense_grass_blades", geometry: "blade", material: "grass", count, build: i => spiralGrass(i, count) });
}

export function buildWheatRenderer(olam, report = {}) {
  const farmCells = (report.ecology?.cells || []).filter(c => c.biome === "farmBelt");
  const count = qualityCount(olam, Math.min(2800, Math.max(900, farmCells.length * 2)));
  return makeInstancedLayer({ olam, name: "living_region_farm_wheat_field", geometry: "blade", material: "straw", count, build: i => {
    const c = farmCells[i % farmCells.length] || { x: -145, z: -55 };
    return { x: c.x + (rand(i, 1) - .5) * 5, z: c.z + (rand(i, 2) - .5) * 5, sx: .35, sy: 1.15 + rand(i, 6) * .65, sz: .35, yaw: rand(i, 7) * 6.28, lift: .02 };
  } });
}

function grassFromSpecs(olam, specs) {
  const count = qualityCount(olam, Math.min(7200, specs.length));
  return makeInstancedLayer({ olam, name: "living_region_ecology_grass_blades", geometry: "blade", material: "grass", count, build: i => {
    const s = specs[i % specs.length];
    return { x: s.x, z: s.z, sx: .35 + s.scale * .2, sy: .55 + s.scale * 1.25, sz: .35, yaw: i * 2.399, lift: .02 };
  } });
}

function spiralGrass(i, count) {
  const ring = Math.sqrt(i / count) * 210, a = i * 2.399963;
  const x = Math.cos(a) * ring + (rand(i, 2) - .5) * 10;
  const z = Math.sin(a) * ring * .62 + (rand(i, 3) - .5) * 10;
  return { x, z, sx: .45 + rand(i, 4) * .45, sy: .55 + rand(i, 5) * 1.4, sz: .45, yaw: a, lift: .02 };
}
