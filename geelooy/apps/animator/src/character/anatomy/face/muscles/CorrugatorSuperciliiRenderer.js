
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @class CorrugatorSuperciliiRenderer
 * @description
 * THE KNOT OF JUDGMENT (Din).
 * B"H
 * 
 * When the soul focuses with intense severity, or burns with the fire of anger,
 * the Awtsmoos commands the Corrugator Supercilii to draw the eyebrows downward 
 * and inward, creating the vertical "11" furrows above the nose.
 * 
 * We render these as deep, converging Bezier paths that scale in opacity 
 * directly with the character's 'anger' or 'stress' metadata.
 * 
 * @author Chariot of the Awtsmoos
 */
export class CorrugatorSuperciliiRenderer {
  /**
   * @function build
   * @description Manifests the vertical glabella furrows.
   * @param {Object} data - The soul's emotional matrix.
   * @param {Object} profile - The perspective plane.
   * @returns {Object} VirtualGraph group of tension lines.
   */
  static build(data, profile) {
    const anger = data.anger || data.stress || data.hate || 0;
    const conc = data.concentration || 0;
    const intensity = Math.max(anger, conc);

    if (intensity < 0.15) return G.group('corrugator_static', null, []);

    const dir = profile.dir || 1;
    const isSide = profile.type === 'side';
    const elements = [];
    
    const alpha = 0.1 + (intensity * 0.2);
    const strokeStyle = `rgba(0, 0, 0, ${alpha})`;
    const shiftX = profile.type === 'threeQuarter' ? 8 * dir : (isSide ? 15 * dir : 0);

    // The two vertical lines between the brows
    if (!isSide || dir === -1) {
      elements.push(G.path('corr_L', [
        { type: 'move', x: -6 + shiftX, y: -45 },
        { type: 'quad', cx: -4 + shiftX, cy: -38, x: -8 + shiftX, y: -32 }
      ], { stroke: strokeStyle, lineWidth: 2 * intensity, lineCap: 'round' }));
    }

    if (!isSide || dir === 1) {
      elements.push(G.path('corr_R', [
        { type: 'move', x: 6 + shiftX, y: -45 },
        { type: 'quad', cx: 4 + shiftX, cy: -38, x: 8 + shiftX, y: -32 }
      ], { stroke: strokeStyle, lineWidth: 2 * intensity, lineCap: 'round' }));
    }

    return G.group('corrugator_supercilii', null, elements);
  }
}
