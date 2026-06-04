// B"H
/**
 * @file canvas.js
 * @deprecated
 * @description
 * Chapter 83: The old canvas vessel is sealed and made harmless.
 * Procedural textures in `awtsmoos3d` now belong to shader snapshots, not DOM or
 * OffscreenCanvas paint. This compatibility module remains only so stale imports
 * fail soft with a tiny DataTexture instead of resurrecting `document` access.
 */
import * as THREE from "/games/scripts/build/three.module.js";

/** @param {number} color */
export function solidTexture(color = 0xffffff) {
  const data = new Uint8Array([(color >> 16) & 255, (color >> 8) & 255, color & 255, 255]);
  const texture = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  texture.userData.awtsmoosDeprecatedCanvasFallback = true;
  return texture;
}

/** @returns {{canvas:null,ctx:null}} */
export function makeCanvas() {
  return { canvas: null, ctx: null };
}

/** @param {Function} _draw @param {number} _size @param {number} _repeat @param {number} fallbackColor */
export function textureFromCanvas(_draw, _size = 128, _repeat = 1, fallbackColor = 0xffffff) {
  return solidTexture(fallbackColor);
}
