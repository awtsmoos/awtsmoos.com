
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { AwtsmoosMath } from '../../../../engine/core/AwtsmoosMath.js';

/**
 * @class PoreDensityMap
 * @description
 * THE GRAINS OF THE EARTH (Gargirei Adamah).
 * B"H
 * 
 * Replaces the string stub. Human skin is not a flawless plastic sheet. 
 * It is made of the dust of the earth. We generate a deterministic spray 
 * of micro-polygons (pores and freckles) clustered around the T-zone (nose and cheeks).
 * 
 * @author Chariot of the Awtsmoos
 */
export class PoreDensityMap {
  /**
   * @function build
   * @description Renders procedural skin imperfections.
   * @param {Object} data - Character state.
   * @param {number} rx - Skull width.
   * @param {number} ry - Skull height.
   * @returns {Object} VirtualGraph group of pores.
   */
  static build(data, rx, ry) {
    const elements = [];
    const seed = data.id.charCodeAt(0) + (data.id.charCodeAt(data.id.length-1) || 0);
    
    // Determine archetype freckle/pore density
    const isKid = data.archetype === 'kid';
    const count = isKid ? 40 : 80; // Kids get fewer pores, but maybe darker freckles
    const baseColor = isKid ? 'rgba(150, 50, 0, 0.15)' : 'rgba(0, 0, 0, 0.04)';

    for (let i = 0; i < count; i++) {
      // Gaussian-ish clustering around the center of the face (nose/cheeks)
      // We use multiple randoms to weight toward the center (0)
      const u1 = AwtsmoosMath.seededRandom(seed + i * 3);
      const u2 = AwtsmoosMath.seededRandom(seed + i * 3 + 1);
      
      const r = Math.sqrt(-2.0 * Math.log(u1 || 0.001)) * Math.cos(2.0 * Math.PI * u2);
      
      // Map to face dimensions (r is roughly -3 to +3 standard deviations)
      const px = (r / 3) * (rx * 0.7);
      const py = 10 + (AwtsmoosMath.seededRandom(seed + i * 3 + 2) - 0.5) * (ry * 0.5);

      // Varying sizes
      const size = 0.5 + AwtsmoosMath.seededRandom(seed + i * 3 + 3) * 0.8;

      elements.push(G.circle(`pore_${i}`, px, py, size, { fill: baseColor }));
    }

    return G.group('pore_density_map', null, elements);
  }
}
