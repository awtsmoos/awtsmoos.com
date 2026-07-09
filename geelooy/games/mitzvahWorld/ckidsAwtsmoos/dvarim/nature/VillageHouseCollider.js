// B"H
/**
 * @file VillageHouseCollider.js
 * @description Legacy data compatibility only. Houses no longer create invisible collider slabs.
 */
import Domem from "../../chayim/domem/index.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
export default class VillageHouseCollider extends Domem {
  type = "villageHouseCollider";
  constructor(op = {}, olam) { super({ ...op, golem:null, isSolid:false, interactable:false }, olam); this.options = op; this.useAuthoredY = true; this._octreeMeshes = []; }
  async heescheel(olam) { this.olam = olam; this.mesh = new THREE.Group(); this.mesh.name = this.name || "VillageHouseCollider_disabled_visible_mesh_only"; Object.assign(this.mesh.userData ||= {}, { disabledInvisibleHouseCollider:true, skipOctree:true, noOctree:true, reason:"visible cottage triangles are the collider" }); this.mesh.position.copy(this.position.vector3()); await olam.hoyseef(this); this.isReady = true; }
  alignToFinalHouseTransform() { this.mesh && (this.mesh.userData.awaitingVillageFinalTransform = false); return true; }
  addFinalCollidersToOctree() { return 0; }
  removeFinalCollidersFromOctree() { this._octreeMeshes = []; }
  floorTopWorldY() { return Number(this.mesh?.position?.y) || 0; }
}
