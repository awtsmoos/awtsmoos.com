// B"H
/**
 * @file VillageForestField.js
 * @description Many village trees through one instanced LOD forest vessel.
 */
import Domem from "../../chayim/domem/index.js";
import TerrainMath from "../terrain/core/TerrainMath.js";
import { finite } from "../../../../../libs/awtsmoos3d/math.js";
import { createForestField } from "../../../../../libs/awtsmoos3d/foliage/forestField.js?v=village-lod-forest-20260706-bh1";

function terrainHeight(olam, worldX, worldZ, fallback = 0) {
  const law = olam?.awtsmoosTerrainLaw;
  if (law?.data) return finite(law.position?.y) + TerrainMath.calculateHeightAt(worldX - finite(law.position?.x), worldZ - finite(law.position?.z), law.data);
  return fallback;
}
function defaultPatches(op = {}) {
  return op.patches || [
    { x:-82, z:-58, radius:42 }, { x:88, z:-62, radius:44 },
    { x:-96, z:68, radius:48 }, { x:102, z:70, radius:50 },
    { x:-34, z:-82, radius:32 }, { x:42, z:88, radius:38 },
    { x:-56, z:16, radius:28 }, { x:70, z:20, radius:28 }
  ];
}
function forestOptions(op = {}) {
  return { ...op, patches:defaultPatches(op), count:Math.min(Math.max(finite(op.count, 260), 120), 520), scale:finite(op.scale, 1.15), seed:finite(op.seed, 613), name:op.name || "village_many_trees_three_draw_lod_forest" };
}
export default class VillageForestField extends Domem {
  type = "villageForestField";
  constructor(op = {}, olam) { super({ ...op, isSolid:false, interactable:false }, olam); this.options = op; this.useAuthoredY = true; }
  async heescheel(olam) {
    const op = forestOptions(this.options);
    this.mesh = createForestField(op, (x, z) => terrainHeight(olam, x, z, finite(op.groundY)));
    this.mesh.userData ||= {};
    Object.assign(this.mesh.userData, { denseTreeLod:true, treeCount:op.count, patches:op.patches.length });
    await olam.hoyseef(this);
    this.isReady = true;
  }
}
