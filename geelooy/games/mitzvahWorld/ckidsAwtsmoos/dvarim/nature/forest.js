// B"H
/** @file forest.js @description Forest spawning routes only to VillageHeroTree, whose body is procedural-core. */
import Domem from "../../chayim/domem/index.js";
function n(value, fallback = 0) { return Number.isFinite(Number(value)) ? Number(value) : fallback; }
function hash(i) { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); }
export default class Forest extends Domem {
  type = "forest";
  constructor(options = {}, olam) { super(Object.assign({}, options, { isSolid:false, interactable:false }), olam); this.options = options; }
  async heescheel() { const count = Math.max(0, Math.floor(n(this.options.count, 12))), radius = n(this.options.radius, 48), origin = this.position || {}; for (let i = 0; i < count; i++) { const angle = i * 2.399963, r = radius * Math.sqrt(hash(i)); const x = n(origin.x) + Math.cos(angle) * r, z = n(origin.z) + Math.sin(angle) * r * .72; const kind = i % 5 === 0 ? "pine" : i % 7 === 0 ? "apple" : "oak"; if (this.olam && typeof this.olam.addObject === "function") await this.olam.addObject("VillageHeroTree", { name:`procedural_core_forest_tree_${this.name || "forest"}_${i}`, position:{ x, y:0, z }, kind, species:kind, age:i % 11 === 0 ? "ancient" : "mature", scale:.72 + (i % 4) * .08, useAuthoredY:false }); } this.isReady = true; }
}
