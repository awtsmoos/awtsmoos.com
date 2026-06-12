// B"H
/**
 * @file RegionColliderRuntime.js
 * @description Chapter 973: hard blockers are grounded, merged into one geometry, then baked once.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { mergeGeometries } from "/games/scripts/jsm/utils/BufferGeometryUtils.js";
import { groundY } from "./RegionGround.js";
import { sealHardCollider, sealRegionVisual } from "./RegionSeal.js";
import { bakeDetachedCollider } from "../../../../../dvarim/nature/OctreeBakeClone.js";
const hiddenMat = () => new THREE.MeshBasicMaterial({ visible: false });
function boxGeometryAt(x, y, z, sx, sy, sz, yaw = 0) {
  const g = new THREE.BoxGeometry(1, 1, 1);
  const m = new THREE.Matrix4().compose(new THREE.Vector3(x, y + sy * .5, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0)), new THREE.Vector3(sx, sy, sz));
  g.applyMatrix4(m); return g;
}
function houseSpecs(report = {}) { return (report.houses || []).map(h => ({ name: h.id, x: h.x, z: h.z, sx: 8, sy: 4.2, sz: 6, yaw: 0 })); }
export function buildRegionColliderRuntime(olam, report = {}) {
  const root = new THREE.Group(); root.name = "living_region_merged_octree_colliders";
  const specs = [...houseSpecs(report), { name: "ancient_tree", x: -205, z: 112, sx: 4, sy: 10, sz: 4 }, { name: "stone_circle", x: 168, z: -88, sx: 18, sy: 1.4, sz: 18 }];
  const geos = specs.map(s => boxGeometryAt(s.x, groundY(olam, s.x, s.z), s.z, s.sx, s.sy, s.sz, s.yaw || 0));
  const merged = mergeGeometries(geos, false) || geos[0];
  const mesh = new THREE.Mesh(merged, hiddenMat()); mesh.name = "living_region_single_merged_hard_collider"; mesh.updateMatrixWorld(true); sealHardCollider(mesh, { mergedRegionCollider: true, sourceCount: specs.length });
  const added = []; bakeDetachedCollider(mesh, olam, added); root.add(mesh); root.visible = false;
  for (const g of geos) if (g !== merged) g.dispose?.();
  root.userData.stats = { colliderBodies: specs.length, mergedCollider: true, accepted: added.length, triangles: Math.ceil((merged.index?.count || merged.attributes.position?.count || 0) / 3) };
  olam.__livingRegionDetachedColliders = added; return sealRegionVisual(root, { colliderDebugVisual: false, detachedColliderAuthoringRoot: true });
}
