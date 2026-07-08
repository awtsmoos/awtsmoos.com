// B"H
/** Forest spawner: every tree request becomes a Chai Forest bark/leaf tree. */
import Domem from "../../chayim/domem/index.js";
const n = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
function hash(i) { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); }
export default class Forest extends Domem {
  type = "forest";
  constructor(options = {}, olam) { super({ ...options, isSolid:false, interactable:false }, olam); this.options = options; }
  async heescheel() {
    const count = Math.max(0, Math.floor(n(this.options.count, 12))), radius = n(this.options.radius, 48), origin = this.position || {};
    for (let i = 0; i < count; i += 1) {
      const angle = i * 2.399963, r = radius * Math.sqrt(hash(i));
      const x = n(origin.x) + Math.cos(angle) * r, z = n(origin.z) + Math.sin(angle) * r * .72;
      const kind = i % 5 === 0 ? "pine" : i % 7 === 0 ? "oak" : "mixed";
      await this.olam?.addObject?.("VillageHeroTree", { name:`chai_forest_tree_${this.name || "forest"}_${i}`, position:{ x, y:0, z }, kind, species:kind, scale:.72 + (i % 4) * .08, useAuthoredY:false });
    }
    this.isReady = true;
  }
}
