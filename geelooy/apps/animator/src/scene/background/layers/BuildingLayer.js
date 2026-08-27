// B"H
import { SceneShapeKit as S } from '../SceneShapeKit.js';

/**
 * @file BuildingLayer.js
 * @description
 * ============================================================================
 * CHAPTER: THE BUILDINGS THAT COVERED THE HORIZON
 * ============================================================================
 */

export class BuildingLayer {
  /**
   * Builds buildings.
   *
   * @param {Object} scene - Scene.
   * @returns {Object} Building group.
   */
  static build(scene) {
    return S.group('building_layer', null, (scene.buildings || []).map((b) => S.group(b.id, null, [
      S.rect(`${b.id}_body`, b.x, b.y, b.w, b.h, {
        fill: b.color,
        stroke: '#050505',
        lineWidth: 6
      })
    ])));
  }
}