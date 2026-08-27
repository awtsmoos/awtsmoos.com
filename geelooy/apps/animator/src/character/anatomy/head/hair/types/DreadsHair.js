// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';
import { HairBase } from '../HairBase.js';
import { seededRandom } from '../../../../../utils/random.js';

/**
 * @file DreadsHair.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE CASCADING LOCS (Tziltzulim HaNoflaim)
 * THE STABLE LOC RECTIFICATION
 * ═══════════════════════════════════════════════════════════════
 * B"H
 *
 * THE POEM OF THE DANCING LOCS — NOW STILLED:
 * The locs were alive in the worst possible way,
 * Teleporting to new positions with every new day!
 * Each frame a fresh length, each frame a new swing,
 * Math.random() gave the locs chaotic fling!
 * But now the charId seed flows into each strand,
 * And every loc hangs exactly where it was planned.
 * The Awtsmoos decreed each tendril's final form,
 * And that decree stands forever — past every storm!
 *
 * @class DreadsHair
 * @extends HairBase
 */
export class DreadsHair extends HairBase {
  /**
   * @function build
   * @description
   * Manifests the cascading dreadloc system. Each loc is a closed organic
   * path with internal texture segmentation lines. All randomness flows
   * through a deterministic seed derived from the data parameter,
   * ensuring the locs are perfectly stable across all animation frames.
   *
   * @param {Object} data    - Character data including colors, hairType, id.
   * @param {Object} profile - Partzuf profile (type, dir).
   * @returns {Object} A VirtualGraph group node containing all loc geometry.
   */
  static build(data, profile) {
    const { h, color, view, dir } = this.getParams(data, profile);
    const nodes = [];

    // B"H - Derive a stable numeric seed from the character's identity.
    // This seed is the soul of the hair — it never changes.
    const charSeed = (data.id || 'default').split('').reduce(
      (acc, char) => acc + char.charCodeAt(0), 42
    );
    let rSeed = charSeed;

    /**
     * @function stableRand
     * @description Advances the deterministic seed and returns a value in [min, max].
     * This is the ONLY source of randomness in this builder. Math.random() is exiled.
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    const stableRand = (min, max) => {
      rSeed += 0.1337;
      return min + seededRandom(rSeed) * (max - min);
    };

    const foreheadArc = this.getForeheadArc(h, dir, view);
    let lx = -h.rX;
    let rx = h.rX;
    if (view === 'side') { lx = -h.rX * 0.6; rx = h.rX * 0.8 * dir; }
    if (view === 'threeQuarter') { lx = -h.rX * 0.8; }

    const apex = -h.rY * 1.3;

    // ── 1. THE CORE DOME ─────────────────────────────────────────────────
    const domePath = [
      ...foreheadArc,
      { type: 'quad', cx: 0, cy: apex - 30, x: rx, y: -h.rY * 0.15 }
    ];
    nodes.push(G.path('dread_base', domePath, { fill: color, stroke: '#000', lineWidth: 4 }));

    // ── 2. THE HANGING LOCS ───────────────────────────────────────────────
    const numLocs = (view === 'side') ? 4 : 7;
    const spacing = (rx - lx) / numLocs;

    for (let i = 0; i < numLocs; i++) {
      // B"H - RECTIFICATION: stableRand() replaces all Math.random() calls.
      // Each loc's length, swing, and texture are now eternal and unmoving.
      const startX = lx + (i * spacing) + 10;
      const startY = -h.rY * 0.2;
      const len = 120 + stableRand(0, 40);

      // Slight outward curve — deterministic per loc
      const swingOffset = (stableRand(0, 1) - 0.5) * 40;
      const swingX = startX + swingOffset;

      const locPath = [
        { type: 'move',  x: startX - 10, y: startY },
        { type: 'quad',  cx: swingX - 20, cy: startY + len / 2, x: swingX - 5, y: startY + len },
        { type: 'quad',  cx: swingX + 5,  cy: startY + len + 10, x: swingX + 5, y: startY + len },
        { type: 'quad',  cx: swingX + 20, cy: startY + len / 2, x: startX + 10, y: startY }
      ];

      nodes.push(G.path(`loc_${i}`, locPath, {
        fill: color, stroke: '#000', lineWidth: 3,
        lineJoin: 'round', composite: 'destination-over'
      }));

      // Internal texture segmentation lines — also deterministic
      for (let ty = 20; ty < len - 10; ty += 18) {
        const segX = startX + ((swingX - startX) * (ty / len));
        const segW = 8 + stableRand(0, 4);
        nodes.push(G.path(`loc_seg_${i}_${ty}`, [
          { type: 'move', x: segX - segW / 2, y: startY + ty },
          { type: 'line', x: segX + segW / 2, y: startY + ty }
        ], { stroke: '#00000044', lineWidth: 1.5 }));
      }
    }

    return G.group('hair_dreads_sys', null, nodes);
  }
}