// B"H
/**
 * @file VillageHeroTree.js
 * @description
 * Chapter 79: The tree wrapper gives the renderer to the bark and leaf forge.
 * Its Lambert maps are shader-baked snapshots, not canvas textures.
 */
import Domem from "../../chayim/domem/index.js";
import { createHeroTree } from "../../../../../libs/awtsmoos3d/tree/heroTree.js?v=shader-tree-20260604-bh437";

export default class VillageHeroTree extends Domem {
  type = "villageHeroTree";
  constructor(op = {}, olam) {
    super({ ...op, isSolid: false, interactable: false }, olam);
    this.options = op;
    this.useAuthoredY = true;
  }

  async heescheel(olam) {
    this.mesh = createHeroTree(this.options, { renderer: olam?.renderer });
    await olam.hoyseef(this);
    this.isReady = true;
  }
}
