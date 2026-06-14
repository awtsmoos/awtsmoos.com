// B"H
/**
 * @file VillageHeroTree.js
 * @description Chapter 1022: dvarim tree wrapper uses the same approved tree API.
 */
import Domem from "../../chayim/domem/index.js";
import { buildAdvancedTree } from "../../Olam/worlds/mitzvahWorld/region/render/AdvancedTreeOnly.js?v=advanced-tree-only-20260614-bh1";
const n = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
export default class VillageHeroTree extends Domem {
  type = "villageHeroTree";
  constructor(op = {}, olam) { super({ ...op, isSolid: false, interactable: false }, olam); this.options = op; this.useAuthoredY = true; }
  async heescheel(olam) { const x = n(this.position?.x, this.options.x || 34), z = n(this.position?.z, this.options.z || 34), y = n(this.position?.y, this.options.y || this.options.groundY || 0); this.mesh = buildAdvancedTree(olam, { ...this.options, x, y, z, name: this.options.name || "VillageHeroTree_APPROVED_TREE_API" }, 0); await olam.hoyseef(this); this.isReady = true; }
}
