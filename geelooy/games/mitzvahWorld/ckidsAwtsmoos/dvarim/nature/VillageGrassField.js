// B"H
/**
 * @file VillageGrassField.js
 * @description
 * Chapter 547: the village imports the one-time shader meadow.
 * Android Chrome no longer asks for atlas images for grass. The field uses the
 * shared Awtsmoos shader material and stays decorative, finite, and untouchable
 * to raycasts.
 */
import Domem from "../../chayim/domem/index.js";
import TerrainMath from "../terrain/core/TerrainMath.js";
import { finite } from "../../../../../libs/awtsmoos3d/math.js";
import { createGrassField } from "../../../../../libs/awtsmoos3d/foliage/grassField.js?v=one-time-shader-grass-20260612-bh1";
function terrainHeight(olam, worldX, worldZ, fallback = 0) {
  const law = olam?.awtsmoosTerrainLaw;
  if (law?.data) return finite(law.position?.y) + TerrainMath.calculateHeightAt(worldX - finite(law.position?.x), worldZ - finite(law.position?.z), law.data);
  return fallback;
}
export default class VillageGrassField extends Domem {
  type = "villageGrassField";
  constructor(op = {}, olam) { super({ ...op, isSolid: false, interactable: false }, olam); this.options = op; this.useAuthoredY = true; }
  async heescheel(olam) {
    const op = { ...this.options, count: Math.min(finite(this.options.count, 1400), 1400), tallRatio: Math.min(finite(this.options.tallRatio, 0.18), 0.2), flowerRatio: Math.min(finite(this.options.flowerRatio, 0.14), 0.16) };
    this.mesh = createGrassField(op, (x, z) => terrainHeight(olam, x, z, finite(op.groundY)));
    this.mesh.name = `${op.name || 'VillageGrassField'}_one_time_shader_grass`;
    await olam.hoyseef(this);
    this.isReady = true;
  }
}
