// B"H
/**
 * @file RegionTreeRenderer.js
 * @description Chapter 1021: region forest delegates to the single approved tree API.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { rand } from "./RegionRandom.js";
import { qualityCount } from "./RegionQuality.js?v=region-quality-20260612-bh1";
import { sealRegionVisual } from "./RegionSeal.js";
import { buildAdvancedTree } from "./AdvancedTreeOnly.js?v=advanced-tree-only-20260614-bh1";
function fallbackSpecs(count) { return Array.from({ length: count }, (_, i) => { const a = i * 2.399963, r = 120 + rand(i, 1) * 118; return { x: -70 + Math.cos(a) * r, z: 32 + Math.sin(a) * r * .62, kind: i % 7 === 0 ? "apple" : i % 5 === 0 ? "pine" : "oak", age: i % 11 === 0 ? "ancient" : "mature" }; }); }
function optionsFromSpec(spec, index) { return { ...spec, name: `advanced_region_tree_${spec.kind || "oak"}_${index}`, rotationY: rand(index, 10) * Math.PI * 2, scale: spec.age === "ancient" ? 1.12 : .82 + rand(index, 11) * .34 }; }
export function buildTreeRenderer(olam, report = {}) { const specs = report.instances?.trees || fallbackSpecs(220); const count = Math.min(qualityCount(olam, specs.length), 140); const root = new THREE.Group(); root.name = "living_region_APPROVED_TREE_API_ONLY"; for (let i = 0; i < count; i++) root.add(buildAdvancedTree(olam, optionsFromSpec(specs[i % specs.length], i), i)); root.userData.stats = { trees: count, onlyApprovedTreeApi: true, approvedSource: "/libs/awtsmoos3d/tree/heroTree.js" }; return sealRegionVisual(root, { onlyApprovedTreeApi: true }); }
