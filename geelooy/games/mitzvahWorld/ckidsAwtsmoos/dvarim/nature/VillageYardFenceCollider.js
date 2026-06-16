// B"H
/** @file VillageYardFenceCollider.js @description Collider-only parcel fence body vessel. */
import Domem from "../../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";
import { fenceColliderManifest } from "./YardFenceColliderBuilder.js";
export default class VillageYardFenceCollider extends Domem {
  type = "villageYardFenceCollider";
  constructor(op = {}, olam) { super({ ...op, golem: null, isSolid: false, interactable: false }, olam); this.segments = op.segments || []; this.colliders = []; }
  async heescheel(olam) { this.olam = olam; this.mesh = new THREE.Group(); this.mesh.name = this.name || "parcel_yard_fence_colliders"; this.colliders = fenceColliderManifest(this.segments); for (const c of this.colliders) { this.mesh.add(c); olam.worldOctree?.addObject?.(c); } this.mesh.visible = Boolean(globalThis.__AWTSMOOS_SHOW_REGION_COLLIDERS__); await olam.hoyseef(this); this.isReady = true; }
}
