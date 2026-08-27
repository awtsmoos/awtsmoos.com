// B"H
import { SceneShapeKit as S } from '../SceneShapeKit.js';

/**
 * @file SkyLayer.js
 * @description
 * ============================================================================
 * CHAPTER: THE SKY THAT FILLED THE VOID
 * ============================================================================
 */

export class SkyLayer {
  /**
   * Builds sky.
   *
   * @param {Object} scene - Scene.
   * @returns {Object} Sky node.
   */
  static build(scene) {
    return S.group('sky_layer', null, [
      S.rect('sky_back', 0, -260, 2600, 900, {
        fill: scene.sky || '#2f9cca',
        stroke: scene.sky || '#2f9cca',
        lineWidth: 1
      }),
      S.rect('sky_deep_band', 0, -520, 2600, 240, {
        fill: scene.skyTop || '#1d6f98',
        stroke: scene.skyTop || '#1d6f98',
        lineWidth: 1
      })
    ]);
  }
}