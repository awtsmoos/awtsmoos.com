// B"H
/**
 * @file VillageGrassField.js
 * @description
 * Chapter 33: Grass leaves the one-off meadow and enters the shared library.
 * The Mitzvah World Nivra now only samples terrain height and delegates dense
 * mobile-safe blades/flowers to `geelooy/libs/awtsmoos3d/foliage/grassField.js`.
 */
import Domem from "../../chayim/domem/index.js";
import TerrainMath from "../terrain/core/TerrainMath.js";
import { finite } from "../../../../../libs/awtsmoos3d/math.js";
import { createGrassField } from "../../../../../libs/awtsmoos3d/foliage/grassField.js";

function terrainHeight(olam, worldX, worldZ, fallback = 0) {
  const law = olam?.awtsmoosTerrainLaw;
  if (law?.data) {
    return finite(law.position?.y) + TerrainMath.calculateHeightAt(worldX - finite(law.position?.x), worldZ - finite(law.position?.z), law.data);
  }
  return fallback;
}

export default class VillageGrassField extends Domem {
  type = "villageGrassField";
  constructor(op = {}, olam) {
    super({ ...op, isSolid: false, interactable: false }, olam);
    this.options = op;
    this.useAuthoredY = true;
  }

  async heescheel(olam) {
    const op = this.options;
    this.mesh = createGrassField(op, (x, z) => terrainHeight(olam, x, z, finite(op.groundY)));
    await olam.hoyseef(this);
    this.isReady = true;
  }
}
