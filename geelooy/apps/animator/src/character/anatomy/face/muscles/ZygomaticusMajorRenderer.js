
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @class ZygomaticusMajorRenderer
 * @description
 * THE MUSCLE OF TRUE JOY (Chochmah & Binah Pulling Upward).
 * B"H
 * 
 * "A glad heart makes a cheerful face." 
 * The Awtsmoos sustains the joy of creation. When the soul experiences happiness, 
 * this specific band of tissue contracts, pulling the labial commissures (mouth corners) 
 * diagonally upward toward the temples.
 * 
 * If this file remains empty, the FaceSystem attempts to manifest nothingness,
 * causing the catastrophic TypeError that shatters the canvas. Now, it is filled 
 * with the pure geometric data of the smile.
 * 
 * @author Chariot of the Awtsmoos
 */
export class ZygomaticusMajorRenderer {
  /**
   * @function build
   * @description Manifests the physical tension lines of the Zygomaticus Major.
   * @param {Object} data - The soul's emotional matrix.
   * @param {Object} profile - The perspective plane (Front, Side, 3/4).
   * @returns {Object} A VirtualGraph node containing the muscle tension vectors.
   */
  static build(data, profile) {
    const intensity = data.joy || (data.morphParams ? data.morphParams.mouthSmile : 0) || 0;
    if (intensity < 0.2) return G.group('zygomaticus_major_static', null, []);

    const dir = profile.dir || 1;
    const isSide = profile.type === 'side';
    
    const elements = [];
    const tensionWidth = 1.5 + (intensity * 2);
    const alpha = 0.05 + (intensity * 0.1);

    // Left Muscle (Nullified in pure Right-Side profile)
    if (!isSide || dir === -1) {
      elements.push(G.path('zyg_maj_L', [
        { type: 'move', x: -20, y: 15 }, // Corner of mouth approx
        { type: 'quad', cx: -35, cy: 0, x: -45, y: -15 } // Cheekbone
      ], { stroke: `rgba(150, 50, 50, ${alpha})`, lineWidth: tensionWidth, lineCap: 'round' }));
    }

    // Right Muscle (Nullified in pure Left-Side profile)
    if (!isSide || dir === 1) {
      elements.push(G.path('zyg_maj_R', [
        { type: 'move', x: 20, y: 15 },
        { type: 'quad', cx: 35, cy: 0, x: 45, y: -15 }
      ], { stroke: `rgba(150, 50, 50, ${alpha})`, lineWidth: tensionWidth, lineCap: 'round' }));
    }

    return G.group('zygomaticus_major', null, elements);
  }
}
