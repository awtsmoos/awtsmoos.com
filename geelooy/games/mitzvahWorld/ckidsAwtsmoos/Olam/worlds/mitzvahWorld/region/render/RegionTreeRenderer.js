// B"H
/**
 * @file RegionTreeRenderer.js
 * @description
 * Chapter 999: crowns are made from translated individual leaves.
 * The Awtsmoos replaces flat-sheet trees with roots, limbs, crown shards, and
 * thousands of offset leaflets so the canopy reads as leaves, not planes.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { makeInstancedLayer } from "./RegionInstancer.js?v=leaflet-grass-tuft-20260614-bh1";
import { rand } from "./RegionRandom.js";
import { sealRegionVisual } from "./RegionSeal.js";
import { qualityCount } from "./RegionQuality.js?v=region-quality-20260612-bh1";
export function buildTreeRenderer(olam, report = {}) { const root = new THREE.Group(); root.name = "living_region_all_complex_translated_leaflet_trees"; const specs = report.instances?.trees || fallbackSpecs(640); addComplexTrees(root, olam, specs); root.userData.stats = { trees: Math.min(specs.length, qualityCount(olam, specs.length)), individualLeafletTrees: true, flatPlaneOnlyLeaves: false, oldBlobTrees: 0, layers: root.children.length }; return sealRegionVisual(root, { individualLeafletTrees: true }); }
function addComplexTrees(root, olam, specs) { const n = qualityCount(olam, Math.min(700, specs.length)); root.add(layer(olam, "complex_tree_visible_roots", "trunk", "barkOak", n * 3, i => rootSpec(specs[i % n], i))); root.add(layer(olam, "complex_tree_tapered_trunks", "trunk", "barkOak", n, i => trunk(specs[i % n], i))); root.add(layer(olam, "complex_tree_major_limbs_a", "trunk", "barkOak", n * 3, i => limb(specs[i % n], i, 0))); root.add(layer(olam, "complex_tree_major_limbs_b", "trunk", "barkPine", n * 3, i => limb(specs[i % n], i, 1))); root.add(layer(olam, "translated_individual_leaflets_outer", "leaflet", "leaf", n * 22, i => leaflet(specs[i % n], i, 1))); root.add(layer(olam, "translated_individual_leaflets_inner", "leaflet", "leaf", n * 16, i => leaflet(specs[i % n], i, 2))); root.add(layer(olam, "complex_tree_small_crown_shards", "canopy", "leaf", n * 4, i => shard(specs[i % n], i))); root.add(layer(olam, "complex_orchard_fruit_dots", "flower", "flower", Math.floor(n * .8), i => fruit(specs[i % n], i))); }
function layer(olam, name, geometry, material, count, build) { return makeInstancedLayer({ olam, name, geometry, material, count, build, simple: false }); }
function height(s, i) { return s.age === "ancient" ? 11 + rand(i, 1) * 5.2 : s.kind === "apple" ? 4.2 + rand(i, 2) * 2.2 : 6.4 + rand(i, 3) * 4.6; }
function base(s) { return { x: Number(s.x) || 0, z: Number(s.z) || 0 }; }
function trunk(s, i) { const h = height(s, i), b = base(s); return { ...b, sx: .42 + h * .052, sy: h, sz: .42 + h * .052, yaw: i * 2.399, lift: 0, color: 0x694020 }; }
function rootSpec(s, i) { const h = height(s, i), b = base(s), a = i * 2.094 + rand(i, 4); return { x: b.x + Math.cos(a) * .9, z: b.z + Math.sin(a) * .9, sx: .13 + h * .018, sy: 2.2 + h * .06, sz: .13 + h * .018, yaw: a + Math.PI / 2, lift: .08, color: 0x4c2b16 }; }
function limb(s, i, family) { const h = height(s, i), b = base(s), a = i * 2.399 + family * .78, reach = 1.8 + h * .22; return { x: b.x + Math.cos(a) * reach * .35, z: b.z + Math.sin(a) * reach * .35, sx: .12 + h * .016, sy: 2.1 + h * .16, sz: .12 + h * .016, yaw: a, lift: h * (.52 + family * .08), color: family ? 0x5b351b : 0x744624 }; }
function leaflet(s, i, tier) { const h = height(s, i), b = base(s), a = i * 2.399 + tier * .47, ring = (tier === 1 ? 2.1 : 1.15) + rand(i, 8) * (1.9 + h * .1), up = h * (.68 + rand(i, 11) * .3); return { x: b.x + Math.cos(a) * ring + (rand(i,12)-.5)*.8, z: b.z + Math.sin(a) * ring * .86 + (rand(i,13)-.5)*.8, sx: .34 + rand(i, 9) * .38, sy: .48 + rand(i, 10) * .55, sz: .34, yaw: a + rand(i, 14) * 1.4, lift: up, color: s.kind === "pine" ? 0x246f36 : tier === 1 ? 0x3f9637 : 0x72b84b }; }
function shard(s, i) { const h = height(s, i), b = base(s), a = i * 1.618; return { x: b.x + Math.cos(a) * (1.1 + rand(i, 5) * 2.2), z: b.z + Math.sin(a) * (1.1 + rand(i, 6) * 2.2), sx: .75 + rand(i, 7)*.65, sy: .45 + rand(i, 8) * .52, sz: .72 + rand(i, 9)*.58, yaw: a, lift: h * (.84 + rand(i, 10) * .24), color: s.kind === "pine" ? 0x2e7b3a : 0x61a742 }; }
function fruit(s, i) { const h = height(s, i), b = base(s), a = i * 2.399; return { x: b.x + Math.cos(a) * (1.2 + rand(i, 8) * 1.8), z: b.z + Math.sin(a) * (1.2 + rand(i, 9) * 1.8), sx: .16, sy: .16, sz: .16, yaw: a, lift: h * .92, color: s.kind === "apple" ? 0xd94b38 : 0xf0ce57 }; }
function fallbackSpecs(count) { return Array.from({ length: count }, (_, i) => { const a = i * 2.399, r = 145 + rand(i, 1) * 86; return { x: -80 + Math.cos(a) * r, z: 36 + Math.sin(a) * r * .58, kind: i % 7 === 0 ? "apple" : i % 5 === 0 ? "pine" : "oak", age: i % 13 === 0 ? "ancient" : "mature" }; }); }
