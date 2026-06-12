// B"H
/**
 * @file RegionRockRenderer.js
 * @description Chapter 991: highland stones now emerge from ecology cells.
 */
import { makeInstancedLayer } from "./RegionInstancer.js";
import { rand } from "./RegionRandom.js";
import { qualityCount } from "./RegionQuality.js?v=region-quality-20260612-bh1";

export function buildRockRenderer(olam, report = {}) {
  const specs = report.instances?.rocks || [];
  if (specs.length) return rocksFromSpecs(olam, specs);
  const count = qualityCount(olam, 520);
  return makeInstancedLayer({ olam, name: "living_region_granite_slate_rocks", geometry: "rock", material: "graniteRock", count, simple: false, build: i => fallbackRock(i) });
}

function rocksFromSpecs(olam, specs) {
  const count = qualityCount(olam, Math.min(320, specs.length));
  return makeInstancedLayer({ olam, name: "living_region_ecology_highland_rocks", geometry: "rock", material: "graniteRock", count, simple: false, build: i => {
    const s = specs[i % specs.length], big = rand(i, 3) > .82;
    return { x: s.x, z: s.z, sx: big ? 2.4 : .65 + s.scale, sy: big ? 1.2 : .32 + s.scale * .35, sz: big ? 2.1 : .55 + s.scale, yaw: rand(i, 7) * 6.28, lift: .04 };
  } });
}

function fallbackRock(i) {
  const side = i % 2 ? 1 : -1, x = side * (120 + rand(i, 1) * 95), z = -105 + rand(i, 2) * 220;
  const big = rand(i, 3) > .86;
  return { x, z, sx: big ? 2.6 : .7 + rand(i, 4) * 1.2, sy: big ? 1.25 : .35 + rand(i, 5) * .55, sz: big ? 2.1 : .55 + rand(i, 6) * 1, yaw: rand(i, 7) * 6.28, lift: .04 };
}
