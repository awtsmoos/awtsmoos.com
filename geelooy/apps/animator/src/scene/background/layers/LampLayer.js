// B"H
import { SceneShapeKit as S } from '../SceneShapeKit.js';
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * @file LampLayer.js
 * @description
 * ============================================================================
 * CHAPTER: THE LAMPS THAT MARKED DEPTH
 * ============================================================================
 */

export class LampLayer {
  /**
   * Builds lamps.
   *
   * @param {Object} scene - Scene.
   * @returns {Object} Lamp group.
   */
  static build(scene) {
    return S.group('lamp_layer', null, (scene.lamps || []).map((lamp) => S.group(lamp.id, null, [
      G.path(`${lamp.id}_post`, [
        { type: 'move', x: lamp.x, y: lamp.y },
        { type: 'line', x: lamp.x, y: 78 }
      ], { stroke: '#5b5b5b', lineWidth: 6, lineCap: 'round' }),
      G.circle(`${lamp.id}_light`, lamp.x, lamp.y, 10, {
        fill: '#ff4040',
        stroke: '#ff4040',
        lineWidth: 2
      })
    ])));
  }
}