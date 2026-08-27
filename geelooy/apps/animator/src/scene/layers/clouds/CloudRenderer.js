
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { CLOUD_SHAPES } from './CloudShapeRegistry.js';
import { CloudMotionSolver } from './CloudMotionSolver.js';

/**
 * @file CloudRenderer.js
 * @description One cloud cluster renderer.
 */

export class CloudRenderer {
  /**
   * Builds one cloud cluster.
   *
   * @param {Object} data - Cloud schema.
   * @param {Object} context - Scene context.
   * @returns {Object} Cloud group.
   */
  static build(data, context) {
    const { contract, theme } = context;
    const width = contract.width * Number(data.widthRatio || 0.18);
    const x = contract.width * Number(data.xRatio || 0.5) + CloudMotionSolver.driftX(data, context);
    const y = contract.horizonY * Number(data.yRatio || 0.3);
    const shape = CLOUD_SHAPES[data.shape || 'softFour'] || CLOUD_SHAPES.softFour;
    const opacity = Number(data.opacity ?? 0.5);
    const fill = this.withOpacity(theme.cloud || '#d9f2ff', opacity);

    return G.group(data.id || 'cloud_cluster', null, shape.map((blob, index) => (
      G.circle((data.id || 'cloud') + '_blob_' + index, {
        x: x + width * blob.x,
        y: y + width * blob.y,
        radius: width * blob.r,
        fill
      })
    )));
  }

  /**
   * Converts a hex color to an rgba string with opacity.
   *
   * @param {string} color - Hex color.
   * @param {number} opacity - Opacity.
   * @returns {string} RGBA string.
   */
  static withOpacity(color, opacity) {
    if (!color.startsWith('#')) return color;
    const raw = color.slice(1);
    const r = parseInt(raw.slice(0, 2), 16);
    const g = parseInt(raw.slice(2, 4), 16);
    const b = parseInt(raw.slice(4, 6), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + Math.max(0, Math.min(1, opacity)) + ')';
  }
}
