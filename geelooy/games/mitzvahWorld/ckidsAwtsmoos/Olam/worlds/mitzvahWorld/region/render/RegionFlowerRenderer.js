// B"H
/** @file RegionFlowerRenderer.js @description Wildflowers along roads and fertile fields, quality aware. */
import * as THREE from "/games/scripts/build/three.module.js";
import { makeInstancedLayer } from "./RegionInstancer.js";
import { samplePolyline, offsetPoint } from "./RegionPolyline.js";
import { rand } from "./RegionRandom.js";
import { sealRegionVisual } from "./RegionSeal.js";
import { qualityCount } from "./RegionQuality.js?v=region-quality-20260612-bh1";
export function buildFlowerRenderer(olam, roads) {
  const root = new THREE.Group(); root.name = "living_region_wildflower_fields";
  const path = samplePolyline(roads.main?.points || [], 5), spots = [];
  path.forEach((p, i) => { spots.push(offsetPoint(p, 3.4 + rand(i, 1) * 2)); spots.push(offsetPoint(p, -3.4 - rand(i, 2) * 2)); });
  const count = qualityCount(olam, Math.min(1600, spots.length * 6 + 500));
  root.add(makeInstancedLayer({ olam, name: "instanced_daisy_petal_heads", geometry: "flower", material: "daisyPetal", count, build: i => { const base = spots[i % spots.length] || { x: 0, z: 0 }; return { x: base.x + (rand(i, 3) - .5) * 4, z: base.z + (rand(i, 4) - .5) * 4, sx: .16, sy: .07, sz: .16, yaw: rand(i, 5) * 6.28, lift: .42 + rand(i, 6) * .18 }; } }));
  const lavender = qualityCount(olam, 800);
  root.add(makeInstancedLayer({ olam, name: "instanced_lavender_flower_heads", geometry: "flower", material: "lavenderFlower", count: lavender, build: i => ({ x: -130 + (i % 50) * 2.4 + (rand(i, 8) - .5), z: 10 + Math.floor(i / 50) * 2.2 + (rand(i, 9) - .5), sx: .13, sy: .18, sz: .13, yaw: rand(i, 10) * 6.28, lift: .55 }) }));
  root.userData.stats = { flowers: count + lavender }; return sealRegionVisual(root);
}
