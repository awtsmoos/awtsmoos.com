// B"H
/** @file RegionTreeRenderer.js @description Region forest delegates only to bbox-grounded procedural-core tree API. */
import * as THREE from "/games/scripts/build/three.module.js";
import { rand } from "./RegionRandom.js";
import { budgetedQualityCount } from "./RegionQuality.js?v=awtsmoos-quality-20260614-bh2";
import { sealRegionVisual } from "./RegionSeal.js";
import { buildAdvancedTree } from "./AdvancedTreeOnly.js?v=bbox-grounded-procedural-core-tree-20260615-bh1";
import { advanceProceduralTreeWind } from "../trees/ProceduralCoreTreeFactory.js?v=awtsmoos-tree-core-20260614-bh2";
function reportTrees(report) { return report && report.instances && Array.isArray(report.instances.trees) ? report.instances.trees : []; }
function fallbackSpecs(count) { return Array.from({ length:count }, (_, i) => { const a=i*2.399963, r=120+rand(i,1)*118; return { x:-70+Math.cos(a)*r, z:32+Math.sin(a)*r*.62, kind:i%7===0?"apple":i%5===0?"pine":"oak", age:i%11===0?"ancient":"mature" }; }); }
function optionsFromSpec(spec, index) { return { ...spec, name:`advanced_region_tree_${spec.kind || "oak"}_${index}`, rotationY:rand(index,10)*Math.PI*2, scale:spec.age === "ancient" ? 1.12 : .82 + rand(index,11)*.34 }; }
export function buildTreeRenderer(olam, report = {}) {
  const fromReport = reportTrees(report), specs = fromReport.length ? fromReport : fallbackSpecs(96), count = Math.min(budgetedQualityCount(olam, specs.length, "treeDistance", 44), 44);
  const root = new THREE.Group(); root.name = "living_region_procedural_core_tree_forest";
  for (let i=0; i<count; i++) root.add(buildAdvancedTree(olam, optionsFromSpec(specs[i % specs.length], i), i));
  root.userData.tick = dt => advanceProceduralTreeWind(root, dt);
  root.userData.stats = { trees:count, onlyApprovedTreeApi:true, bboxGroundedTrees:true, approvedSource:"/libs/awtsmoos-procedural-core/src/core", performanceBudget:"cached-procedural-tree-geometries" };
  return sealRegionVisual(root, { onlyApprovedTreeApi:true, proceduralCoreTrees:true, bboxGroundedTrees:true });
}
