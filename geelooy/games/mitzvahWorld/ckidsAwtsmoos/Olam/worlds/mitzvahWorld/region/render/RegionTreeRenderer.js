// B"H
/**
 * @file RegionTreeRenderer.js
 * @description Chapter 990: forests and orchards obey the instance genome.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { makeInstancedLayer } from "./RegionInstancer.js";
import { rand } from "./RegionRandom.js";
import { sealRegionVisual } from "./RegionSeal.js";
import { qualityCount } from "./RegionQuality.js?v=region-quality-20260612-bh1";

export function buildTreeRenderer(olam, report = {}) {
  const root = new THREE.Group(); root.name = "living_region_forest_and_orchard_trees";
  const specs = report.instances?.trees || [];
  specs.length ? addSpecTrees(root, olam, specs) : addFallbackTrees(root, olam);
  root.userData.stats = { trees: root.children[0]?.count || 0 };
  return sealRegionVisual(root);
}

function addSpecTrees(root, olam, specs) {
  const count = qualityCount(olam, Math.min(360, specs.length));
  root.add(makeInstancedLayer({ olam, name: "instanced_ecology_tree_trunks", geometry: "trunk", material: "barkOak", count, build: i => trunk(specs[i % specs.length], i) }));
  root.add(makeInstancedLayer({ olam, name: "instanced_ecology_tree_canopies", geometry: "canopy", material: "leaf", count, build: i => canopy(specs[i % specs.length], i) }));
}

function trunk(s, i) { const h = height(s, i); return { x: s.x, z: s.z, sx: .28 + h * .045, sy: h, sz: .28 + h * .045, yaw: i * 2.399, lift: 0 }; }
function canopy(s, i) { const h = height(s, i); return { x: s.x, z: s.z, sx: 2 + h * .32, sy: 1.4 + h * .16, sz: 2 + h * .32, yaw: i * 2.399, lift: h }; }
function height(s, i) { return s.age === "ancient" ? 11 + rand(i, 1) * 5 : s.kind === "apple" ? 3.5 + rand(i, 2) * 2.5 : 5 + rand(i, 3) * 6; }

function addFallbackTrees(root, olam) {
  const count = qualityCount(olam, 620);
  const spec = i => { const a = i * 2.399, r = 150 + rand(i, 1) * 80; return { x: -90 + Math.cos(a) * r, z: 45 + Math.sin(a) * r * .55, h: 5 + rand(i, 3) * 7, a }; };
  root.add(makeInstancedLayer({ olam, name: "instanced_tree_trunks", geometry: "trunk", material: "barkOak", count, build: i => { const s = spec(i); return { x: s.x, z: s.z, sx: .35 + s.h * .045, sy: s.h, sz: .35 + s.h * .045, yaw: s.a, lift: 0 }; } }));
  root.add(makeInstancedLayer({ olam, name: "instanced_tree_canopies", geometry: "canopy", material: "leaf", count, build: i => { const s = spec(i); return { x: s.x, z: s.z, sx: 2.5 + s.h * .35, sy: 1.8 + s.h * .18, sz: 2.5 + s.h * .35, yaw: s.a, lift: s.h }; } }));
}
