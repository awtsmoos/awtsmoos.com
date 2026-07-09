// B"H
/** @file RegionRoadRenderer.js @description Roads cling to terrain and use the fresh grainy material vessel. */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import { samplePolyline } from "./RegionPolyline.js?compact=true&v=awtsmoos-polyline-20260614-bh2";
import { regionMaterial } from "./RegionMaterials.js?compact=true&v=awtsmoos-materials-20260614-bh2";
import { groundY, groundNormal } from "./RegionGround.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { sealRegionVisual } from "./RegionSeal.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
const ROAD_LIMIT = 28;
const UP = new THREE.Vector3(0, 1, 0);
function addRoad(root, olam, road, material, width, spacing, name) {
  const points = samplePolyline((road && road.points) || [], spacing).slice(0, ROAD_LIMIT);
  if (!points.length) return;
  const mat = regionMaterial(material, { simple:false });
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const mesh = new THREE.InstancedMesh(geo, mat, points.length);
  const dummy = new THREE.Object3D();
  mesh.name = `${name}_instanced`;
  for (let i=0; i<points.length; i++) {
    const p = points[i];
    dummy.position.set(p.x, groundY(olam, p.x, p.z) + .035, p.z);
    dummy.quaternion.setFromUnitVectors(UP, groundNormal(olam, p.x, p.z));
    dummy.rotateY(p.yaw || 0);
    dummy.scale.set(width, .06, spacing * .86);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  mesh.receiveShadow = true;
  Object.assign(mesh.userData, { regionRoad:true, visualOnly:true, skipOctree:true, noOctree:true, groundedRoad:true, instancedRoad:true, roadPieces:points.length });
  root.add(mesh);
}
export function buildRoadRenderer(olam, roads = {}) {
  const root = new THREE.Group(); root.name = "living_region_grounded_roads_no_float";
  addRoad(root, olam, roads.main, "yellowBrick", 5.2, 9.2, "main_yellow_road");
  addRoad(root, olam, roads.farm, "dirt", 3.8, 11.5, "farm_dirt_road");
  addRoad(root, olam, roads.orchard, "packedEarth", 3.2, 12.5, "orchard_lane");
  addRoad(root, olam, roads.forest, "leafTrail", 2.6, 14, "forest_trail");
  for (const trail of (roads.animalTrails || []).slice(0, 1)) addRoad(root, olam, trail, "softTrail", 1.45, 16, trail.id || "animal_trail");
  addRoad(root, olam, roads.marshBoardwalk, "wood", 2.6, 12, "marsh_boardwalk");
  root.userData.stats = { roadPieces:root.children.length, groundedRoads:true, proofSafeRoads:true };
  return sealRegionVisual(root, { groundedRoads:true });
}
