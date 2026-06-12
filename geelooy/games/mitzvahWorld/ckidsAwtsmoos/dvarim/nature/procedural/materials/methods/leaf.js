/**
 * B"H
 * @file leaf.js
 * @module LeafMaterialGenerator
 * @description
 * Chapter 41: the branches wear the atlas of leaves.
 *
 * The Awtsmoos revealed a sheet of many oak-leaf spirits. This material uses
 * `assets/textures/village/leaf-atlas.png` directly, so procedural trees stop
 * glowing like generated blobs and begin reading as layered, hand-painted leaf
 * clusters across the whole village.
 */

const LEAF_ATLAS = '/games/mitzvahWorld/assets/textures/village/leaf-atlas.png';

/** @param {object} olam World texture loader. @returns {Promise<object>} Material recipe. */
export default async function createLeaf(olam) {
  let leafTex = null;
  if (olam && typeof olam.loadTexture === 'function') {
    try {
      leafTex = await olam.loadTexture({ url: LEAF_ATLAS, shouldRepeat: true, repeatX: 2, repeatY: 2 });
    } catch (error) {
      if (globalThis.__AWTSMOOS_DEBUG__ === true) console.warn('B"H | village leaf atlas fallback', error);
    }
  }

  return {
    type: 'Standard',
    properties: {
      color: 0xffffff,
      map: leafTex,
      roughness: 0.92,
      metalness: 0.0,
      side: 2,
      transparent: true,
      alphaTest: 0.42
    },
    snippets: {
      onBeforeCompile: `
        varying vec2 vUv;
        void main() {
          vec4 atlasLeaf = gl_FragColor;
          float bladeAlpha = atlasLeaf.a;
          if (bladeAlpha < 0.42) discard;
          vec2 c = fract(vUv * 2.0) - 0.5;
          float vein = 1.0 - smoothstep(0.015, 0.055, abs(c.x));
          gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * 0.68, vein * 0.18);
          gl_FragColor.a = bladeAlpha;
        }
      `
    }
  };
}
