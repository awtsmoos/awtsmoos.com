// B"H
/**
 * @file RegionFlowerRenderer.js
 * @description Flower fields grow from roads, ecology specs, and deterministic grounded petals.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { makeInstancedLayer } from "./RegionInstancer.js?v=awtsmoos-instancer-20260614-bh2";
import { samplePolyline, offsetPoint } from "./RegionPolyline.js?v=awtsmoos-polyline-20260614-bh2";
import { rand } from "./RegionRandom.js";
import { sealRegionVisual } from "./RegionSeal.js";
import { budgetedQualityCount } from "./RegionQuality.js?v=awtsmoos-quality-20260614-bh2";
function reportFlowers(report) { return report && report.instances && Array.isArray(report.instances.flowers) ? report.instances.flowers : []; }
function specFlower(spec, i) { const scale = Number(spec.scale || 1); return { x:spec.x, z:spec.z, sx:.12 + scale*.08, sy:.08 + scale*.08, sz:.12 + scale*.08, yaw:rand(i,5)*6.28, lift:.42 + rand(i,6)*.18, color:i % 3 ? 0xf6e58d : 0xc78df6 }; }
function mainRoadPoints(roads) { const main = roads && roads.main ? roads.main : {}; return Array.isArray(main.points) ? main.points : []; }
function roadSpots(roads) { const path = samplePolyline(mainRoadPoints(roads), 5), spots = []; path.forEach((p, i) => { spots.push(offsetPoint(p, 3.4 + rand(i,1)*2)); spots.push(offsetPoint(p, -3.4 - rand(i,2)*2)); }); return spots; }
function fallbackFlower(spots, i) { const base = spots[i % Math.max(1, spots.length)] || { x:0, z:0 }; return { x:base.x + (rand(i,3)-.5)*4, z:base.z + (rand(i,4)-.5)*4, sx:.16, sy:.07, sz:.16, yaw:rand(i,5)*6.28, lift:.42 + rand(i,6)*.18, color:i % 5 ? 0xffee88 : 0xd6a7ff }; }
export function buildFlowerRenderer(olam, roads = {}, report = {}) {
  const root = new THREE.Group(); root.name = "living_region_grounded_wildflower_fields";
  const specs = reportFlowers(report);
  if (specs.length) { const count = Math.min(900, budgetedQualityCount(olam, Math.min(900, specs.length), "grassDistance", 900)); root.add(makeInstancedLayer({ olam, name:"instanced_ecology_flower_heads", geometry:"flower", material:"daisyPetal", count, build:i => specFlower(specs[i % specs.length], i) })); }
  else { const spots = roadSpots(roads), count = Math.min(700, budgetedQualityCount(olam, Math.min(700, spots.length * 3 + 180), "grassDistance", 700)); root.add(makeInstancedLayer({ olam, name:"instanced_roadside_daisy_and_lavender_heads", geometry:"flower", material:"daisyPetal", count, build:i => fallbackFlower(spots, i) })); }
  root.userData.stats = { flowers:root.children.reduce((n,c)=>n + (c.count || 0), 0), groundedFlowers:true };
  return sealRegionVisual(root, { groundedFlowers:true });
}
