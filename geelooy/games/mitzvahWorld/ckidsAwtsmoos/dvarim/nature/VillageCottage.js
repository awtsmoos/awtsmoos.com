// B"H
/**
 * @file VillageCottage.js
 * @description The rendered brick cottage itself is inserted into the octree; no parallel invisible house shell.
 */
import Domem from "../../chayim/domem/index.js?compact=true&v=visible-house-triangle-octree-20260708-bh2";
import { createCottage } from "../../../../../libs/awtsmoos3d/buildings/cottage.js?compact=true&v=visible-house-triangle-octree-20260708-bh2";
function bindOwner(root, owner) {
  root?.traverse?.(child => {
    child.nivraAwtsmoos = owner;
    if (child.userData?.visibleCollisionSource) Object.assign(child.userData, {
      isSolid: true,
      explicitCollision: true,
      addToOctree: true,
      skipOctree: false,
      noOctree: false,
      useExactGeometryCollider: true
    });
  });
}
export default class VillageCottage extends Domem {
  type = "villageCottage";
  constructor(op = {}, olam) {
    super({ ...op, isSolid: false, interactable: false }, olam);
    this.options = op;
    this.useAuthoredY = true;
    this._visibleOctreeAdded = false;
  }
  async heescheel(olam) {
    this.mesh = createCottage(this.options, { renderer: olam?.renderer });
    bindOwner(this.mesh, this);
    await olam.hoyseef(this);
    this.mesh.updateMatrixWorld(true);
    this._visibleOctreeAdded = Boolean(olam?.worldOctree?.addObject?.(this.mesh));
    this.mesh.userData.visibleHouseOctreeReport = { added: this._visibleOctreeAdded, at: Date.now() };
    this.isReady = true;
  }
}
