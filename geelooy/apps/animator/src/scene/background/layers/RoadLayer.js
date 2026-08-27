// B"H
import { SceneShapeKit as S } from '../SceneShapeKit.js';

/**
 * @file RoadLayer.js
 * @description
 * ============================================================================
 * CHAPTER: THE GROUND THAT GAVE FEET A WORLD
 * ============================================================================
 */

export class RoadLayer {
  /**
   * Builds road and sidewalk.
   *
   * @param {Object} scene - Scene.
   * @returns {Object} Road group.
   */
  static build(scene) {
    const road = scene.road || {};
    return S.group('road_layer', null, [
      S.rect('plaza_sidewalk', 0, 118, 2600, 80, {
        fill: road.sidewalk || '#a8a8a8',
        stroke: '#050505',
        lineWidth: 5
      }),
      S.rect('curb_green', 0, 74, 2600, 12, {
        fill: road.curb || '#14b86b',
        stroke: '#050505',
        lineWidth: 2
      }),
      S.rect('road_dark', 0, 182, 2600, 110, {
        fill: road.color || '#232323',
        stroke: '#050505',
        lineWidth: 4
      }),
      ...[-720, -360, 0, 360, 720].map((x, index) => S.rect(`sidewalk_joint_${index}`, x, 118, 6, 80, {
        fill: '#101010',
        stroke: '#101010',
        lineWidth: 1
      }))
    ]);
  }
}