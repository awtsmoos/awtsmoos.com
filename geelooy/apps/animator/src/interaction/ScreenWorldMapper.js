
// B"H

/**
 * @file ScreenWorldMapper.js
 * @description
 * ============================================================================
 * CHAPTER: THE FINGER THAT CROSSED FROM GLASS INTO WORLD
 * ============================================================================
 *
 * A pointer begins as flesh on glass, becomes client coordinates, then canvas
 * pixels, then stage space. This mapper keeps that descent honest.
 *
 * @module ScreenWorldMapper
 */

/**
 * @class ScreenWorldMapper
 * @description
 * Converts pointer events into canvas pixel coordinates.
 */
export class ScreenWorldMapper {
  /**
   * Converts a pointer event to canvas coordinates.
   *
   * @param {PointerEvent|MouseEvent|Touch} event - Input event.
   * @param {HTMLCanvasElement} canvas - Canvas element.
   * @returns {Object} Point in canvas pixels and CSS pixels.
   */
  static toCanvas(event, canvas) {
    const rect = canvas.getBoundingClientRect();
    const dprX = canvas.width / Math.max(1, rect.width);
    const dprY = canvas.height / Math.max(1, rect.height);
    const clientX = Number(event.clientX);
    const clientY = Number(event.clientY);
    const cssX = clientX - rect.left;
    const cssY = clientY - rect.top;
    return {
      x: cssX * dprX,
      y: cssY * dprY,
      cssX,
      cssY,
      dprX,
      dprY
    };
  }
}
