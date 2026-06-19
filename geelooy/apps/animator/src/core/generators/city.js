
// B"H
import { SkyRenderer }      from './city/SkyRenderer.js';
import { BuildingRenderer } from './city/BuildingRenderer.js';

/**
 * @file city.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 8: THE CITY OF SOULS (Ir HaNeshamot)
 * ═══════════════════════════════════════════════════════════════
 *
 * The city is a living organism — each building a unique vessel,
 * each window a flickering soul-light. But for the city to stand
 * still between frames, its geometry must be deterministic.
 *
 * This orchestrator passes the building index (i) into
 * BuildingRenderer.draw() so that each building's size, position,
 * and window pattern is seeded and frame-stable.
 *
 * @class CityGenerator
 */
export class CityGenerator {
  /**
   * @function generate
   * @description Renders a deterministic 20-building cityscape.
   * @param {CanvasRenderingContext2D} ctx       - Canvas context.
   * @param {number}                  width     - Display width in CSS px.
   * @param {number}                  height    - Display height in CSS px.
   * @param {number}                  [timeOfDay=0.5] - 0=night, 1=noon.
   * @returns {void}
   */
  static generate(ctx, width, height, timeOfDay = 0.5) {
    ctx.save();
    SkyRenderer.draw(ctx, width, height);

    for (let i = 0; i < 20; i++) {
      // Pass index i so BuildingRenderer can seed deterministically.
      BuildingRenderer.draw(ctx, width, height, i, timeOfDay);
    }

    ctx.restore();
  }
}
