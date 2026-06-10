// B"H
/**
 * @module OctreeWorld_AddObject
 * @description
 * Chapter 634: Solid visuals automatically become simplified exact-world-box
 * colliders, while explicit skip flags remain holy boundaries.
 *
 * The order is sacred: first honor `notSolid/skipOctree/noOctree`, then measure
 * the final visual mesh, then create a simple transparent world-box collider at
 * exactly those bounds, then insert that body into octree. Terrain can opt out
 * and keep exact geometry through `terrainColliderOnly`.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import { Octree as AwtsmoosOctree } from '../../AwtsmoosOctree/index.js';
import { auditAccepted, auditSkipped } from '../../collisionAudit/CollisionAudit.js?v=collider-audit-20260609-bh627';
import { colliderForOctree, shouldUseOriginalCollider } from '../../colliders/SimplifiedColliderFactory.js?v=simplified-solid-colliders-20260609-bh633';
import LODNode from '../LODNode.js';
import { CONFIG } from '../constants.js';
function triangleCountOf(geometry) {
  if (!geometry?.attributes?.position) return 0;
  const count = geometry.index ? geometry.index.count : geometry.attributes.position.count;
  return Math.ceil(count / 3);
}
function isFiniteBox(box) {
  return box && Number.isFinite(box.min.x) && Number.isFinite(box.min.y) && Number.isFinite(box.min.z) && Number.isFinite(box.max.x) && Number.isFinite(box.max.y) && Number.isFinite(box.max.z);
}
function sourceSkipReason(mesh) {
  if (!mesh?.geometry) return 'missing-mesh-or-geometry';
  if (mesh.userData?.notSolid) return 'notSolid';
  if (mesh.userData?.skipOctree) return 'skipOctree';
  if (mesh.userData?.noOctree) return 'noOctree';
  return '';
}
function colliderSkipReason(mesh, triCount, worldBox) {
  if (!mesh?.geometry) return 'missing-mesh-or-geometry';
  if (mesh.isSkinnedMesh || mesh.isInstancedMesh || mesh.type === 'SkinnedMesh' || mesh.type === 'InstancedMesh') return 'unsupported-mesh-type';
  if (triCount <= 0) return 'no-triangles';
  if (triCount > CONFIG.MAX_TRIANGLES_PER_MESH) return 'too-many-triangles';
  if (!isFiniteBox(worldBox) || worldBox.isEmpty()) return 'bad-world-box';
  const size = worldBox.getSize(new THREE.Vector3());
  if (size.x > CONFIG.MAX_WORLD_BOX_SIZE || size.y > CONFIG.MAX_WORLD_BOX_SIZE || size.z > CONFIG.MAX_WORLD_BOX_SIZE) return 'world-box-too-large';
  return '';
}
function worldBox(mesh) {
  if (!mesh?.geometry) return null;
  mesh.updateMatrixWorld(true);
  if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
  return mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld);
}
function cloneForPhysics(mesh) {
  const clone = new THREE.Mesh(mesh.geometry.clone());
  mesh.getWorldPosition(clone.position);
  mesh.getWorldQuaternion(clone.quaternion);
  mesh.getWorldScale(clone.scale);
  clone.updateMatrix();
  clone.updateMatrixWorld(true);
  clone.userData = { ...mesh.userData, visualReference: mesh.userData?.visualReference || mesh, inMainWorld: true };
  clone.nivraAwtsmoos = mesh.nivraAwtsmoos || mesh.userData?.owner || null;
  return clone;
}
function satelliteFor(mesh, box) {
  const tempGroup = new THREE.Group();
  const clone = cloneForPhysics(mesh);
  clone.userData = { ...mesh.userData, visualReference: mesh.userData?.visualReference || mesh };
  tempGroup.add(clone);
  const satellite = new AwtsmoosOctree(box.clone().expandByScalar(0.05));
  satellite._isManaged = true;
  satellite.fromGraphNode(tempGroup);
  satellite.build();
  satellite.creationTime = performance.now();
  satellite.sourceMesh = mesh.userData?.visualReference || mesh;
  satellite.sourceCollider = mesh;
  return satellite;
}
function chooseCollider(mesh) {
  const collider = colliderForOctree(mesh);
  if (collider !== mesh) {
    auditAccepted(mesh, 'visual-measured-for-simplified-collider');
    auditAccepted(collider, 'simplified-world-box-created-before-octree');
  }
  return collider;
}
export default {
  addObject(mesh) {
    const sourceReason = sourceSkipReason(mesh);
    if (sourceReason) { auditSkipped(mesh, sourceReason); return false; }
    const collider = chooseCollider(mesh);
    collider.updateMatrixWorld(true);
    const elements = collider.matrixWorld.elements;
    for (let i = 0; i < 16; i += 1) if (!Number.isFinite(elements[i])) { auditSkipped(collider, 'bad-matrix'); return false; }
    const box = worldBox(collider);
    const triCount = triangleCountOf(collider.geometry);
    const reason = colliderSkipReason(collider, triCount, box);
    if (reason) { auditSkipped(collider, reason); return false; }
    const mode = shouldUseOriginalCollider(collider) ? 'original-geometry' : (collider.userData?.simplifiedCollider ? 'simplified-world-box' : 'unsimplified-fallback');
    auditAccepted(collider, `octree-insert-${mode}-triangles-${triCount}`);
    if (!this.root) this.root = new LODNode(box.clone());
    else this.root.box.union(box);
    const physicsClone = cloneForPhysics(collider);
    if (this._pendingOctrees.length < CONFIG.MAX_PENDING_OCTREES) this._pendingOctrees.push(satelliteFor(collider, box));
    this._insertMeshOnly(this.root, physicsClone, box);
    return true;
  }
};
