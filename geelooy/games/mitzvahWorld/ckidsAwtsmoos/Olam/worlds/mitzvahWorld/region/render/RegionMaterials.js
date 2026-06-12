// B"H
/**
 * @file RegionMaterials.js
 * @description Chapter 997: region runtime uses instant shared materials first.
 * Shader warming belongs after proof; runtime boot gets fast colored vessels.
 */
import * as THREE from "/games/scripts/build/three.module.js";

const cache = new Map();
const COLORS = Object.freeze({
  grass: 0x4f8f3a, straw: 0xd3b35f, daisyPetal: 0xffffff, lavenderFlower: 0x9275d8,
  barkOak: 0x6b4325, barkPine: 0x58402a, leaf: 0x3f8d3d, graniteRock: 0x8e8b82,
  slateStone: 0x707783, mossPatch: 0x557a3a, yellowBrick: 0xd9b84c, dirt: 0x8a5f35,
  darkWood: 0x4b2d1a, lampShade: 0xffd487, cabbageLeaf: 0x5f9e42, carrotSkin: 0xd7772f,
  potatoSkin: 0xb08a5c, onionSkin: 0xc99d66, goldHammered: 0xd7b34a, marbleWhite: 0xe9e0ce,
  cottonFiber: 0xf4efe0, linenFabric: 0xd8cfb2, mushroomCap: 0xb46b5e, packedEarth: 0x89613f,
  leafTrail: 0x596f35, softTrail: 0x726244, stoneDust: 0x8b8779, wood: 0x6f4829
});

export function regionMaterial(kind = "grass", options = {}) {
  const key = `${kind}:${options.simple ? 1 : 0}:${options.unlit ? 1 : 0}:${options.side || 0}`;
  if (cache.has(key)) return cache.get(key);
  const color = COLORS[kind] || COLORS.grass;
  const args = { color, side: options.side ?? THREE.FrontSide };
  const mat = options.unlit ? new THREE.MeshBasicMaterial(args) : new THREE.MeshLambertMaterial(args);
  mat.name = `fast_region_material_${kind}`;
  cache.set(key, mat);
  return mat;
}

export function materialStats() { return { materials: cache.size, fast: true }; }
