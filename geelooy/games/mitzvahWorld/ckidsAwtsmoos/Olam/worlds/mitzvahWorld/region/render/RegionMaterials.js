// B"H
/** @file RegionMaterials.js @description Cached grainy procedural materials for every named ecology vessel. */
import * as THREE from "/games/scripts/build/three.module.js";
import { materialWithTexture } from "../../materials/ProceduralTextureKit.js?v=intense-dirt-grain-20260615-bh904";
const cache = new Map();
const ALIASES = Object.freeze({
  grass:"grass", cabbageLeaf:"leaf", leaf:"leaf", mossPatch:"grass", frogSkin:"leaf", onionSkin:"leaf",
  straw:"dirt", dirt:"dirt", packedEarth:"dirt", leafTrail:"leaf", softTrail:"dirt", carrotSkin:"dirt", potatoSkin:"dirt",
  yellowBrick:"brick", brick:"brick", graniteRock:"stone", slateStone:"stone", marbleWhite:"stone", stoneDust:"stone", horn:"stone", eyeBlack:"stone",
  wood:"wood", darkWood:"wood", barkOak:"wood", barkPine:"wood", goldHammered:"gold", lampShade:"gold",
  daisyPetal:"flower", lavenderFlower:"flower", mushroomCap:"flower", cottonFiber:"fabric", linenFabric:"fabric", muzzleWhite:"fabric", muzzle:"fabric", darkSock:"fabric", tailTip:"fabric",
  foxFur:"fur", rabbitFur:"fur", deerFur:"fur", goatFur:"fur", birdFeather:"fur"
});
function kindFor(kind) { return ALIASES[kind] || kind || "stone"; }
function optionKey(kind, options) {
  const side = options.side === undefined ? THREE.FrontSide : options.side;
  return String(kind) + ":" + (options.simple ? 1 : 0) + ":" + side + ":" + (options.alphaTest || 0);
}
export function regionMaterial(kind = "grass", options = {}) {
  const key = optionKey(kind, options);
  if (cache.has(key)) return cache.get(key);
  const side = options.side === undefined ? THREE.FrontSide : options.side;
  const simple = Boolean(options.simple);
  const size = kind === "grass" || kind === "cabbageLeaf" ? 512 : simple ? 192 : 384;
  const mat = materialWithTexture(kindFor(kind), { side, size, alphaTest:options.alphaTest || 0 });
  mat.name = `textured_region_material_${kind}`;
  mat.userData = { kind, resolvedKind:kindFor(kind), noSolidColor:true, proceduralTexture:true, grainyNoise:true };
  cache.set(key, mat);
  return mat;
}
export function materialStats() { return { materials:cache.size, aliases:Object.keys(ALIASES).length, allTextured:true, grainyNoise:true }; }


