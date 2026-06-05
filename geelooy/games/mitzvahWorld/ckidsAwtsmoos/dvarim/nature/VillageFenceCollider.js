// B"H
/**
 * @file VillageFenceCollider.js
 * @description
 * Chapter 152: The fence stops being a ghost.
 *
 * The visible fence is art. The hidden rail is law. Its parent must remain
 * skipped so beauty is not baked, but the child must enter the octree. The
 * Awtsmoos therefore sends a detached clone of the final rail, parentless and
 * finite, into collision, where a chossid can no longer walk through wood.
 */
import Domem from "../../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";
import { bakeDetachedCollider, removeDetachedColliders } from "./OctreeBakeClone.js";

const n = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const mat = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0, depthWrite: false, depthTest: false });

function makeRail(owner, size, pos) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), mat.clone());
  mesh.name = "single_simple_fence_rail_octree";
  mesh.visible = true;
  mesh.position.set(...pos);
  mesh.nivraAwtsmoos = owner;
  Object.assign(mesh.userData ||= {}, { isSolid: true, explicitCollision: true, collisionBody: true, addToOctree: true, isVillageFenceCollider: true, useAuthoredY: true });
  delete mesh.userData.skipRaycast;
  return mesh;
}

export default class VillageFenceCollider extends Domem {
  type = "villageFenceCollider";

  constructor(op = {}, olam) {
    super({ ...op, golem: null, isSolid: false, interactable: false }, olam);
    this.options = op;
    this.targetName = op.targetName || "";
    this._octreeMeshes = [];
    this.useAuthoredY = true;
  }

  async heescheel(olam) {
    this.olam = olam;
    this.mesh = new THREE.Group();
    this.mesh.name = this.name || "VillageFenceCollider_final_octree_rail";
    this.mesh.position.copy(this.position.vector3());
    this.mesh.rotation.y = n(this.rotation?.y, 0);
    Object.assign(this.mesh.userData ||= {}, { awaitingVillageFinalTransform: true, skipOctree: true, noOctree: true, useAuthoredY: true });
    const length = n(this.options.length, 11), height = n(this.options.height, 1.15), depth = n(this.options.depth, 0.5);
    this.mesh.add(makeRail(this, [length, height, depth], [n(this.options.offsetX, length * 0.5), height / 2, n(this.options.offsetZ, 0)]));
    await olam.hoyseef(this);
    this.isReady = true;
  }

  alignToFinalFenceTransform(fenceMesh) {
    if (!this.mesh || !fenceMesh?.isObject3D) return false;
    fenceMesh.updateMatrixWorld(true);
    fenceMesh.getWorldPosition(this.mesh.position);
    fenceMesh.getWorldQuaternion(this.mesh.quaternion);
    this.mesh.scale.copy(fenceMesh.getWorldScale(new THREE.Vector3()));
    this.mesh.updateMatrixWorld(true);
    this.mesh.userData.awaitingVillageFinalTransform = false;
    return true;
  }

  addFinalCollidersToOctree(olam = this.olam) {
    if (!olam?.worldOctree || !this.mesh || this.mesh.userData.awaitingVillageFinalTransform) return 0;
    this.removeFinalCollidersFromOctree(olam);
    const added = [];
    this.mesh.updateMatrixWorld(true);
    this.mesh.traverse(child => { if (child.isMesh && child.userData?.isVillageFenceCollider) bakeDetachedCollider(child, olam, added); });
    this._octreeMeshes = added;
    console.info("B\"H | FENCE_SIMPLE_COLLIDERS_ADDED_TO_OCTREE", { name: this.name, added: added.length, targetName: this.targetName });
    return added.length;
  }

  removeFinalCollidersFromOctree(olam = this.olam) {
    removeDetachedColliders(olam, this._octreeMeshes);
    this._octreeMeshes = [];
  }
}
