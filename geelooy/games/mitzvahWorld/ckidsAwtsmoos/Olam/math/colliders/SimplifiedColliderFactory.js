// B"H
/**
 * @file SimplifiedColliderFactory.js
 * @description
 * Chapter 632: The solid body receives a simple shadow exactly where it stands.
 *
 * Visual meshes can be detailed, rotated, decorated, and expensive. Physics
 * should receive a small, truthful vessel. For ordinary solid pieces, this
 * factory measures the final world-space box after all transforms and creates a
 * transparent BoxGeometry at that exact center/size. Terrain may opt out because
 * ground height needs the actual terrain collider, not a giant box.
 */
import * as THREE from '/games/scripts/build/three.module.js';
const MAT = new THREE.MeshBasicMaterial({ visible: false, transparent: true, opacity: 0, depthWrite: false });
const MIN = 0.05;
const n = value => Number.isFinite(Number(value)) ? Number(value) : 0;
function finiteBox(box) {
  return box && Number.isFinite(box.min.x) && Number.isFinite(box.min.y) && Number.isFinite(box.min.z) && Number.isFinite(box.max.x) && Number.isFinite(box.max.y) && Number.isFinite(box.max.z) && !box.isEmpty();
}
export function shouldUseOriginalCollider(mesh) {
  const data = mesh?.userData || {};
  return Boolean(data.terrainColliderOnly || data.keepOriginalCollider || data.useExactGeometryCollider);
}
export function worldBoxOf(mesh) {
  if (!mesh?.geometry) return null;
  mesh.updateMatrixWorld?.(true);
  if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox?.();
  const box = mesh.geometry.boundingBox?.clone?.().applyMatrix4(mesh.matrixWorld) || new THREE.Box3().setFromObject(mesh);
  return finiteBox(box) ? box : null;
}
export function makeSimplifiedBoxCollider(mesh) {
  const box = worldBoxOf(mesh);
  if (!box) return null;
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  size.x = Math.max(MIN, n(size.x));
  size.y = Math.max(MIN, n(size.y));
  size.z = Math.max(MIN, n(size.z));
  const collider = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), MAT.clone());
  collider.name = `${mesh.name || mesh.type || 'solid'}_simplified_world_box_collider`;
  collider.position.copy(center);
  collider.quaternion.identity();
  collider.scale.set(1, 1, 1);
  collider.updateMatrix();
  collider.updateMatrixWorld(true);
  collider.nivraAwtsmoos = mesh.nivraAwtsmoos || mesh.userData?.nivraAwtsmoos || mesh.userData?.owner || null;
  collider.userData = {
    ...mesh.userData,
    visualReference: mesh,
    simplifiedCollider: true,
    simplifiedFrom: mesh.name || mesh.type || 'solid',
    colliderRole: mesh.userData?.colliderRole || 'simplified-world-box',
    isSolid: true,
    explicitCollision: true,
    collisionBody: true,
    addToOctree: true,
    skipOctree: false,
    noOctree: false,
    skipRaycast: false
  };
  return collider;
}
export function colliderForOctree(mesh) {
  if (shouldUseOriginalCollider(mesh)) return mesh;
  return makeSimplifiedBoxCollider(mesh) || mesh;
}
