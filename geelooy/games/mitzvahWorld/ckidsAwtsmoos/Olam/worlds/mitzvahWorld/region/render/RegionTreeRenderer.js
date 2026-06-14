// B"H
/**
 * @file RegionTreeRenderer.js
 * @description
 * Chapter 991: the fake tree is abolished.
 * The Awtsmoos reveals complex trees from existing region instancing vessels:
 * rooted trunks, radial limbs, lower crowns, high crowns, and orchard fruit.
 * They remain terrain-grounded and decorative, but visually read as authored
 * trees instead of green balls on sticks.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { makeInstancedLayer } from "./RegionInstancer.js";
import { rand } from "./RegionRandom.js";
import { sealRegionVisual } from "./RegionSeal.js";
import { qualityCount } from "./RegionQuality.js?v=region-quality-20260612-bh1";

export function buildTreeRenderer(olam, report = {}) {
  const root = new THREE.Group(); root.name = "living_region_complex_forest_orchard_trees";
  const specs = report.instances?.trees || fallbackSpecs(620);
  addComplexTrees(root, olam, specs);
  root.userData.stats = { trees: Math.min(specs.length, qualityCount(olam, specs.length)), complexTreeLayers: root.children.length };
  return sealRegionVisual(root);
}
function addComplexTrees(root, olam, specs) {
  const count = qualityCount(olam, Math.min(720, specs.length));
  root.add(layer(olam, "complex_tree_root_trunks", "trunk", "barkOak", count, i => trunk(specs[i % specs.length], i)));
  root.add(layer(olam, "complex_tree_north_south_limbs", "trunk", "barkOak", count, i => limb(specs[i % specs.length], i, 0)));
  root.add(layer(olam, "complex_tree_east_west_limbs", "trunk", "barkPine", count, i => limb(specs[i % specs.length], i, 1)));
  root.add(layer(olam, "complex_tree_low_leaf_masses", "canopy", "leaf", count, i => crown(specs[i % specs.length], i, .72)));
  root.add(layer(olam, "complex_tree_high_leaf_masses", "canopy", "leaf", count, i => crown(specs[i % specs.length], i, 1.05)));
  root.add(layer(olam, "complex_orchard_fruit_dots", "flower", "flower", Math.floor(count * .42), i => fruit(specs[i % specs.length], i)));
}
function layer(olam, name, geometry, material, count, build) { return makeInstancedLayer({ olam, name, geometry, material, count, build, simple: false }); }
function height(s, i) { return s.age === "ancient" ? 10.5 + rand(i, 1) * 5.5 : s.kind === "apple" ? 4 + rand(i, 2) * 2.8 : 6 + rand(i, 3) * 5.8; }
function base(s) { return { x: Number(s.x) || 0, z: Number(s.z) || 0 }; }
function trunk(s, i) { const h = height(s, i), b = base(s); return { ...b, sx: .36 + h * .045, sy: h, sz: .36 + h * .045, yaw: i * 2.399, lift: 0, color: 0x6f4728 }; }
function limb(s, i, arm) {
  const h = height(s, i), b = base(s), a = i * 2.399 + arm * 1.57;
  const reach = 1.4 + h * .16;
  return { x: b.x + Math.cos(a) * reach * .42, z: b.z + Math.sin(a) * reach * .42, sx: .14 + h * .018, sy: 1.8 + h * .12, sz: .14 + h * .018, yaw: a, lift: h * (.56 + arm * .08), color: arm ? 0x5c371d : 0x734727 };
}
function crown(s, i, tier) {
  const h = height(s, i), b = base(s), a = i * 2.399 + tier;
  const wobble = tier < 1 ? .82 : .38;
  return { x: b.x + Math.cos(a) * wobble, z: b.z + Math.sin(a) * wobble, sx: 2.15 + h * .34 * tier, sy: 1.35 + h * .18, sz: 2.05 + h * .31 * tier, yaw: a, lift: h * (.78 + tier * .08), color: s.kind === "pine" ? 0x2e7b3a : 0x61a742 };
}
function fruit(s, i) {
  const h = height(s, i), b = base(s), a = i * 2.399;
  return { x: b.x + Math.cos(a) * (1.2 + rand(i, 8) * 1.5), z: b.z + Math.sin(a) * (1.2 + rand(i, 9) * 1.5), sx: .18, sy: .18, sz: .18, yaw: a, lift: h * .92, color: s.kind === "apple" ? 0xd94b38 : 0xf0ce57 };
}
function fallbackSpecs(count) {
  return Array.from({ length: count }, (_, i) => { const a = i * 2.399, r = 145 + rand(i, 1) * 86; return { x: -80 + Math.cos(a) * r, z: 36 + Math.sin(a) * r * .58, kind: i % 7 === 0 ? "apple" : i % 5 === 0 ? "pine" : "oak", age: i % 13 === 0 ? "ancient" : "mature" }; });
}
