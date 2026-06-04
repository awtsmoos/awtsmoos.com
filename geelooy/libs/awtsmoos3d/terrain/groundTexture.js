// B"H
/**
 * @file groundTexture.js
 * @description
 * Chapter 72: The earth is no longer painted by canvas, but by a shader vow.
 * The grass, dirt path, and flower speckles are baked once into a render target
 * snapshot and then carried by Lambert ground material.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { bakeShaderTexture } from "../shaderTexture.js?v=shader-snapshot-20260604-bh437";

function rendererFrom(op = {}) {
  return op.renderer || op.olam?.renderer || null;
}

/** @param {Object} op @returns {THREE.Texture} */
export function createVillageGroundTexture(op = {}) {
  const texture = bakeShaderTexture(rendererFrom(op), {
    kind: "ground",
    size: op.size || 512,
    colorA: op.grassDark || 0x486b2f,
    colorB: op.grassLight || 0x8daa52,
    colorC: op.flowerColor || 0xe8d860
  });
  texture.repeat?.set?.(op.repeatX || 1, op.repeatY || 1);
  return texture;
}

/** @param {Object} op @returns {THREE.MeshLambertMaterial} */
export function villageGroundMaterial(op = {}) {
  return new THREE.MeshLambertMaterial({ color: op.color || 0x6f8f3a, map: createVillageGroundTexture(op) });
}
