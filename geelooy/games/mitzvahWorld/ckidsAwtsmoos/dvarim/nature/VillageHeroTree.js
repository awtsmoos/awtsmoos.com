// B"H
/** Village hero tree: real procedural-core generator, Chai Forest bitmap textures. */
import Domem from "../../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";
import { createHeroTree } from "/libs/awtsmoos3d/tree/heroTree.js?v=procedural-core-chai-worker-safe-20260707-bh2";
import { ACTUAL_TEXTURES, namedTexture } from "../../../geelooy/libs/awtsmoosCinematicWorld/assets/ChaiForestStaticAssets.js";
const n = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const kindFor = v => /pine|cedar/i.test(v) ? "pine" : /apple/i.test(v) ? "apple" : /willow/i.test(v) ? "willow" : "oak";
export default class VillageHeroTree extends Domem {
  type = "villageHeroTree";
  constructor(op = {}, olam) { super({ ...op, isSolid:false, interactable:false }, olam); this.options = op; this.useAuthoredY = true; }
  async heescheel(olam) {
    const p = this.position || {}, op = this.options || {};
    const x = n(p.x, n(op.x, 34)), y = n(p.y, n(op.y, n(op.groundY, 0))), z = n(p.z, n(op.z, 34));
    this.mesh = createHeroTree({ ...op, name:op.name || "VillageHeroTree_procedural_core_chai", kind:kindFor(op.kind || op.species || "oak"), x, y, z, scale:n(op.scale, .82), rotationY:n(op.rotationY, 0), barkMapUrl:namedTexture(ACTUAL_TEXTURES.bark, true), leafMapUrl:namedTexture(ACTUAL_TEXTURES.leaf, true) }, { olam, renderer:olam?.renderer });
    this.mesh.userData.villageHeroTree = true; this.mesh.userData.noOldGeneratedTree = true; this.mesh.userData.workerSafeBitmapTextures = true;
    this.mesh.traverse(child => { child.userData ||= {}; if (!child.userData.isTreeTrunkCollider) Object.assign(child.userData, { skipRaycast:true, skipOctree:true, noOctree:true, villageDecor:true, chaiForestTree:true }); });
    await olam.hoyseef(this); this.isReady = true;
  }
}
