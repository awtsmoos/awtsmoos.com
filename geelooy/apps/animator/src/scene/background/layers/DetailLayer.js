// B"H
import { SceneShapeKit as S } from '../SceneShapeKit.js';

/**
 * @file DetailLayer.js
 * @description
 * ============================================================================
 * CHAPTER: THE SMALL MARKS THAT BROKE THE DEAD FLATNESS
 * ============================================================================
 */

export class DetailLayer {
  /**
   * Builds small foreground details.
   *
   * @returns {Object} Detail group.
   */
  static build() {
    const nodes = [];
    for (let i = -9; i <= 9; i++) {
      nodes.push(S.rect(`pavement_spark_${i}`, i * 110 + (i % 2) * 22, 124 + (i % 3) * 9, 14, 4, {
        fill: 'rgba(20,40,50,0.35)',
        stroke: 'rgba(20,40,50,0.35)',
        lineWidth: 1
      }));
    }
    return S.group('detail_layer', null, nodes);
  }
}