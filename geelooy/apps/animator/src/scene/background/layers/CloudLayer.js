// B"H
import { SceneShapeKit as S } from '../SceneShapeKit.js';

/**
 * @file CloudLayer.js
 * @description
 * ============================================================================
 * CHAPTER: THE CLOUDS THAT BROKE EMPTY BLUE SPACE
 * ============================================================================
 */

export class CloudLayer {
  /**
   * Builds clouds.
   *
   * @param {Object} scene - Scene.
   * @returns {Object} Cloud group.
   */
  static build(scene) {
    const clouds = scene.clouds || [];
    return S.group('cloud_layer', null, clouds.map((cloud, index) => S.group(`cloud_${index}`, null, [
      S.ellipse(`${cloud.id}_a`, cloud.x - cloud.w * 0.25, cloud.y, cloud.w * 0.22, cloud.h * 0.45, { fill: 'rgba(255,255,255,0.35)', stroke: 'rgba(255,255,255,0)', lineWidth: 0 }),
      S.ellipse(`${cloud.id}_b`, cloud.x, cloud.y - 8, cloud.w * 0.28, cloud.h * 0.55, { fill: 'rgba(255,255,255,0.42)', stroke: 'rgba(255,255,255,0)', lineWidth: 0 }),
      S.ellipse(`${cloud.id}_c`, cloud.x + cloud.w * 0.26, cloud.y, cloud.w * 0.22, cloud.h * 0.45, { fill: 'rgba(255,255,255,0.35)', stroke: 'rgba(255,255,255,0)', lineWidth: 0 })
    ])));
  }
}