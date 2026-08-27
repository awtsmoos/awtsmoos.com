// B"H
import { FaceFrontRenderer } from './FaceFrontRenderer.js';
import { FaceSideRenderer } from './FaceSideRenderer.js';
import { FaceThreeQuarterRenderer } from './FaceThreeQuarterRenderer.js';

/**
 * @file FaceRenderer.js
 * @description
 * Chooses small face renderer by view.
 */
export class FaceRenderer {
  /**
   * Builds face.
   *
   * @param {string} kind - Kind.
   * @param {Object} data - Data.
   * @param {Object} c - Palette.
   * @param {Object} m - Metrics.
   * @param {Object} view - View.
   * @param {boolean} beard - Beard.
   * @returns {Object} Node.
   */
  static build(kind, data, c, m, view, beard = false) {
    const map = {
      front: FaceFrontRenderer,
      side: FaceSideRenderer,
      threeQuarter: FaceThreeQuarterRenderer
    };
    return (map[view.type] || FaceFrontRenderer).build(kind, data, c, m, view, beard);
  }
}