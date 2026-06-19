
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @class ElasticityMap
 * @description
 * THE LOSS OF FIRMNESS (Nefilat HaOr).
 * B"H
 * 
 * Replaces the shattered string stub with actual geometric data. 
 * As a character ages (or undergoes extreme stress), the skin loses its 
 * ability to snap back. We generate faint, sagging Bezier curves around 
 * the jawline and neck to physically manifest gravity's toll over time.
 * 
 * @author Chariot of the Awtsmoos
 */
export class ElasticityMap {
  /**
   * @function build
   * @description Renders sagging jowls and loose skin based on age parameter.
   * @param {Object} data - Character parameters including 'age'.
   * @param {Object} profile - View perspective.
   * @param {number} rx - Radius X of the skull.
   * @param {number} ry - Radius Y of the skull.
   * @returns {Object} VirtualGraph group of sagging paths.
   */
  static build(data, profile, rx, ry) {
    const age = data.age || 0; // 0.0 to 1.0
    if (age < 0.3) return G.group('elasticity_perfect', null, []);

    const elements = [];
    const alpha = (age - 0.3) * 0.4; // Max 0.28 opacity
    const strokeColor = `rgba(0,0,0,${alpha})`;
    
    const dir = profile.dir || 1;
    const isSide = profile.type === 'side';

    // Jowls (Sagging below the cheekbone into the jaw)
    if (!isSide || dir === -1) {
      elements.push(G.path('jowl_L', [
        { type: 'move', x: -rx * 0.6, y: ry * 0.3 },
        { type: 'quad', cx: -rx * 0.7, cy: ry * 0.7, x: -rx * 0.4, y: ry * 0.95 }
      ], { stroke: strokeColor, lineWidth: 1.5 + age, lineCap: 'round' }));
    }

    if (!isSide || dir === 1) {
      elements.push(G.path('jowl_R', [
        { type: 'move', x: rx * 0.6, y: ry * 0.3 },
        { type: 'quad', cx: rx * 0.7, cy: ry * 0.7, x: rx * 0.4, y: ry * 0.95 }
      ], { stroke: strokeColor, lineWidth: 1.5 + age, lineCap: 'round' }));
    }

    // Turkey Neck (Loose skin under the chin)
    if (age > 0.6 && profile.type !== 'side') {
      elements.push(G.path('neck_wattle_1', [
        { type: 'move', x: -15, y: ry * 0.9 },
        { type: 'quad', cx: 0, cy: ry * 1.2, x: 15, y: ry * 0.9 }
      ], { stroke: strokeColor, lineWidth: 1, lineCap: 'round' }));
      
      elements.push(G.path('neck_wattle_2', [
        { type: 'move', x: -8, y: ry * 0.95 },
        { type: 'quad', cx: 0, cy: ry * 1.25, x: 8, y: ry * 0.95 }
      ], { stroke: strokeColor, lineWidth: 0.8, lineCap: 'round' }));
    }

    return G.group('elasticity_map', null, elements);
  }
}
