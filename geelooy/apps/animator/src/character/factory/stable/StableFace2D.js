// B"H
import { FaceRenderer } from './face/FaceRenderer.js';

/**
 * @file StableFace2D.js
 * @description
 * Compatibility shell delegating to smaller face files.
 */
export class StableFace2D {
  /**
   * Builds human face.
   *
   * @param {Object} data - Data.
   * @param {Object} c - Palette.
   * @param {Object} m - Metrics.
   * @param {Object} view - View.
   * @returns {Object} Node.
   */
  static human(data, c, m, view) {
    return FaceRenderer.build('human', data, c, m, view, false);
  }

  /**
   * Builds sage face.
   *
   * @param {Object} data - Data.
   * @param {Object} c - Palette.
   * @param {Object} m - Metrics.
   * @param {Object} view - View.
   * @returns {Object} Node.
   */
  static sage(data, c, m, view) {
    return FaceRenderer.build('sage', data, c, m, view, true);
  }
}