
// B"H
import { VirtualGraph as G } from '../../engine/graph/VirtualGraph.js';
import { AwtsmoosMath } from '../../engine/core/AwtsmoosMath.js';
import { LensFlareCatalog } from './LensFlareCatalog.js';

/**
 * @file LensFlareRenderer.js
 * @description
 * CHAPTER: LIGHT RINGS ACROSS THE FRAME.
 */
export class LensFlareRenderer {
  /**
   * Builds a flare near a character.
   *
   * @param {Object} data - Character data.
   * @param {number} time - Time.
   * @returns {Object|null} VirtualGraph node.
   */
  static build(data, time) {
    if (!data || !data.lensFlare) return null;

    const style = LensFlareCatalog[data.lensFlare] || LensFlareCatalog.softGold;
    const pulse = 1 + AwtsmoosMath.wave(time, 0.002, data.animPersonality?.phase || 0, 0.10);
    const x = (data.position?.x || 0) + 80;
    const y = (data.position?.y || 0) - 330;

    return G.group(`lens_flare_${data.id}`, { x, y, scaleX: pulse, scaleY: pulse }, [
      G.circle('flare_core', 0, 0, style.size * 0.18, {
        fill: style.color,
        stroke: 'rgba(255,255,255,0.0)',
        lineWidth: 0
      }),
      G.ellipse('flare_ring_a', 0, 0, style.size * 0.60, style.size * 0.18, 0, {
        fill: 'rgba(255,255,255,0)',
        stroke: style.ring,
        lineWidth: 3
      }),
      G.ellipse('flare_ring_b', 0, 0, style.size * 0.34, style.size * 0.10, 0.45, {
        fill: 'rgba(255,255,255,0)',
        stroke: style.ring,
        lineWidth: 2
      })
    ]);
  }
}
