// B"H
/** @file VillageHeroTree.js @description Tree archetype backed by procedural-core visual tree plus a real octree trunk collider. */
import Domem from "../../chayim/domem/index.js";
import { buildAdvancedTree, registerTreeTrunkColliders } from "../../Olam/worlds/mitzvahWorld/region/render/AdvancedTreeOnly.js?v=exclusive-procedural-core-tree-20260614-bh4";
function n(value, fallback = 0) { return Number.isFinite(Number(value)) ? Number(value) : fallback; }
function posOf(tree) { return tree && tree.position ? tree.position : {}; }
export default class VillageHeroTree extends Domem {
  type = "villageHeroTree";
  constructor(op = {}, olam) { super(Object.assign({}, op, { isSolid:false, interactable:false }), olam); this.options = op; this.useAuthoredY = true; }
  async heescheel(olam) {
    const p = posOf(this), x = n(p.x, n(this.options.x, 34)), z = n(p.z, n(this.options.z, 34)), y = n(p.y, n(this.options.y, n(this.options.groundY, 0)));
    this.mesh = buildAdvancedTree(olam, Object.assign({}, this.options, { x, y, z, name:this.options.name || "VillageHeroTree_PROCEDURAL_CORE_ONLY" }), 0);
    await olam.hoyseef(this);
    this.trunkColliders = registerTreeTrunkColliders(this.mesh, olam);
    this.mesh.userData.trunkColliderReport = { count:this.trunkColliders.length, names:this.trunkColliders };
    this.isReady = true;
  }
}
