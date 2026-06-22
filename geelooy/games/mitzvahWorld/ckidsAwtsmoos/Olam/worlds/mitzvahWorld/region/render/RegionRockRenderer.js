// B"H
/** @file RegionRockRenderer.js @description Highland stones emerge as grounded ecology-aware rock clusters. */
import { makeInstancedLayer } from "./RegionInstancer.js?v=awtsmoos-instancer-20260614-bh2";
import { rand } from "./RegionRandom.js";
import { budgetedQualityCount } from "./RegionQuality.js?v=awtsmoos-quality-20260614-bh2";
function reportRocks(report) { return report && report.instances && Array.isArray(report.instances.rocks) ? report.instances.rocks : []; }
function fallbackRock(i) { const side = i % 2 ? 1 : -1, x = side * (120 + rand(i,1) * 95), z = -105 + rand(i,2) * 220, big = rand(i,3) > .86; return { x, z, sx:big ? 2.6 : .7 + rand(i,4)*1.2, sy:big ? 1.25 : .35 + rand(i,5)*.55, sz:big ? 2.1 : .55 + rand(i,6), yaw:rand(i,7)*6.28, lift:.04, color:i % 3 ? 0x8d8a80 : 0xb0aa9a }; }
function specRock(spec, i) { const scale = Number(spec.scale || 1), big = rand(i,3) > .82; return { x:spec.x, z:spec.z, sx:big ? 2.4 : .65 + scale, sy:big ? 1.2 : .32 + scale * .35, sz:big ? 2.1 : .55 + scale, yaw:rand(i,7)*6.28, lift:.04, color:i % 2 ? 0x777a7e : 0xa09a8d }; }
export function buildRockRenderer(olam, report = {}) {
  const specs = reportRocks(report), count = Math.min(420, budgetedQualityCount(olam, specs.length ? Math.min(260, specs.length) : 320, "maxDistantActors", 420));
  return makeInstancedLayer({ olam, name:specs.length ? "living_region_ecology_highland_rocks" : "living_region_granite_slate_rocks", geometry:"rock", material:"graniteRock", count, simple:false, build:i => specs.length ? specRock(specs[i % specs.length], i) : fallbackRock(i) });
}
