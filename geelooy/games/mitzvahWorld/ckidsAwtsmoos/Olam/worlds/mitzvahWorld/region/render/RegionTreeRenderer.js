// B"H
/**
 * @file RegionTreeRenderer.js
 * @description
 * Chapter 1017: every region tree is only the geelooy/libs hero tree.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { createHeroTree } from "/libs/awtsmoos3d/tree/heroTree.js?v=only-advanced-trees-20260614-bh2";
import { rand } from "./RegionRandom.js";
import { groundY } from "./RegionGround.js";
import { sealRegionVisual } from "./RegionSeal.js";
import { qualityCount } from "./RegionQuality.js?v=region-quality-20260612-bh1";
function fallbackSpecs(count) { return Array.from({ length: count }, (_, i) => { const a = i * 2.399963, r = 120 + rand(i, 1) * 118; return { x: -70 + Math.cos(a) * r, z: 32 + Math.sin(a) * r * .62, kind: i % 7 === 0 ? "apple" : i % 5 === 0 ? "pine" : "oak", age: i % 11 === 0 ? "ancient" : "mature" }; }); }
function treeOptions(spec, index, olam) { const ancient = spec.age === "ancient", apple = spec.kind === "apple", pine = spec.kind === "pine"; return { name: `advanced_geelooy_libs_tree_${spec.kind || "oak"}_${index}`, trunkHeight: ancient ? 10 + rand(index, 3) * 4 : apple ? 5.8 + rand(index, 4) * 1.8 : 7.2 + rand(index, 5) * 3.2, crownRadius: pine ? 3.2 + rand(index, 6) * 1.8 : ancient ? 6.2 + rand(index, 7) * 2.2 : 4.2 + rand(index, 8) * 1.8, crownHeight: pine ? 6.2 : 3.8 + rand(index, 9) * 1.4, limbCount: ancient ? 54 : pine ? 36 : 42, leafCount: ancient ? 920 : pine ? 620 : 760, barkColor: pine ? 0x4d321f : 0x684020, branchColor: pine ? 0x3f2a1a : 0x4d2b17, leafColor: pine ? 0x236f35 : apple ? 0x65a342 : 0x4e9b38, rotationY: rand(index, 10) * Math.PI * 2, scale: ancient ? 1.12 : .82 + rand(index, 11) * .34, context: { olam, renderer: olam?.renderer } }; }
function addRoots(group, index) { const geo = new THREE.CylinderGeometry(.08, .2, 1, 8, 1), mat = new THREE.MeshLambertMaterial({ color: 0x4c2b16 }); for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + rand(index, i) * .2; const root = new THREE.Mesh(geo, mat); root.name = "advanced_tree_visible_library_root"; root.position.set(Math.cos(a) * .78, .09, Math.sin(a) * .78); root.scale.set(.9, 2.2 + rand(i, index) * 1.1, .9); root.rotation.set(Math.PI / 2, a, 0); group.add(root); } }
function buildOne(olam, spec, index) { const x = Number(spec.x) || 0, z = Number(spec.z) || 0; const wrap = new THREE.Group(); wrap.name = `ONLY_ADVANCED_GEELOOY_LIBS_TREE_${index}`; wrap.position.set(x, groundY(olam, x, z) + .012, z); const hero = createHeroTree(treeOptions(spec, index, olam), { olam, renderer: olam?.renderer }); hero.name = `geelooy_libs_hero_tree_visual_${index}`; wrap.add(hero); addRoots(wrap, index); Object.assign(wrap.userData, { advancedGeelooyLibsTree: true, species: spec.kind || "oak" }); return wrap; }
export function buildTreeRenderer(olam, report = {}) { const specs = report.instances?.trees || fallbackSpecs(220); const count = Math.min(qualityCount(olam, specs.length), 140); const root = new THREE.Group(); root.name = "living_region_ONLY_ADVANCED_GEELOOY_LIBS_HERO_TREES"; for (let i = 0; i < count; i++) root.add(buildOne(olam, specs[i % specs.length], i)); root.userData.stats = { trees: count, onlyAdvancedGeelooyLibsHeroTrees: true }; return sealRegionVisual(root, { onlyAdvancedGeelooyLibsHeroTrees: true }); }
