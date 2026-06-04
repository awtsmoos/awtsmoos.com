// B"H
/**
 * @file VillageFenceCollider.js
 * @description
 * Chapter 357: The fence collider learns where the fence actually begins.
 *
 * The visible fence recipe builds posts from local x=0 forward, while the old
 * collider sat centered on x=0. The Awtsmoos moves the invisible rail to half
 * its length, aligning collision with the wooden rails instead of the player.
 */
import Domem from "../../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";

const n = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const hidden = new THREE.MeshBasicMaterial({ visible: false, transparent: true, opacity: 0, depthWrite: false });

function makeBox(owner, name, size, pos = [0, 0, 0]) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), hidden.clone());
  mesh.name = name;
  mesh.visible = false;
  mesh.position.set(...pos);
  mesh.nivraAwtsmoos = owner;
  Object.assign(mesh.userData ||= {}, { isSolid: true, explicitCollision: true, isVillageFenceCollider: true, useAuthoredY: true });
  return mesh;
}

export default class VillageFenceCollider extends Domem {
  type = "villageFenceCollider";

  constructor(op = {}, olam) {
    super({ ...op, golem: null, isSolid: true, interactable: false }, olam);
    this.options = op;
    this.targetName = op.targetName || "";
    this._octreeMeshes = [];
    this.useAuthoredY = true;
  }

  async heescheel(olam) {
    this.olam = olam;
    this.mesh = new THREE.Group();
    this.mesh.name = this.name || "VillageFenceCollider_aligned_half_length";
    this.mesh.position.copy(this.position.vector3());
    this.mesh.rotation.y = n(this.rotation?.y, 0);
    this.mesh.userData.awaitingVillageFinalTransform = true;
    const length = n(this.options.length, 11);
    const height = n(this.options.height, 1.15);
    const depth = n(this.options.depth, 0.42);
    const centerX = n(this.options.offsetX, length * 0.5);
    const centerZ = n(this.options.offsetZ, 0);
    this.mesh.add(makeBox(this, "single_simple_fence_rail_collider_aligned", [length, height, depth], [centerX, height / 2, centerZ]));
    await olam.hoyseef(this);
    this.isReady = true;
  }

  alignToFinalFenceTransform(fenceMesh) {
    if (!this.mesh || !fenceMesh?.isObject3D) return false;
    fenceMesh.updateMatrixWorld(true);
    fenceMesh.getWorldPosition(this.mesh.position);
    fenceMesh.getWorldQuaternion(this.mesh.quaternion);
    this.mesh.scale.set(1, 1, 1);
    this.mesh.updateMatrixWorld(true);
    this.mesh.userData.awaitingVillageFinalTransform = false;
    return true;
  }

  addFinalCollidersToOctree(olam = this.olam) {
    if (!olam?.worldOctree || !this.mesh) return 0;
    this.removeFinalCollidersFromOctree(olam);
    const added = [];
    this.mesh.updateMatrixWorld(true);
    this.mesh.traverse(child => { if (child.isMesh && child.userData?.isVillageFenceCollider && olam.worldOctree.addObject(child)) added.push(child); });
    this._octreeMeshes = added;
    return added.length;
  }

  removeFinalCollidersFromOctree(olam = this.olam) {
    if (!olam?.worldOctree) return;
    for (const mesh of this._octreeMeshes) olam.worldOctree.removeMesh?.(mesh);
    this._octreeMeshes = [];
  }
}
