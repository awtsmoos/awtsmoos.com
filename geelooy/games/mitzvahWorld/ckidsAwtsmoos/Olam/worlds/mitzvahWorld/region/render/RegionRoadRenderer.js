// B"H
/**
 * @file RegionRoadRenderer.js
 * @description Chapter 998: roads render as proof-safe veins, capped and lightless.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { samplePolyline } from "./RegionPolyline.js";
import { regionMaterial } from "./RegionMaterials.js?v=fast-region-materials-20260612-bh1";
import { sealRegionVisual } from "./RegionSeal.js";

const ROAD_LIMIT = 90;

export function buildRoadRenderer(_olam, roads = {}) {
  const root = new THREE.Group();
  root.name = "living_region_roads_fast_yellow_brick_and_trails";
  addRoad(root, roads.main, "yellowBrick", 5.2, 5.4, "main_yellow_road");
  addRoad(root, roads.farm, "dirt", 3.8, 6.2, "farm_dirt_road");
  addRoad(root, roads.orchard, "packedEarth", 3.2, 6.6, "orchard_lane");
  addRoad(root, roads.forest, "leafTrail", 2.6, 7.4, "forest_trail");
  for (const trail of roads.animalTrails || []) addRoad(root, trail, "softTrail", 1.45, 9, trail.id || "animal_trail");
  addRoad(root, roads.marshBoardwalk, "wood", 2.6, 6.5, "marsh_boardwalk");
  root.userData.stats = { roadPieces: root.children.length, lamps: 0, proofSafeRoads: true };
  return sealRegionVisual(root);
}

function addRoad(root, road, material, width, spacing, name) {
  const points = samplePolyline(road?.points || [], spacing).slice(0, ROAD_LIMIT);
  const mat = regionMaterial(material, { simple: true });
  const geo = new THREE.BoxGeometry(1, 1, 1);
  for (let i = 0; i < points.length; i += 1) {
    const p = points[i];
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = `${name}_${i}`;
    mesh.position.set(p.x, 0.055, p.z);
    mesh.rotation.y = p.yaw || 0;
    mesh.scale.set(width, .055, spacing * .82);
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    Object.assign(mesh.userData ||= {}, { regionRoad: true, visualOnly: true, skipOctree: true });
    root.add(mesh);
  }
}
