// B"H
/**
 * @file RegionTreeRenderer.js
 * @description
 * Chapter 996: every region tree is now complex by construction.
 * No more green balls on sticks: roots, trunks, limbs, twig arms, stacked leaf
 * cards, small crown shards, and fruit all emerge from instanced vessels.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { makeInstancedLayer } from "./RegionInstancer.js?v=leaf-card-tree-20260614-bh1";
import { rand } from "./RegionRandom.js";
import { sealRegionVisual } from "./RegionSeal.js";
import { qualityCount } from "./RegionQuality.js?v=region-quality-20260612-bh1";
export function buildTreeRenderer(olam, report = {}) { const root = new THREE.Group(); root.name = "living_region_all_complex_leaf_card_trees_no_old_blobs"; const specs = report.instances?.trees || fallbackSpecs(640); addComplexTrees(root, olam, specs); root.userData.stats = { trees: Math.min(specs.length, qualityCount(olam, specs.length)), complexOnlyTrees: true, oldBlobTrees: 0, layers: root.children.length }; return sealRegionVisual(root, { complexOnlyTrees: true }); }
function addComplexTrees(root, olam, specs) { const n = qualityCount(olam, Math.min(760, specs.length)); root.add(layer(olam, "complex_tree_visible_roots", "trunk", "barkOak", n * 3, i => rootSpec(specs[i % n], i))); root.add(layer(olam, "complex_tree_tapered_trunks", "trunk", "barkOak", n, i => trunk(specs[i % n], i))); root.add(layer(olam, "complex_tree_major_limbs_a", "trunk", "barkOak", n * 3, i => limb(specs[i % n], i, 0))); root.add(layer(olam, "complex_tree_major_limbs_b", "trunk", "barkPine", n * 3, i => limb(specs[i % n], i, 1))); root.add(layer(olam, "complex_tree_leaf_card_outer_shell", "leafCard", "leaf", n * 10, i => leaf(specs[i % n], i, 1))); root.add(layer(olam, "complex_tree_leaf_card_inner_shell", "leafCard", "leaf", n * 8, i => leaf(specs[i % n], i, 2))); root.add(layer(olam, "complex_tree_small_crown_shards", "canopy", "leaf", n * 5, i => shard(specs[i % n], i))); root.add(layer(olam, "complex_orchard_fruit_dots", "flower", "flower", Math.floor(n * .8), i => fruit(specs[i % n], i))); }
function layer(olam, name, geometry, material, count, build) { return makeInstancedLayer({ olam, name, geometry, material, count, build, simple: false }); }
function height(s, i) { return s.age === "ancient" ? 11 + rand(i, 1) * 5.2 : s.kind === "apple" ? 4.2 + rand(i, 2) * 2.2 : 6.4 + rand(i, 3) * 4.6; }
function base(s) { return { x: Number(s.x) || 0, z: Number(s.z) || 0 }; }
function trunk(s, i) { const h = height(s, i), b = base(s); return { ...b, sx: .42 + h * .052, sy: h, sz: .42 + h * .052, yaw: i * 2.399, lift: 0, color: 0x694020 }; }
function rootSpec(s, i) { const h = height(s, i), b = base(s), a = i * 2.094 + rand(i, 4); return { x: b.x + Math.cos(a) * .9, z: b.z + Math.sin(a) * .9, sx: .13 + h * .018, sy: 2.2 + h * .06, sz: .13 + h * .018, yaw: a + Math.PI / 2, lift: .08, color: 0x4c2b16 }; }
function limb(s, i, family) { const h = height(s, i), b = base(s), a = i * 2.399 + family * .78, reach = 1.8 + h * .22; return { x: b.x + Math.cos(a) * reach * .35, z: b.z + Math.sin(a) * reach * .35, sx: .12 + h * .016, sy: 2.1 + h * .16, sz: .12 + h * .016, yaw: a, lift: h * (.52 + family * .08), color: family ? 0x5b351b : 0x744624 }; }
function leaf(s, i, tier) { const h = height(s, i), b = base(s), a = i * 2.399 + tier * .47, r = (tier === 1 ? 1.9 : 1.0) + rand(i, 8) * (1.6 + h * .08); return { x: b.x + Math.cos(a) * r, z: b.z + Math.sin(a) * r * .86, sx: 2.4 + rand(i, 9) * 1.7, sy: 1.7 + rand(i, 10) * 1.2, sz: 1, yaw: a + Math.PI / 2, lift: h * (.72 + rand(i, 11) * .22), color: s.kind === "pine" ? 0x246f36 : tier === 1 ? 0x3f9637 : 0x72b84b }; }
function shard(s, i) { const h = height(s, i), b = base(s), a = i * 1.618; return { x: b.x + Math.cos(a) * (1.1 + rand(i, 5) * 2.2), z: b.z + Math.sin(a) * (1.1 + rand(i, 6) * 2.2), sx: 1.3 + rand(i, 7), sy: .75 + rand(i, 8) * .9, sz: 1.1 + rand(i, 9), yaw: a, lift: h * (.84 + rand(i, 10) * .24), color: s.kind === "pine" ? 0x2e7b3a : 0x61a742 }; }
function fruit(s, i) { const h = height(s, i), b = base(s), a = i * 2.399; return { x: b.x + Math.cos(a) * (1.2 + rand(i, 8) * 1.8), z: b.z + Math.sin(a) * (1.2 + rand(i, 9) * 1.8), sx: .16, sy: .16, sz: .16, yaw: a, lift: h * .92, color: s.kind === "apple" ? 0xd94b38 : 0xf0ce57 }; }
function fallbackSpecs(count) { return Array.from({ length: count }, (_, i) => { const a = i * 2.399, r = 145 + rand(i, 1) * 86; return { x: -80 + Math.cos(a) * r, z: 36 + Math.sin(a) * r * .58, kind: i % 7 === 0 ? "apple" : i % 5 === 0 ? "pine" : "oak", age: i % 13 === 0 ? "ancient" : "mature" }; }); }
