
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file CompactShadow.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE SHADOW THAT PROVES THE FEET EXIST
 * ═══════════════════════════════════════════════════════════════
 *
 * Floating characters need grounding. This shadow sits directly under the
 * feet, showing that the soul is planted in the scene.
 *
 * The Awtsmoos creates light and shadow. The shadow here is not darkness; it
 * is evidence of contact.
 *
 * @class CompactShadow
 */
export class CompactShadow {
  /**
   * Builds an oval ground shadow.
   *
   * @param {Object} m - Metrics.
   * @returns {Array<Object>} Shadow node list.
   */
  static build(m) {
    return [
      G.ellipse('compact_ground_shadow', 0, m.shadowY, m.shadowRX, m.shadowRY, 0, {
        fill: 'rgba(0,0,0,0.32)',
        stroke: 'rgba(0,0,0,0)',
        lineWidth: 0
      })
    ];
  }
}
