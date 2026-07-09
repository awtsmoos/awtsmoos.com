// B"H
/** Cheap real grass field: decorative only, low count while gameplay is repaired. */
import Domem from "../../chayim/domem/index.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import TerrainMath from "../terrain/core/TerrainMath.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { finite } from "../../../../../libs/awtsmoos3d/math.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { createGrassField } from "../../../../../libs/awtsmoos3d/foliage/grassField.js?compact=true&v=instanced-lod-grass-no-webgl-warning-20260706-bh1";

function terrainHeight(olam, worldX, worldZ, fallback = 0) {
  const law = olam?.awtsmoosTerrainLaw;
  if (!law?.data) return fallback;
  return finite(law.position?.y) + TerrainMath.calculateHeightAt(worldX - finite(law.position?.x), worldZ - finite(law.position?.z), law.data);
}
function patches(op = {}) {
  const r = Math.min(finite(op.radius, 54), 54);
  return op.patches || [
    { x:finite(op.x, 0), z:finite(op.z, 0), radius:r },
    { x:-42, z:28, radius:r * .36 },
    { x:58, z:42, radius:r * .38 }
  ];
}
function options(op = {}) {
  return {
    ...op,
    patches:patches(op),
    count:Math.min(Math.max(finite(op.debugCount, 900), 320), 1200),
    tallRatio:.24,
    flowerRatio:.08,
    groundLift:finite(op.groundLift, .018),
    name:op.name || "VillageGrassField_low_cost_real_grass"
  };
}

export default class VillageGrassField extends Domem {
  type = "villageGrassField";
  constructor(op = {}, olam) {
    super({ ...op, isSolid:false, interactable:false }, olam);
    this.options = op;
    this.useAuthoredY = true;
  }
  async heescheel(olam) {
    const op = options(this.options);
    this.mesh = createGrassField(op, (x, z) => terrainHeight(olam, x, z, finite(op.groundY)));
    this.mesh.name = `${op.name}_decorative_only`;
    Object.assign(this.mesh.userData ||= {}, { denseGrass:true, lodGrass:true, decorativeOnly:true, skipOctree:true, noOctree:true, addToOctree:false, count:op.count, patches:op.patches.length });
    await olam.hoyseef(this);
    this.isReady = true;
  }
}
