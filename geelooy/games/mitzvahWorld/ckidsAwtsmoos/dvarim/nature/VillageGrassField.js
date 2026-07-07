// B"H
/**
 * @file VillageGrassField.js
 * @description Dense instanced LOD grass, grounded to terrain, with no custom shader errors.
 */
import Domem from "../../chayim/domem/index.js";
import TerrainMath from "../terrain/core/TerrainMath.js";
import { finite } from "../../../../../libs/awtsmoos3d/math.js";
import { createGrassField } from "../../../../../libs/awtsmoos3d/foliage/grassField.js?v=instanced-lod-grass-no-webgl-warning-20260706-bh1";

function terrainHeight(olam, worldX, worldZ, fallback = 0) {
  const law = olam?.awtsmoosTerrainLaw;
  if (law?.data) return finite(law.position?.y) + TerrainMath.calculateHeightAt(worldX - finite(law.position?.x), worldZ - finite(law.position?.z), law.data);
  return fallback;
}
function defaultPatches(op = {}) {
  const radius = finite(op.radius, 72);
  return op.patches || [
    { x:finite(op.x, 0), z:finite(op.z, 0), radius }, { x:-42, z:28, radius:radius * 0.46 },
    { x:58, z:42, radius:radius * 0.52 }, { x:-110, z:-38, radius:radius * 0.38 },
    { x:124, z:70, radius:radius * 0.42 }
  ];
}
function meadowOptions(op = {}, olam) {
  const q = olam?.quality?.foliage || olam?.quality?.preset || "high";
  const cap = q === "low" ? 2600 : q === "medium" ? 4200 : 6200;
  return { ...op, patches:defaultPatches(op), count:Math.min(Math.max(finite(op.count, 5200), 2400), cap), tallRatio:Math.min(Math.max(finite(op.tallRatio, 0.34), 0.24), 0.42), flowerRatio:Math.min(Math.max(finite(op.flowerRatio, 0.2), 0.12), 0.24), groundLift:finite(op.groundLift, 0.018), flowerColor:op.flowerColor || 0xffef7a, flowerAltColor:op.flowerAltColor || 0xffb7e6, name:op.name || "VillageGrassField_dense_instanced_lod_meadow" };
}
export default class VillageGrassField extends Domem {
  type = "villageGrassField";
  constructor(op = {}, olam) { super({ ...op, isSolid:false, interactable:false }, olam); this.options = op; this.useAuthoredY = true; }
  async heescheel(olam) {
    const op = meadowOptions(this.options, olam);
    this.mesh = createGrassField(op, (x, z) => terrainHeight(olam, x, z, finite(op.groundY)));
    this.mesh.name = `${op.name}_lots_of_lod_blades`;
    this.mesh.userData ||= {};
    Object.assign(this.mesh.userData, { denseGrass:true, lodGrass:true, count:op.count, patches:op.patches.length });
    await olam.hoyseef(this);
    this.isReady = true;
  }
}
