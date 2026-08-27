
// B"H
import { seededRandom } from '../../../utils/random.js';

/**
 * @file WindowRenderer.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 7: THE WINDOWS OF CONSCIOUSNESS (Chalonot HaDa'at)
 * THE SEEDED RANDOM RECTIFICATION
 * ═══════════════════════════════════════════════════════════════
 *
 * "Through the window she looked and peered..." — Shoftim 5:28
 *
 * THE BUG OF THE STROBING LIGHTS:
 * Window lights were drawn with Math.random() > 0.7 every frame.
 * At 60fps this meant every window toggled its existence 60 times
 * per second. The night skyline looked like it was being electrocuted.
 *
 * THE POEM OF THE FLICKERING LIGHTS:
 * The windows all blinked like a sign going mad,
 * On then off then on — it made the devs sad!
 * Math.random called at 60fps in the dark night,
 * Made every lit pane strobe terrible light!
 * Now seededRandom fixes each window's bright fate,
 * And the city at night looks profoundly ornate!
 *
 * RECTIFICATION: A combined seed of (buildingSeed + row + col) ensures
 * every window has a deterministic lit/unlit state that never changes.
 *
 * @class WindowRenderer
 */
export class WindowRenderer {
  /**
   * @function draw
   * @description
   * Renders the window grid for one building using deterministic seeding.
   *
   * @param {CanvasRenderingContext2D} ctx        - The 2D canvas context.
   * @param {number}                  x          - Left edge of building.
   * @param {number}                  y          - Top edge of building.
   * @param {number}                  bWidth     - Building pixel width.
   * @param {number}                  bHeight    - Building pixel height.
   * @param {number}                  height     - Total canvas height.
   * @param {number}                  buildSeed  - Parent building's seed.
   * @param {number}                  [timeOfDay=0.5] - 0=night, 1=noon.
   * @returns {void}
   */
  static draw(ctx, x, y, bWidth, bHeight, height, buildSeed = 0, timeOfDay = 0.5) {
    const isNight = timeOfDay < 0.5;

    let col = 0;
    for (let wx = x + 5; wx < x + bWidth - 5; wx += 10, col++) {
      let row = 0;
      for (let wy = y + 5; wy < height - 5; wy += 15, row++) {
        // Unique seed per window: combine building seed + grid position.
        const winSeed = buildSeed + col * 31 + row * 97;
        const chance  = seededRandom(winSeed);

        if (isNight) {
          if (chance > 0.7) {
            // Lit window — deterministic warm yellow glow.
            ctx.fillStyle = `rgba(255, 220, 100, ${0.7 + chance * 0.3})`;
            ctx.fillRect(wx, wy, 4, 6);
          }
          // Unlit windows render nothing (transparent / building colour shows through).
        } else {
          // Daytime: reflective glass panes.
          ctx.fillStyle = chance > 0.2 ? '#1a2a3a' : '#0d151d';
          ctx.fillRect(wx, wy, 4, 6);
        }
      }
    }
  }
}
