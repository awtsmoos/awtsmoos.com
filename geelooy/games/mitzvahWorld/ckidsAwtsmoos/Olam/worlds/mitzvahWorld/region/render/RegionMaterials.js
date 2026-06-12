// B"H
/** @file RegionMaterials.js @description Shared region material bridge. */
import * as THREE from "/games/scripts/build/three.module.js";
import { ecologyMaterial } from "../../../../../dvarim/nature/villagePicture/EcologySpecialMaterials.js?v=complete-v3-ecology-materials-fast-20260612-bh4";
import { rvMaterial } from "../../../../../dvarim/nature/villagePicture/RealisticVillageMaterials.js?v=webgl-progress-materials-20260612-bh1";
const cache = new Map();
export function regionMaterial(kind = "grass", options = {}) {
  const key = `${kind}:${options.simple ? 1 : 0}:${options.unlit ? 1 : 0}`;
  if (cache.has(key)) return cache.get(key);
  const ecology = ["barkOak", "barkPine", "graniteRock", "slateStone", "mossPatch", "daisyPetal", "lavenderFlower", "cabbageLeaf", "carrotSkin", "potatoSkin", "onionSkin", "goldHammered", "marbleWhite", "cottonFiber", "linenFabric", "mushroomCap"];
  const mat = ecology.includes(kind) ? ecologyMaterial(kind, { simple: options.simple ?? true, unlit: options.unlit, repeat: options.repeat || 2 }) : rvMaterial(kind, { simple: options.simple ?? true, unlit: options.unlit, repeat: options.repeat || 2 });
  mat.side = options.side ?? mat.side ?? THREE.FrontSide; cache.set(key, mat); return mat;
}
export function materialStats() { return { materials: cache.size }; }


