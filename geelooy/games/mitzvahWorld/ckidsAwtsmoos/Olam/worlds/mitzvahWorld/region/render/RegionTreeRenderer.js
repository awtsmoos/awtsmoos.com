// B"H
/**
 * @file RegionTreeRenderer.js
 * @description
 * Region trees now route through the approved Awtsmoos procedural-core gateway
 * for the visible forest, instead of the cheap chunky placeholder canopies.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { rand } from "./RegionRandom.js";
import { budgetedQualityCount } from "./RegionQuality.js?v=awtsmoos-quality-20260614-bh2";
import { sealRegionVisual } from "./RegionSeal.js";
import { buildAdvancedTree, approvedTreeStats } from "./AdvancedTreeOnly.js?v=exclusive-procedural-core-tree-20260614-bh4";

const ANCHORS = Object.freeze([
  [18, 28, "olive", "mature"],
  [-34, 42, "oak", "mature"],
  [46, -18, "apple", "mature"],
  [-62, -24, "oak", "ancient"],
  [84, 64, "pine", "mature"],
  [118, 86, "oak", "mature"],
  [-96, 18, "apple", "mature"],
  [22, 96, "willow", "mature"],
  [-128, 72, "oak", "ancient"],
  [146, 26, "pine", "mature"],
  [72, -72, "apple", "mature"],
  [-42, -86, "olive", "mature"]
]);

function reportTrees(report) {
  return report?.instances && Array.isArray(report.instances.trees) ? report.instances.trees : [];
}

function fallback(count) {
  return Array.from({ length: count }, (_, index) => {
    const angle = index * 2.399963;
    const radius = 48 + Math.sqrt(rand(index, 1)) * 260;
    return {
      x: -25 + Math.cos(angle) * radius,
      z: 32 + Math.sin(angle) * radius * 0.72,
      kind: index % 7 === 0 ? "apple" : index % 5 === 0 ? "pine" : "oak",
      age: index % 13 === 0 ? "ancient" : "mature"
    };
  });
}

function specs(report) {
  const anchored = ANCHORS.map((anchor, index) => ({
    x: anchor[0],
    z: anchor[1],
    kind: anchor[2],
    age: anchor[3],
    name: `starter_procedural_core_tree_${index}`,
    starterAnchor: true
  }));
  return [...anchored, ...(reportTrees(report).length ? reportTrees(report) : fallback(160))];
}

function optionsFor(source, index) {
  return {
    ...source,
    name: source.name || `procedural_core_region_tree_${index}`,
    x: Number(source.x) || 0,
    z: Number(source.z) || 0,
    kind: source.kind || source.species || "oak",
    age: source.age || "mature",
    rotationY: rand(index, 9) * Math.PI * 2,
    scale: source.age === "ancient" ? 1.18 : 0.78 + rand(index, 10) * 0.36,
    groundLift: 0.01
  };
}

function addTree(root, olam, source, index) {
  const tree = buildAdvancedTree(olam, optionsFor(source, index), index);
  tree.userData.regionProceduralCoreTree = true;
  tree.userData.skipRaycast = true;
  root.add(tree);
  return tree;
}

export function buildTreeRenderer(olam, report = {}) {
  const all = specs(report);
  const count = Math.min(96, Math.max(42, budgetedQualityCount(olam, 72, "treeDistance", 72)));
  const root = new THREE.Group();
  root.name = "living_region_procedural_core_tree_forest";
  for (let index = 0; index < count; index++) addTree(root, olam, all[index % all.length], index);
  const audit = approvedTreeStats(root);
  root.userData.colliderSources = [];
  root.userData.stats = {
    trees: count,
    nearTrees: count,
    approvedProceduralCoreTrees: audit.approvedTreeObjects,
    drawCallsEstimate: count * 2,
    lodForest: false,
    proceduralCoreForest: true,
    colliderSources: 0
  };
  return sealRegionVisual(root, {
    proceduralCoreForest: true,
    onlyApprovedTreeSource: true,
    manyTrees: true,
    bboxGroundedTrees: true
  });
}

export default buildTreeRenderer;
