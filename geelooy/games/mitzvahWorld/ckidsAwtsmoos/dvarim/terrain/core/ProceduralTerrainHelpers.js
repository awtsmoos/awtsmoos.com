// B"H
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
/**
 * Purpose: small construction helpers for procedural terrain runtime meshes.
 * Owner: ProceduralTerrain.
 * Inputs: authored terrain data, visible mesh transforms, and Three geometry.
 * Outputs: hidden octree collider/safety slab meshes using the same transform.
 * Runtime authority: creates colliders only; visible mesh remains ray authority.
 * Update order: called after visual terrain mesh is built and matrix-updated.
 * Failure modes: invalid numbers collapse to safe terrain defaults.
 */
export const hiddenGroundMaterial = new THREE.MeshBasicMaterial({ visible:false, transparent:true, opacity:0 });
export const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
export function terrainData(op = {}, isSolid, noSafetySlab) {
  return { ...op, width:n(op.width, 1500), depth:n(op.depth, 1500), thickness:n(op.thickness, 4),
    segments:Math.max(1, Math.floor(n(op.segments, 64))), collisionSegments:Math.max(1, Math.floor(n(op.collisionSegments, 40))),
    hills:op.hills || [], points:op.points || op.controlPoints || [], controlPoints:op.controlPoints || op.points || [],
    plateaus:op.plateaus || [], roads:op.roads || [], microNoise:n(op.microNoise, 0),
    textureType:op.textureType || "safegrass", isSolid, noSafetySlab };
}
export function triangleCount(geometry) {
  const indexCount = geometry?.index?.count, posCount = geometry?.attributes?.position?.count;
  return Math.ceil((indexCount || posCount || 0) / 3);
}
export function solidFlags(mesh, role, terrain = {}) {
  Object.assign(mesh.userData ||= {}, { isSolid:true, isTerrain:true, explicitCollision:true,
    terrainColliderOnly:true, colliderRole:role, textureType:terrain.textureType,
    surfaceKey:terrain.surfaceKey || terrain.textureType || "terrain", materialKey:terrain.materialKey || terrain.textureType || "terrain" });
}
export function colliderData(terrain) { return { ...terrain, segments:Math.min(terrain.collisionSegments, 40), microNoise:0 }; }
export function syncTransform(target, source) { target.position.copy(source.position); target.rotation.copy(source.rotation); target.scale.copy(source.scale); target.updateMatrixWorld(true); }
export function insertOctree(olam, mesh) { return olam?.worldOctree?.addObject(mesh) || false; }
export function makeSlab(mesh, terrain) {
  const slab = new THREE.Mesh(new THREE.BoxGeometry(terrain.width + 28, 0.18, terrain.depth + 28), hiddenGroundMaterial.clone());
  slab.name = `${mesh?.name || "terrain"}_abyss_safety_slab`;
  slab.position.set(n(mesh?.position?.x), n(mesh?.position?.y) - 0.45, n(mesh?.position?.z));
  return slab;
}
