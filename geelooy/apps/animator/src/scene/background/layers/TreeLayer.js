// B"H
import { SceneShapeKit as S } from '../SceneShapeKit.js';
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * @file TreeLayer.js
 * @description
 * ============================================================================
 * CHAPTER: THE TREES THAT FILLED THE SIDE EDGES
 * ============================================================================
 */

export class TreeLayer {
  /**
   * Builds trees.
   *
   * @param {Object} scene - Scene.
   * @returns {Object} Tree group.
   */
  static build(scene) {
    return S.group('tree_layer', null, (scene.trees || []).map((tree) => {
      const s = tree.scale || 1;
      return S.group(tree.id, null, [
        G.path(`${tree.id}_trunk`, [
          { type: 'move', x: tree.x, y: 32 },
          { type: 'line', x: tree.x, y: -44 * s }
        ], { stroke: '#5c351f', lineWidth: 14 * s, lineCap: 'round' }),
        S.ellipse(`${tree.id}_leaf_a`, tree.x - 26 * s, -58 * s, 34 * s, 30 * s, { fill: '#1e8b55', stroke: '#0d3f25', lineWidth: 4 }),
        S.ellipse(`${tree.id}_leaf_b`, tree.x + 4 * s, -74 * s, 42 * s, 38 * s, { fill: '#249c61', stroke: '#0d3f25', lineWidth: 4 }),
        S.ellipse(`${tree.id}_leaf_c`, tree.x + 34 * s, -55 * s, 34 * s, 30 * s, { fill: '#1e8b55', stroke: '#0d3f25', lineWidth: 4 })
      ]);
    }));
  }
}