
// B"H
import { WindowRenderer } from './WindowRenderer.js';
import { seededRandom }   from '../../../utils/random.js';

/**
 * @file BuildingRenderer.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 6: THE TOWERS OF CREATION (Migdalei HaBriyah)
 * THE SEEDED RANDOM RECTIFICATION
 * ═══════════════════════════════════════════════════════════════
 *
 * "The Lord of hosts builds with wisdom and establishes with understanding."
 *
 * THE BUG OF THE STROBING BUILDINGS:
 * The former BuildingRenderer used Math.random() — the un-seeded,
 * non-deterministic chaos function — every single frame (60fps).
 * This meant building width, height, colour and position all changed
 * 60 times per second. The city skyline STROBED. It VIBRATED.
 * It looked like a seizure, not a cityscape.
 *
 * THE POEM OF THE STROBING TOWERS:
 * Each frame the buildings grew short then grew tall,
 * They flickered and shook like they'd crumble and fall!
 * Math.random() called sixty times in a second,
 * Left the skyline convulsing — the engineers reckoned!
 * Now seededRandom pins each tower in place,
 * And the city stands still in its permanent grace!
 *
 * RECTIFICATION:
 * - A deterministic seed is computed from the building index (i).
 * - seededRandom(seed) produces the same value every frame for the same i.
 * - The city skyline is now rock-solid and frame-stable.
 *
 * @class BuildingRenderer
 */
export class BuildingRenderer {
  /**
   * @function draw
   * @description
   * Renders a single deterministic building at a position derived
   * from its index seed, ensuring zero per-frame variation.
   *
   * @param {CanvasRenderingContext2D} ctx    - The 2D canvas context.
   * @param {number}                  width  - Canvas display width in CSS px.
   * @param {number}                  height - Canvas display height in CSS px.
   * @param {number}                  index  - Building index (0-based) for seeding.
   * @param {number}                  [timeOfDay=0.5] - 0=night, 1=noon.
   * @returns {void}
   */
  static draw(ctx, width, height, index, timeOfDay = 0.5) {
    // Deterministic seed based on building index.
    // Every frame produces the SAME values for the SAME building.
    const seed = index * 137.508; // Golden angle constant for good distribution.

    const bWidth  = 40  + seededRandom(seed + 0.1) * 60;
    const bHeight = 100 + seededRandom(seed + 0.2) * 300;
    const x       = seededRandom(seed + 0.3) * (width - bWidth);
    const y       = height - bHeight;

    // Deterministic hue lightness for this building.
    const lightness = 10 + seededRandom(seed + 0.4) * 10;
    ctx.fillStyle = `hsl(240, 20%, ${lightness}%)`;
    ctx.fillRect(x, y, bWidth, bHeight);

    // Pass seed + timeOfDay to WindowRenderer so windows are also deterministic.
    WindowRenderer.draw(ctx, x, y, bWidth, bHeight, height, seed, timeOfDay);
  }
}
