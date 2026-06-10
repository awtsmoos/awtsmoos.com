// B"H
/**
 * @file VillageFenceCollider.js
 * @description
 * Chapter 539: The fence collider now mirrors the decorative fence recipe.
 *
 * The visual fence recipe starts at local x=0, places posts every 0.92 units,
 * and puts rails at local midpoint. The collider now uses that same origin,
 * count, scale, and rotation. No guessed world-center. No copied final prop.
 */
import Domem from "../../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";
import { bakeDetachedCollider, removeDetachedColliders } from "./OctreeBakeClone.js";
const n = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const hiddenMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0, depthWrite: false, depthTest: false });
function makeBody(owner, name, size, pos) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), hiddenMat.clone());
  mesh.name = `${owner.name || 'village_fence'}_${name}`;
  mesh.visible = true;
  mesh.position.set(...pos);
  mesh.nivraAwtsmoos = owner;
  Object.assign(mesh.userData ||= {}, { isSolid: true, explicitCollision: true, collisionBody: true, addToOctree: true, isVillageFenceCollider: true, authoredFenceCollider: true, useAuthoredY: true, keepOriginalCollider: true, useExactGeometryCollider: true });
  return mesh;
}
export default class VillageFenceCollider extends Domem {
  type = "villageFenceCollider";
  constructor(op = {}, olam) {
    super({ ...op, golem: null, isSolid: false, interactable: false }, olam);
    this.options = op; this.targetName = op.targetName || ""; this._octreeMeshes = []; this.useAuthoredY = true;
    this.count = Math.max(2, Math.floor(n(op.count, 10))); this.spacing = n(op.spacing, 0.92); this.height = n(op.height, 1.24); this.depth = n(op.depth, 0.52); this.scaleValue = n(op.scale, 1);
  }
  async heescheel(olam) {
    this.olam = olam;
    this.mesh = new THREE.Group();
    this.mesh.name = this.name || "VillageFenceCollider_recipe_mirror";
    this.mesh.position.copy(this.position.vector3());
    this.mesh.rotation.set(n(this.rotation?.x, 0), n(this.rotation?.y, 0), n(this.rotation?.z, 0));
    this.mesh.scale.setScalar(this.scaleValue);
    Object.assign(this.mesh.userData ||= {}, { skipOctree: true, noOctree: true, useAuthoredY: true, authoredFenceCollider: true, fenceRecipeMirror: true });
    const len = this.count * this.spacing;
    const mid = (this.count - 1) * this.spacing * 0.5;
    this.mesh.add(makeBody(this, 'low_rail_octree', [len, 0.26, this.depth], [mid, 0.45, 0]));
    this.mesh.add(makeBody(this, 'upper_rail_octree', [len, 0.3, this.depth], [mid, 0.82, 0]));
    this.mesh.add(makeBody(this, 'post_band_octree', [len, this.height, this.depth * 0.76], [mid, this.height * 0.5, 0]));
    await olam.hoyseef(this);
    this.addFinalCollidersToOctree(olam);
    this.isReady = true;
  }
  alignToFinalFenceTransform() { return true; }
  addFinalCollidersToOctree(olam = this.olam) {
    if (!olam?.worldOctree || !this.mesh) return 0;
    this.removeFinalCollidersFromOctree(olam);
    const added = [];
    this.mesh.updateMatrixWorld(true);
    this.mesh.traverse(child => { if (child.isMesh && child.userData?.isVillageFenceCollider) bakeDetachedCollider(child, olam, added); });
    this._octreeMeshes = added;
    console.info("B\"H | FENCE_RECIPE_MIRROR_COLLIDERS_ADDED", { name: this.name, added: added.length, targetName: this.targetName, count: this.count, scale: this.scaleValue, origin: this.mesh.position, rotationY: this.mesh.rotation.y });
    return added.length;
  }
  removeFinalCollidersFromOctree(olam = this.olam) { removeDetachedColliders(olam, this._octreeMeshes); this._octreeMeshes = []; }
}
