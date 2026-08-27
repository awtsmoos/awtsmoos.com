// B"H
import { SceneShapeKit as S } from '../SceneShapeKit.js';

/**
 * @file WindowLayer.js
 * @description
 * ============================================================================
 * CHAPTER: THE WINDOWS THAT MADE THE CITY FEEL OCCUPIED
 * ============================================================================
 */

export class WindowLayer {
  /**
   * Builds procedural windows.
   *
   * @param {Object} scene - Scene.
   * @returns {Object} Window group.
   */
  static build(scene) {
    const wcfg = scene.windows || { rows: 3, columns: 4, w: 18, h: 30, color: '#ffd21c' };
    const nodes = [];

    (scene.buildings || []).forEach((b) => {
      for (let row = 0; row < wcfg.rows; row++) {
        for (let col = 0; col < wcfg.columns; col++) {
          const x = b.x - b.w * 0.32 + col * (b.w * 0.64 / Math.max(1, wcfg.columns - 1));
          const y = b.y - b.h * 0.28 + row * (b.h * 0.5 / Math.max(1, wcfg.rows - 1));
          nodes.push(S.rect(`${b.id}_window_${row}_${col}`, x, y, wcfg.w, wcfg.h, {
            fill: wcfg.color,
            stroke: 'rgba(0,0,0,0)',
            lineWidth: 0
          }));
        }
      }
    });

    return S.group('window_layer', null, nodes);
  }
}