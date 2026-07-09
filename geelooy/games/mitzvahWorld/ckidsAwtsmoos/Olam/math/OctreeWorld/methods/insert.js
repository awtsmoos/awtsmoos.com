// B"H
/**
 * @module OctreeWorld_Insert
 * @description
 * Chapter 146: A collider must remember where the world placed it.
 *
 * The former clone copied `matrixWorld` but not local position/quaternion/scale.
 * When Three.js re-parented that clone into a physics group, the local transform
 * could overwrite the copied world matrix and leave wall physics away from the
 * visible wall. Here every clone receives the final world pose as its own local
 * pose inside an identity physics group, so house and fence boxes remain exactly
 * where the village placed them.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import { NODE_STATE } from '../constants.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

const worldPosition = new THREE.Vector3();
const worldQuaternion = new THREE.Quaternion();
const worldScale = new THREE.Vector3();
const meshBoxScratch = new THREE.Box3();

function cloneAtWorldPose(mesh) {
  mesh.updateMatrixWorld(true);
  const clone = mesh.clone();
  mesh.getWorldPosition(worldPosition);
  mesh.getWorldQuaternion(worldQuaternion);
  mesh.getWorldScale(worldScale);
  clone.position.copy(worldPosition);
  clone.quaternion.copy(worldQuaternion);
  clone.scale.copy(worldScale);
  clone.matrixAutoUpdate = true;
  clone.updateMatrix();
  clone.updateMatrixWorld(true);
  clone.userData = { ...mesh.userData, physicsWorldPose: true };
  return clone;
}
function worldBoxOf(mesh) {
  if (!mesh?.geometry) return null;
  if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
  mesh.updateMatrixWorld(true);
  return meshBoxScratch.copy(mesh.geometry.boundingBox).applyMatrix4(mesh.matrixWorld).clone();
}

export default {
  _insertMeshOnly(node, mesh, meshBox) {
    if (!node?.box?.intersectsBox(meshBox)) return false;
    if (node.type === 'LEAF') {
      const meshToAdd = cloneAtWorldPose(mesh);
      node.physicsMeshGroup.add(meshToAdd);
      node.physicsMeshGroup.updateMatrixWorld(true);
      node.state = NODE_STATE.PENDING_BUILD;
      meshToAdd.userData.inMainWorld = true;
      if (node.physics) this._synchronouslyRebuildNode(node, meshToAdd);
      else this._buildNodePhysics(node);
      return true;
    }

    let placed = false;
    for (const child of node.children || []) if (this._insertMeshOnly(child, mesh, meshBox)) placed = true;
    return placed;
  },

  _distributeMeshes(node, mesh) {
    const meshWorldBox = worldBoxOf(mesh);
    if (!meshWorldBox || !node?.box?.intersectsBox(meshWorldBox)) return;

    if (node.type === 'LEAF') {
      const clone = cloneAtWorldPose(mesh);
      node.physicsMeshGroup.add(clone);
      node.physicsMeshGroup.updateMatrixWorld(true);
      node.state = NODE_STATE.PENDING_BUILD;
      return;
    }

    if (node.type === 'BRANCH') {
      for (const child of node.children?.filter(child => child.box.intersectsBox(meshWorldBox)) || []) this._distributeMeshes(child, mesh);
    }
  }
};
