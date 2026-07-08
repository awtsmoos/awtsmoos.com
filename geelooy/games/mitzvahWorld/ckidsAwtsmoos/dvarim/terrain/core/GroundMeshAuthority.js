// B"H
/**
 * @module GroundMeshAuthority
 * @description Registers the rendered terrain mesh as the sole player ground
 * height authority. The owner is ProceduralTerrain; the writer is world boot.
 * Runtime cost is one registration plus cached raycasts in GroundCollisionWorld.
 */
import { registerGroundMesh as registerMeshGroundAuthority } from "../../../Olam/worlds/mitzvahWorld/collision/GroundCollisionWorld.js?compact=true&v=inline-octree-no-worker-import-20260702-bh1";

export function markVisualGroundAuthority(mesh, terrain, olam) {
  const isSolid = terrain?.isSolid !== false;
  Object.assign(mesh.userData ||= {}, {
    isTerrain: true,
    noOctree: true,
    skipOctree: true,
    awtsmoosTerrainLaw: true,
    visualOnlyTerrain: !isSolid,
    awtsmoosGroundCollider: isSolid,
    awtsmoosMeshGroundAuthority: isSolid,
    skipRaycast: false,
    noRaycast: false,
    terrainColliderKind: "visible-terrain-raycast"
  });
  if (!isSolid || !olam) return;
  olam.__awtsmoosGroundCollisionMeshes ||= [];
  if (!olam.__awtsmoosGroundCollisionMeshes.includes(mesh)) olam.__awtsmoosGroundCollisionMeshes.push(mesh);
  registerMeshGroundAuthority(olam, mesh, { reason: "procedural-visible-terrain" });
}
