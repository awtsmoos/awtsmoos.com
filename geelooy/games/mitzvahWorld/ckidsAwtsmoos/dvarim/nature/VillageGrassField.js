// B"H
/**
 * @file VillageGrassField.js
 * @description
 * Chapter 544: The composed village grass imports the mobile-safe meadow with a
 * fresh cache seal, so phone Chrome cannot keep the old black-scratch shader.
 */
import Domem from "../../chayim/domem/index.js";
import TerrainMath from "../terrain/core/TerrainMath.js";
import { finite } from "../../../../../libs/awtsmoos3d/math.js";
import { createGrassField } from "../../../../../libs/awtsmoos3d/foliage/grassField.js?v=mobile-no-black-grass-20260609-bh544";
function terrainHeight(olam, worldX, worldZ, fallback = 0) {
  const law = olam?.awtsmoosTerrainLaw;
  if (law?.data) return finite(law.position?.y) + TerrainMath.calculateHeightAt(worldX - finite(law.position?.x), worldZ - finite(law.position?.z), law.data);
  return fallback;
}
export default class VillageGrassField extends Domem {
  type = "villageGrassField";
  constructor(op = {}, olam) { super({ ...op, isSolid: false, interactable: false }, olam); this.options = op; this.useAuthoredY = true; }
  async heescheel(olam) {
    const op = { ...this.options, count: Math.min(finite(this.options.count, 1600), 1600), tallRatio: Math.min(finite(this.options.tallRatio, 0.16), 0.16), flowerRatio: Math.min(finite(this.options.flowerRatio, 0.18), 0.18) };
    this.mesh = createGrassField(op, (x, z) => terrainHeight(olam, x, z, finite(op.groundY)));
    this.mesh.name = `${op.name || 'VillageGrassField'}_mobile_safe_no_black`;
    await olam.hoyseef(this);
    this.isReady = true;
  }
}
