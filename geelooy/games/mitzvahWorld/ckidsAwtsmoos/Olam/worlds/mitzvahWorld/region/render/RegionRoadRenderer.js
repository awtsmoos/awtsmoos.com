// B"H
/** @file RegionRoadRenderer.js @description Actual yellow brick road, dirt trails, and lamps. */
import * as THREE from "/games/scripts/build/three.module.js";
import { makeInstancedLayer } from "./RegionInstancer.js";
import { samplePolyline, offsetPoint } from "./RegionPolyline.js";
import { regionGeometry } from "./RegionGeometry.js";
import { regionMaterial } from "./RegionMaterials.js";
import { groundY } from "./RegionGround.js";
import { sealRegionVisual } from "./RegionSeal.js";
export function buildRoadRenderer(olam, roads) {
  const root = new THREE.Group(); root.name = "living_region_roads_yellow_brick_and_trails";
  const main = samplePolyline(roads.main?.points || [], 2.8); root.add(makeInstancedLayer({ olam, name: "instanced_yellow_brick_road", geometry: "road", material: "yellowBrick", count: main.length, simple: false, build: i => ({ ...main[i], sx: 2.8, sy: .055, sz: 3.25, lift: .035 }) }));
  const farm = samplePolyline(roads.farm?.points || [], 4); root.add(makeInstancedLayer({ olam, name: "instanced_packed_dirt_farm_road", geometry: "road", material: "dirt", count: farm.length, build: i => ({ ...farm[i], sx: 2.4, sy: .045, sz: 4.2, lift: .025 }) }));
  const lampGeo = regionGeometry("trunk"), lampMat = regionMaterial("darkWood"), shadeGeo = regionGeometry("cone"), shadeMat = regionMaterial("lampShade", { unlit: true }); let lamps = 0;
  for (let i = 2; i < main.length; i += 8) { const p = offsetPoint(main[i], 3.9), y = groundY(olam, p.x, p.z); const post = new THREE.Mesh(lampGeo, lampMat); post.name = "road_lamp_post"; post.position.set(p.x, y + 1.05, p.z); post.scale.set(.12, 2.1, .12); const shade = new THREE.Mesh(shadeGeo, shadeMat); shade.name = "road_lamp_shade"; shade.position.set(p.x, y + 2.15, p.z); shade.scale.set(.55, .46, .55); root.add(post, shade); if (lamps++ % 3 === 0) { const light = new THREE.PointLight(0xffd28a, .32, 7, 2); light.position.set(p.x, y + 2, p.z); root.add(light); } }
  root.userData.stats = { roadPieces: main.length + farm.length, lamps }; return sealRegionVisual(root);
}
