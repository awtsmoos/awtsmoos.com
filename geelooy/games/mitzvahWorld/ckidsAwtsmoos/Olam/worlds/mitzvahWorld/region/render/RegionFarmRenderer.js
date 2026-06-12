// B"H
/** @file RegionFarmRenderer.js @description Vegetable beds, cloth sacks, and farm rows with quality-aware counts. */
import * as THREE from "/games/scripts/build/three.module.js";
import { makeInstancedLayer } from "./RegionInstancer.js";
import { sealRegionVisual } from "./RegionSeal.js";
import { qualityCount } from "./RegionQuality.js?v=region-quality-20260612-bh1";
export function buildFarmRenderer(olam) {
  const root = new THREE.Group(); root.name = "living_region_farms_and_vegetable_beds";
  const carrots = qualityCount(olam, 360), cabbages = qualityCount(olam, 180), sacks = qualityCount(olam, 28);
  root.add(makeInstancedLayer({ olam, name: "instanced_carrots", geometry: "stem", material: "carrotSkin", count: carrots, simple: false, build: i => ({ x: -150 + (i % 36) * 1.4, z: -42 + Math.floor(i / 36) * 2.1, sx: .16, sy: .52, sz: .16, yaw: 0, lift: .02 }) }));
  root.add(makeInstancedLayer({ olam, name: "instanced_cabbages", geometry: "canopy", material: "cabbageLeaf", count: cabbages, build: i => ({ x: -135 + (i % 30) * 1.55, z: -15 + Math.floor(i / 30) * 2.15, sx: .46, sy: .32, sz: .46, yaw: i, lift: .02 }) }));
  root.add(makeInstancedLayer({ olam, name: "instanced_linen_sacks", geometry: "road", material: "linenFabric", count: sacks, build: i => ({ x: -82 + (i % 7) * .75, z: -30 + Math.floor(i / 7) * .7, sx: .48, sy: .38, sz: .55, yaw: i * .2, lift: .03 }) }));
  root.userData.stats = { vegetables: carrots + cabbages, sacks }; return sealRegionVisual(root);
}
