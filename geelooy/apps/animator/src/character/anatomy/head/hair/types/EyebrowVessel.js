// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';
import { seededRandom } from '../../../../../utils/random.js';

/**
 * @file EyebrowVessel.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE INDEPENDENT PILLARS OF THOUGHT (Gaboth HaMachshava)
 * THE SHATTERED MONOLITH & THE STABLE HAIR RECTIFICATION
 * ═══════════════════════════════════════════════════════════════
 * B"H
 *
 * THE POEM OF THE VIBRATING BROW — NOW CALMED:
 * The brow hairs were shivering, shaking with dread,
 * Each frame a new position — alive in the head!
 * Math.random() caused the individual strands
 * To leap from their places, defying all plans.
 * But now the id-seed flows into each hair,
 * And every strand knows its position with care.
 * The eyebrow is a decree carved into stone,
 * It stands in its place — it does not roam!
 *
 * ORIGINAL RULE (preserved): Eyebrows are drawn strictly from -w/2 to w/2
 * inside their own localized container. They can NEVER form a unibrow.
 *
 * @class EyebrowVessel
 */
export class EyebrowVessel {
  /**
   * @function build
   * @description
   * Manifests a perfectly isolated, highly expressive eyebrow with
   * procedurally generated hair strands. All hair randomness is derived
   * from a deterministic seed based on the eyebrow's ID, ensuring
   * the hairs never move between frames.
   *
   * "The Lord established the earth by wisdom, the heavens by understanding."
   * — Mishlei 3:19. Understanding (Binah) is the seed. Wisdom (Chochmah) is
   * the flash of creation. Together they produce stable, beautiful form.
   *
   * @param {string} id     - Eyebrow identifier ('L' or 'R').
   * @param {Object} morph  - Facial morph targets { bx, bi, bo, ba, squint }.
   * @param {number} w      - Width of the eyebrow in pixels.
   * @param {number} dir    - Direction: 1 for right-facing, -1 for left-facing.
   * @param {string} shape  - 'standard' | 'bushy' | 'thin'.
   * @returns {Object} A VirtualGraph group node.
   */
  static build(id, morph, w, dir, shape = 'standard') {
    // ── SEED DERIVATION ──────────────────────────────────────────────────
    // The seed is derived from the ID string so L and R brows are different
    // but both perfectly stable across all animation frames.
    const baseSeed = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 77);
    let rSeed = baseSeed;

    /**
     * @function stableRand
     * @description The ONLY random source in this builder. No Math.random().
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    const stableRand = (min, max) => {
      rSeed += 0.0919;
      return min + seededRandom(rSeed) * (max - min);
    };

    // ── GEOMETRY BOUNDS ───────────────────────────────────────────────────
    // Strictly localized: startX and endX can never escape -w/2 to w/2.
    const startX = -w / 2;
    const endX   =  w / 2;

    // Line width and arch offset based on shape archetype
    let strokeWidth = 4.5;
    let archOffset  = -10;

    if (shape === 'bushy') {
      strokeWidth = 9;
      archOffset  = -6;
    } else if (shape === 'thin') {
      strokeWidth = 2;
      archOffset  = -18;
    }

    // Normalize emotion shift — clamped to prevent the brow from escaping its container
    const emotionShiftX = Math.min(10, Math.max(-14, (morph.bx || 0))) * -dir;

    const trueStart = startX + emotionShiftX;
    const trueEnd   = endX   + emotionShiftX;

    // Determine elevations
    const innerY = morph.bi || 0;
    const outerY = morph.bo || 0;

    const leftY  = dir === -1 ? outerY : innerY;
    const rightY = dir === -1 ? innerY : outerY;

    // The peak of the arch
    const archY = (morph.ba || archOffset);

    // Center of the arch for the quadratic control point
    const archCenterX = (trueStart + trueEnd) / 2;

    // ── CORE BROW SHAPE ───────────────────────────────────────────────────
    const points = [
      { type: 'move', x: trueStart, y: leftY },
      { type: 'quad', cx: archCenterX, cy: archY - (strokeWidth * 1.2), x: trueEnd, y: rightY },
      { type: 'quad', cx: trueEnd + (6 * dir * (shape === 'bushy' ? 1.5 : 1)), cy: rightY + (shape === 'bushy' ? 2 : 1), x: trueEnd, y: rightY + 4 },
      { type: 'quad', cx: archCenterX, cy: archY + (strokeWidth * 0.1), x: trueStart, y: leftY + 5 },
      { type: 'quad', cx: trueStart - (3 * dir), cy: leftY + 2, x: trueStart, y: leftY }
    ];

    // ── HAIR STRANDS ──────────────────────────────────────────────────────
    // B"H - RECTIFICATION: Every hair now uses stableRand() — no Math.random().
    // Each hair is placed once by the Awtsmoos and stands firm forever.
    const hairs = [];
    const numHairs = shape === 'bushy' ? 45 : (shape === 'thin' ? 15 : 29);

    for (let i = 0; i < numHairs; i++) {
      const t   = i / (numHairs - 1);
      const hx  = trueStart + (trueEnd - trueStart) * t;
      const hy  = leftY + (rightY - leftY) * t + stableRand(-strokeWidth * 0.5, strokeWidth * 0.5);
      const hLen = strokeWidth * (1 + stableRand(0, 0.8));
      const hAng  = (Math.PI / 2) + (t * 0.5 * Math.PI * dir) + stableRand(-0.2, 0.2);
      const hxEnd = hx + Math.sin(hAng) * hLen * dir;
      const hyEnd = hy - Math.cos(hAng) * hLen;

      hairs.push(G.path(`brow_hair_${id}_${i}`, [
        { type: 'move', x: hx,    y: hy    },
        { type: 'quad', cx: hx + Math.sin(hAng) * hLen * 0.5 * dir, cy: hy - Math.cos(hAng) * hLen * 0.8, x: hxEnd, y: hyEnd }
      ], { stroke: '#000000cc', lineWidth: shape === 'bushy' ? 1.5 : 1 }));
    }

    return G.group(`brow_${id}`, null, [
      G.path(`brow_fill_${id}`, points, {
        fill: '#151515ee',
        stroke: '#000000',
        lineWidth: 1.5,
        lineJoin: 'round'
      }),
      G.group(`brow_hairs_${id}`, null, hairs)
    ]);
  }
}