// B"H
/**
 * @file lambert.js
 * @description
 * Chapter 71: Lambert receives shader-born texture snapshots.
 * Materials remain cheap Lambert/Basic for the world, but every diffuse pattern
 * is baked by a custom shader once through `shaderTexture.js`, then reused.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { bakeShaderTexture } from "./shaderTexture.js?v=shader-snapshot-20260604-bh437";

function rendererFrom(ctx) {
  return ctx?.renderer || ctx?.olam?.renderer || ctx;
}

/** @returns {THREE.MeshLambertMaterial} */
export function lambertBark(color = 0x5a351d, ctx = {}) {
  const map = bakeShaderTexture(rendererFrom(ctx), { kind: "bark", size: 128, colorA: color, colorB: 0x8a5a31, colorC: 0x2e180b });
  return new THREE.MeshLambertMaterial({ color, map });
}

/** @returns {THREE.MeshLambertMaterial} */
export function lambertNoise(color = 0xb8a886, base = 0xb8aa89, ctx = {}) {
  const baseColor = typeof base === "number" ? base : color;
  const map = bakeShaderTexture(rendererFrom(ctx), { kind: "noise", size: 128, colorA: baseColor, colorB: color, colorC: 0xf2dfb0 });
  return new THREE.MeshLambertMaterial({ color, map });
}

/** @returns {THREE.MeshLambertMaterial} */
export function lambertLeaf(color = 0x5fa83a, ctx = {}) {
  const map = bakeShaderTexture(rendererFrom(ctx), { kind: "leaf", size: 96, colorA: color, colorB: 0xa6d86a, colorC: 0x284d1e });
  return new THREE.MeshLambertMaterial({ color, map, side: THREE.DoubleSide, alphaTest: 0.18 });
}

/** @returns {THREE.MeshBasicMaterial} */
export function basicGlow(color = 0xffc46b, opacity = 0.42) {
  return new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide });
}
