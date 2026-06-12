// B"H
/**
 * @file RegionFlowerRenderer.js
 * @description Chapter 989: flower fields follow ecology, roads, and moisture.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { makeInstancedLayer } from "./RegionInstancer.js";
import { samplePolyline, offsetPoint } from "./RegionPolyline.js";
import { rand } from "./RegionRandom.js";
import { sealRegionVisual } from "./RegionSeal.js";
import { qualityCount } from "./RegionQuality.js?v=region-quality-20260612-bh1";

export function buildFlowerRenderer(olam, roads = {}, report = {}) {
  const root = new THREE.Group(); root.name = "living_region_wildflower_fields";
  const specs = report.instances?.flowers || [];
  if (specs.length) addSpecFlowers(root, olam, specs);
  else addFallbackRoadFlowers(root, olam, roads);
  root.userData.stats = { flowers: root.children.reduce((n, c) => n + (c.count || 0), 0) };
  return sealRegionVisual(root);
}

function addSpecFlowers(root, olam, specs) {
  const count = qualityCount(olam, Math.min(2600, specs.length));
  root.add(makeInstancedLayer({ olam, name: "instanced_ecology_flower_heads", geometry: "flower", material: "daisyPetal", count, build: i => {
    const s = specs[i % specs.length];
    return { x: s.x, z: s.z, sx: .12 + s.scale * .08, sy: .08 + s.scale * .08, sz: .12 + s.scale * .08, yaw: rand(i, 5) * 6.28, lift: .42 + rand(i, 6) * .18 };
  } }));
}

function addFallbackRoadFlowers(root, olam, roads) {
  const path = samplePolyline(roads.main?.points || [], 5), spots = [];
  path.forEach((p, i) => { spots.push(offsetPoint(p, 3.4 + rand(i, 1) * 2)); spots.push(offsetPoint(p, -3.4 - rand(i, 2) * 2)); });
  const count = qualityCount(olam, Math.min(1600, spots.length * 6 + 500));
  root.add(makeInstancedLayer({ olam, name: "instanced_daisy_petal_heads", geometry: "flower", material: "daisyPetal", count, build: i => {
    const base = spots[i % spots.length] || { x: 0, z: 0 };
    return { x: base.x + (rand(i, 3) - .5) * 4, z: base.z + (rand(i, 4) - .5) * 4, sx: .16, sy: .07, sz: .16, yaw: rand(i, 5) * 6.28, lift: .42 + rand(i, 6) * .18 };
  } }));
}
