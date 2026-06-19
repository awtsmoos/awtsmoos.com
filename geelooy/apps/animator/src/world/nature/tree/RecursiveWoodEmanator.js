import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { TreeTipRegistry } from '../TreeTipRegistry.js';
import { seededRandom } from '../../../utils/random.js';

/**
 * @file RecursiveWoodEmanator.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE SPIRIT OF GROWTH (Guf HaIlan)
 * THE STABLE BARK RECTIFICATION
 * ═══════════════════════════════════════════════════════════════
 * B"H
 *
 * THE POEM OF THE FLICKERING BARK — NOW HEALED:
 * The bark used to dance with each passing frame,
 * Each render a new grain, each pixel re-named!
 * The Math.random() was a spirit unbound,
 * Creating new chaos each time around.
 * But now the rSeed marches forward with reason,
 * Each grain fixed to its place through every season.
 * The Awtsmoos spoke 'Even' (Aleph-Beis-Nun) — and stone was made,
 * And stone does not shimmer, nor does it fade!
 *
 * RECTIFICATION:
 * - ALL Math.random() calls inside sprout() replaced with seededRandom(rSeed++)
 * - rSeed is incremented by deterministic prime offsets per grain/per branch
 * - Result: bark grains are perfectly stable across all animation frames
 *
 * @module RecursiveWoodEmanator
 * @author Chariot of the Awtsmoos
 */
export class RecursiveWoodEmanator {
  /**
   * @function grow
   * @description
   * Spills the recursive wood into the world group.
   * Every branch segment is a tapered path with procedural bark grains,
   * all generated from a deterministic seed — never flickering, never changing.
   *
   * "He spoke, and it was; He commanded, and it stood firm." — Tehillim 33:9
   * Once the Awtsmoos speaks a branch into being, it stands FIRM. It does not
   * shimmer. It does not re-randomize. The seededRandom is His eternal decree.
   *
   * @param {string} id    - Base identifier for the nodes.
   * @param {number} x     - Ground X anchor.
   * @param {number} y     - Ground Y anchor.
   * @param {number} size  - Base scale multiplier.
   * @param {number} seed  - Deterministic seed — the soul of the tree.
   * @param {number} sway  - Wind oscillation factor (dynamic, per-frame).
   * @returns {{ segments: Array, tips: Array }} The wood segments and branch tips.
   */
  static grow(id, x, y, size, seed, sway = 0) {
    const segments = [];
    const tips = [];
    let rSeed = seed;

    /**
     * @function rand
     * @description Advances the deterministic seed and returns a value in [min, max].
     * This is the ONLY random source in this file. Math.random() is FORBIDDEN here.
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    const rand = (min, max) => {
      rSeed += 0.123;
      return min + seededRandom(rSeed) * (max - min);
    };

    /**
     * @function sprout
     * @description
     * THE RECURSIVE EMANATION — Each call is a branch descending from its parent,
     * like Sefiros descending from Keter to Malchus.
     *
     * "And from one root, all the branches spread..." — Eitz Chaim
     *
     * @param {number} bx     - Base X of the branch origin.
     * @param {number} by     - Base Y of the branch origin.
     * @param {number} angle  - Direction of growth in radians.
     * @param {number} length - Length of this branch segment.
     * @param {number} depth  - Remaining recursion depth (5 → 0).
     * @param {number} width  - Current stroke thickness.
     * @returns {void}
     */
    const sprout = (bx, by, angle, length, depth, width) => {
      // The culmination of growth — record the tip and ascend
      if (depth === 0 || width < 1) {
        tips.push({ x: bx, y: by });
        return;
      }

      // B"H - Incorporate external sway (wind) into the branch angle.
      // Upper branches (lower depth) sway more than the heavy trunk.
      const swayStrength = (5 - depth) * 0.1;
      const dynamicAngle = angle + (sway * swayStrength);

      const tip = TreeTipRegistry.getBranchTip(bx, by, dynamicAngle, length);

      // ── 1. THE MAIN WOODEN SEGMENT ───────────────────────────────────────
      segments.push(G.path(`wood_${id}_d${depth}_x${Math.floor(bx)}`, [
        { type: 'move', x: bx, y: by },
        { type: 'line', x: tip.x, y: tip.y }
      ], {
        stroke: '#4a2c10',
        lineWidth: width,
        lineCap: 'round'
      }));

      // ── 2. PROCEDURAL BARK GRAINS ─────────────────────────────────────────
      // B"H - RECTIFICATION: All grain randomness now flows from rSeed via rand().
      // The bark grains are now eternal — they never flicker between frames.
      if (width > 2) {
        const numGrains = 12;
        for (let g = 0; g < numGrains; g++) {
          // Each grain uses a fresh deterministic offset — no Math.random() here!
          const offset    = (width * (rand(-0.5, 0.5))) * 1.1;
          const grainLen  = length * (0.1 + rand(0, 0.7));
          const startFrac = rand(0, 0.15);
          const endFrac   = rand(0, 0.15);
          const grainW    = 0.3 + rand(0, 0.6);

          segments.push(G.path(`grain_${id}_d${depth}_g${g}`, [
            { type: 'move', x: bx + offset, y: by + (startFrac * length) },
            { type: 'line', x: tip.x + offset, y: tip.y - (endFrac * length) }
          ], { stroke: 'rgba(0,0,0,0.16)', lineWidth: grainW }));
        }
      }

      // ── 3. THE MULTIPLY DIRECTIVE (Recursive splits) ─────────────────────
      const splitCount = depth > 3 ? 2 : (rand(0, 1) > 0.4 ? 2 : 1);

      for (let i = 0; i < splitCount; i++) {
        sprout(
          tip.x, tip.y,
          angle + rand(-0.75, 0.75),
          length * rand(0.68, 0.85),
          depth - 1,
          width * 0.72
        );
      }
    };

    // Primary invocation: grow straight up into the heavens
    sprout(x, y, -Math.PI / 2, size * 0.52, 5, size * 0.14);

    return { segments, tips };
  }
}