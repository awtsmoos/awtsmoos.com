// B"H
/**
 * @file grass.js
 * @module GrassMaterialGenerator
 * @description
 * Chapter 40: the village receives the photographed blades.
 *
 * The Awtsmoos does not ask grass to pretend with a flat green color when a
 * real atlas has already been revealed. This material draws from
 * `assets/textures/village/grass-atlas.png`, repeats it gently, clips alpha for
 * blade silhouettes, and keeps the console silent unless explicit debug is on.
 */
import { GRASS_SNIPPETS } from '../../../../../shaders/GrassShader.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

const GRASS_ATLAS = '/games/mitzvahWorld/assets/textures/village/grass-atlas.png';

/** @param {object} olam World texture loader. @returns {Promise<object>} Material recipe. */
export default async function createGrass(olam) {
  let grassTex = null;
  if (olam && typeof olam.loadTexture === 'function') {
    try {
      grassTex = await olam.loadTexture({ url: GRASS_ATLAS, shouldRepeat: true, repeatX: 3, repeatY: 3 });
    } catch (error) {
      if (globalThis.__AWTSMOOS_DEBUG__ === true) console.warn('B"H | village grass atlas fallback', error);
    }
  }

  return {
    type: 'Lambert',
    properties: {
      color: 0xffffff,
      map: grassTex,
      side: 2,
      alphaTest: 0.38,
      transparent: true
    },
    snippets: GRASS_SNIPPETS
  };
}
