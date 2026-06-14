// B"H
/**
 * @file RegionGrassRenderer.js
 * @description
 * Chapter 992: the grass now knows road, square, orchard, grove, and wilderness.
 * The Awtsmoos teaches every blade where it stands; road edges are trampled,
 * squares are sparse, groves are tall, orchards are tender, and wild fields roar.
 */
import { makeInstancedLayer } from "./RegionInstancer.js";
import { rand } from "./RegionRandom.js";
import { qualityCount } from "./RegionQuality.js?v=region-quality-20260612-bh1";
import { ecologyKind, roadMask } from "../../postbuild/VillagePolishGround.js?v=polish-ground-20260614-bh1";

export function buildGrassRenderer(olam, report = {}) {
  const specs = report.instances?.grass || [];
  if (specs.length) return grassFromSpecs(olam, specs);
  const count = qualityCount(olam, 9800);
  return makeInstancedLayer({ olam, name: "living_region_ecology_aware_grass_blades", geometry: "blade", material: "grass", count, build: i => ecologyGrass(spiralPoint(i, count), i) });
}
export function buildWheatRenderer(olam, report = {}) {
  const farmCells = (report.ecology?.cells || []).filter(c => c.biome === "farmBelt");
  const count = qualityCount(olam, Math.min(4400, Math.max(1400, farmCells.length * 3)));
  return makeInstancedLayer({ olam, name: "living_region_farm_wheat_field_dense_heads", geometry: "blade", material: "straw", count, build: i => {
    const c = farmCells[i % Math.max(1, farmCells.length)] || { x: -145, z: -55 };
    return { x: c.x + (rand(i, 1) - .5) * 6, z: c.z + (rand(i, 2) - .5) * 6, sx: .42, sy: 1.35 + rand(i, 6) * .95, sz: .42, yaw: rand(i, 7) * 6.28, lift: .018, color: i % 4 ? 0xd5bf62 : 0xf3db83 };
  } });
}
function grassFromSpecs(olam, specs) {
  const count = qualityCount(olam, Math.min(11200, Math.max(specs.length * 2, specs.length + 1800)));
  return makeInstancedLayer({ olam, name: "living_region_ecology_grass_blades_road_cleared", geometry: "blade", material: "grass", count, build: i => {
    const s = specs[i % specs.length], jitter = i >= specs.length ? 1.8 : .25;
    return ecologyGrass({ x: s.x + (rand(i, 10) - .5) * jitter, z: s.z + (rand(i, 11) - .5) * jitter, scale: s.scale || 1, a: i * 2.399 }, i);
  } });
}
function ecologyGrass(p, i) {
  const kind = ecologyKind(p.x, p.z), road = roadMask(p.x, p.z, 9);
  const sparse = kind === "village-square" ? .42 : kind === "trampled-road-edge" ? .28 : 1;
  const tall = kind === "sacred-grove" ? 1.75 : kind === "orchard" ? 1.18 : kind === "wild" ? 1.35 : .62;
  return { x: p.x, z: p.z, sx: (.38 + rand(i, 4) * .48) * sparse, sy: (.48 + rand(i, 5) * 1.35) * tall * (1-road*.55), sz: .42 * sparse, yaw: p.a + rand(i, 6) * 1.2, lift: .016, color: kind === "sacred-grove" ? 0x4fa34c : kind === "orchard" ? 0x86d86c : kind === "trampled-road-edge" ? 0x9d9457 : 0x65c457 };
}
function spiralPoint(i, count) { const ring = Math.sqrt(i / count) * 225, a = i * 2.399963; return { x: Math.cos(a) * ring + (rand(i, 2) - .5) * 13, z: Math.sin(a) * ring * .64 + (rand(i, 3) - .5) * 13, scale: 1, a }; }
