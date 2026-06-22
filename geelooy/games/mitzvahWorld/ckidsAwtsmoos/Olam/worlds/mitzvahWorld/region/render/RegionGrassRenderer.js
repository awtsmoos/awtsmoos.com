// B"H
/** @file RegionGrassRenderer.js @description Mobile-safe grass avoids roads, houses, yards, and parcel gates. */
import * as THREE from "/games/scripts/build/three.module.js";
import { makeInstancedLayer } from "./RegionInstancer.js?v=awtsmoos-instancer-20260614-bh2";
import { rand } from "./RegionRandom.js";
import { sealRegionVisual } from "./RegionSeal.js";
import { budgetedQualityCount } from "./RegionQuality.js?v=awtsmoos-quality-20260614-bh2";
import { createProceduralCoreGrassField, advanceProceduralGrass } from "./ProceduralCoreGrassField.js?v=vivid-cheap-grass-20260621-bh1";
import { grassExclusionsFromReport, auditGrassExclusions } from "./RegionGrassExclusion.js";
function reportGrass(report) { return report && report.instances && Array.isArray(report.instances.grass) ? report.instances.grass : []; }
function farmCells(report) { const cells = report && report.ecology && Array.isArray(report.ecology.cells) ? report.ecology.cells : []; return cells.filter(cell => cell.biome === "farmBelt"); }
export function buildGrassRenderer(olam, report = {}) {
  const root = new THREE.Group(), specs = reportGrass(report), exclusions = grassExclusionsFromReport(report), audit = auditGrassExclusions(report);
  const count = Math.min(3600, budgetedQualityCount(olam, 3600, "grassDistance", 3600));
  const grass = createProceduralCoreGrassField(olam, specs, count, { exclusions });
  root.name = "living_region_mobile_safe_short_green_grass";
  root.add(grass);
  root.userData.tick = dt => advanceProceduralGrass(grass, dt);
  root.userData.stats = { ...grass.userData.stats, grassExclusionAudit:audit, complexGrainyGrass:false, mobileSafeGrass:true, blackSpikeSafe:true, onlyProceduralCoreGrass:true, avoidsCottages:true, avoidsYards:true };
  return sealRegionVisual(root, { complexGrainyGrass:false, mobileSafeGrass:true, blackSpikeSafe:true, proceduralCoreGrass:true, avoidsCottages:true, avoidsYards:true });
}
export function buildWheatRenderer(olam, report = {}) {
  const cells = farmCells(report), count = Math.min(1400, budgetedQualityCount(olam, Math.min(1400, Math.max(520, cells.length * 2)), "grassDistance", 1400));
  return makeInstancedLayer({ olam, name:"living_region_farm_wheat_field_dense_heads", geometry:"grassTuft", material:"straw", count, build:i => { const c = cells[i % Math.max(1, cells.length)] || { x:-145, z:-55 }; return { x:c.x + (rand(i,1)-.5)*6, z:c.z + (rand(i,2)-.5)*6, sx:.48, sy:1.55 + rand(i,6)*1.05, sz:.48, yaw:rand(i,7)*6.28, lift:.018, color:i%4 ? 0xd5bf62 : 0xf3db83 }; } });
}

