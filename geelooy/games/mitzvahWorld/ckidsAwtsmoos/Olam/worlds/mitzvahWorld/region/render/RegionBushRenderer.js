// B"H
/** @file RegionBushRenderer.js @description Shrubs grow as grounded organic clusters, quality-aware and texture-aware. */
import { makeInstancedLayer } from "./RegionInstancer.js?v=awtsmoos-instancer-20260614-bh2";
import { rand } from "./RegionRandom.js";
import { budgetedQualityCount } from "./RegionQuality.js?v=awtsmoos-quality-20260614-bh2";
function reportBushes(report) { return report && report.instances && Array.isArray(report.instances.bushes) ? report.instances.bushes : []; }
function bushSpec(i) {
  const a = i * 1.71, radius = 72 + rand(i, 2) * 130;
  return { x:Math.cos(a)*radius + (rand(i,3)-.5)*22, z:Math.sin(a)*radius*.7 + (rand(i,4)-.5)*18, sx:.9+rand(i,5)*1.5, sy:.45+rand(i,6)*.9, sz:.9+rand(i,7)*1.5, yaw:a, lift:.08, color:i % 4 ? 0x4f8f3d : 0x7faf4f };
}
function fromSpec(spec, i) { const base = bushSpec(i); base.x = Number.isFinite(Number(spec.x)) ? Number(spec.x) : base.x; base.z = Number.isFinite(Number(spec.z)) ? Number(spec.z) : base.z; return base; }
export function buildBushRenderer(olam, report = {}) {
  const specs = reportBushes(report);
  const count = Math.min(520, budgetedQualityCount(olam, specs.length ? Math.min(520, specs.length) : 360, "treeDistance", 520));
  return makeInstancedLayer({ olam, name:"living_region_grounded_bush_and_shrub_clusters", geometry:"canopy", material:"cabbageLeaf", count, build:i => specs.length ? fromSpec(specs[i % specs.length], i) : bushSpec(i) });
}
