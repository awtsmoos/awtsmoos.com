// B"H
/**
 * @file forest.js
 * @description
 * Chapter 1010: forest spawning routes only to the library hero tree wrapper.
 */
import Domem from "../../chayim/domem/index.js";
export default class Forest extends Domem {
  type = "forest";
  constructor(options = {}, olam) { super({ ...options, isSolid: false, interactable: false }, olam); this.options = options; }
  async heescheel() {
    const count = Math.max(0, Math.floor(Number(this.options.count ?? 12))), radius = Number(this.options.radius ?? 48), origin = this.position || {};
    for (let i = 0; i < count; i++) {
      const angle = i * 2.399963, r = radius * Math.sqrt(((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1);
      const x = Number(origin.x || 0) + Math.cos(angle) * r, z = Number(origin.z || 0) + Math.sin(angle) * r * .72;
      await this.olam.addObject?.("VillageHeroTree", { name: `advanced_library_tree_${this.name || "forest"}_${i}`, position: { x, y: 0, z }, trunkHeight: 7 + (i % 5), leafCount: 680, limbCount: 42, scale: .72 + (i % 4) * .08 });
    }
    this.isReady = true;
  }
}
