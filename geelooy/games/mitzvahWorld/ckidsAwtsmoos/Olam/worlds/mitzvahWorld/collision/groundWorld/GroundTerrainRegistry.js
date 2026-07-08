// B"H
import { BOX, meshId } from "./GroundWorldMath.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

/**
 * Purpose: decide what meshes can speak as terrain.
 * Owner: GroundCollisionWorld.
 * Inputs: Object3D roots registered by terrain builders.
 * Outputs: bounded registry records for SpatialBubbleIndex.
 * Runtime authority: classifies terrain, never moves it.
 * Performance: bounds are computed on registration, not every query.
 * Update order: registration before player collision queries.
 * Callers: GroundCollisionWorld.registerTerrainMesh.
 * Calls: Object3D traversal and geometry bounding boxes.
 * Invariants: skipRaycast/noRaycast meshes never enter ground query.
 * Failure modes: roots without bounds are ignored.
 * Future: accept precomputed chunk bounds to avoid traversal.
 */
export function terrainLike(mesh) {
  const data = mesh?.userData || {};
  const named = /terrain|ground/i.test(mesh?.name || "");
  return Boolean(mesh?.isObject3D && !data.skipRaycast && !data.noRaycast && (
    data.isTerrain || data.awtsmoosGroundCollider || data.awtsmoosMeshGroundAuthority || named
  ));
}

export function worldBounds(root) {
  BOX.makeEmpty();
  root?.updateWorldMatrix?.(true, true);
  root?.traverse?.(child => {
    if (!child?.isMesh || !child.geometry) return;
    if (child.userData?.skipRaycast || child.userData?.noRaycast) return;
    child.geometry.computeBoundingBox?.();
    if (child.geometry.boundingBox) BOX.union(child.geometry.boundingBox.clone().applyMatrix4(child.matrixWorld));
  });
  return BOX.isEmpty() ? null : BOX.clone();
}

export function terrainRecord(index, meshes, mesh, options = {}) {
  if (!terrainLike(mesh)) return null;
  const id = options.id || meshId(mesh);
  const existing = meshes.get(id);
  if (existing?.mesh === mesh && !options.force) {
    existing.changed = false;
    return existing;
  }
  const bounds = worldBounds(mesh);
  if (!bounds) return null;
  const entry = index.register({ id:`terrain:${id}`, kind:"terrain", layer:0, bounds, ref:mesh, source:"mesh" });
  const record = { id, mesh, bounds, entryId:entry.id, registeredAt:Date.now(), changed:true };
  meshes.set(id, record);
  return record;
}
