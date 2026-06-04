// B"H
/**
 * @file VillageHeroTree.js
 * @description
 * Chapter 29: The world-specific tree bows to the reusable library root.
 * This class is now only a thin Nivra vessel. The actual cinematic Lambert tree
 * generator lives in `geelooy/libs/awtsmoos3d/tree/heroTree.js`, ready for every
 * later village, forest, or dream the Awtsmoos will breathe into existence.
 */
import Domem from "../../chayim/domem/index.js";
import { createHeroTree } from "../../../../../libs/awtsmoos3d/tree/heroTree.js";

export default class VillageHeroTree extends Domem {
  type = "villageHeroTree";
  constructor(op = {}, olam) {
    super({ ...op, isSolid: false, interactable: false }, olam);
    this.options = op;
    this.useAuthoredY = true;
  }

  async heescheel(olam) {
    this.mesh = createHeroTree(this.options);
    await olam.hoyseef(this);
    this.isReady = true;
  }
}
