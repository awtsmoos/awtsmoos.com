// B"H
/**
 * @file RegionInstancer.js
 * @description One grounded instancing gate: every tuft, leaf, rock, and road receives the same earth law.
 */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { regionGeometry } from "./RegionGeometry.js?compact=true&v=awtsmoos-geometry-20260614-bh2";
import { regionMaterial } from "./RegionMaterials.js?compact=true&v=awtsmoos-materials-20260614-bh2";
import { groundedMatrix } from "./RegionGround.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { sealRegionVisual } from "./RegionSeal.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
const DOUBLE = new Set(["blade", "leafCard", "leaflet", "grassTuft"]);
function sideFor(geometry) { return DOUBLE.has(geometry) ? THREE.DoubleSide : THREE.FrontSide; }
function applyInstance(olam, mesh, color, spec, i) {
  mesh.setMatrixAt(i, groundedMatrix(olam, spec.x || 0, spec.z || 0, spec.sx || 1, spec.sy || 1, spec.sz || 1, spec.yaw || 0, spec.lift || 0));
  if (spec.color && mesh.setColorAt) mesh.setColorAt(i, color.set(spec.color));
}
export function makeInstancedLayer({ olam, name, geometry = "box", material = "grass", count = 1, build, simple = true }) {
  const safeCount = Math.max(0, Math.floor(Number(count) || 0));
  const mesh = new THREE.InstancedMesh(regionGeometry(geometry), regionMaterial(material, { simple, side: sideFor(geometry) }), safeCount);
  mesh.name = name || `region_instanced_${geometry}_${material}`;
  mesh.frustumCulled = true; mesh.castShadow = false; mesh.receiveShadow = false;
  const color = new THREE.Color();
  for (let i = 0; i < safeCount; i++) applyInstance(olam, mesh, color, build(i) || {}, i);
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.userData.stats = { instances:safeCount, geometry, material, grounded:true };
  return sealRegionVisual(mesh, { instancedRegionLayer:true, instanceCount:safeCount, complexFragments:DOUBLE.has(geometry) });
}
