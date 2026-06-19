
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @class LevatorLabiiSuperiorisRenderer
 * @description
 * THE MUSCLE OF REVULSION (Sneeze/Disgust/Sneer).
 * B"H
 * 
 * This tissue elevates the upper lip and flares the nostril. When a character 
 * experiences 'disgust' or 'hate', this muscle generates deep angular creases 
 * extending from the sides of the nose down to the upper lip.
 * 
 * @author Chariot of the Awtsmoos
 */
export class LevatorLabiiSuperiorisRenderer {
  /**
   * @function build
   * @description Manifests the sneer tension folds.
   * @param {Object} data - The soul's emotional state.
   * @param {Object} profile - The perspective transformation plane.
   * @returns {Object} VirtualGraph group containing the sneer folds.
   */
  static build(data, profile) {
    const intensity = data.disgust || data.hate || (data.morphParams ? data.morphParams.mouthGrimace : 0) || 0;
    if (intensity < 0.2) return G.group('levator_labii_static', null, []);

    const dir = profile.dir || 1;
    const isSide = profile.type === 'side';
    const elements = [];
    
    const alpha = 0.05 + (intensity * 0.15);
    const strokeColor = `rgba(0, 0, 0, ${alpha})`;
    const lineWidth = 1.5 + (intensity * 2);

    // Left Sneer Fold
    if (!isSide || dir === -1) {
      elements.push(G.path('levator_L', [
        { type: 'move', x: -12, y: -5 }, // Side of nose
        { type: 'quad', cx: -18, cy: 5, x: -15, y: 12 } // Down to upper lip
      ], { stroke: strokeColor, lineWidth: lineWidth, lineCap: 'round' }));
    }

    // Right Sneer Fold
    if (!isSide || dir === 1) {
      elements.push(G.path('levator_R', [
        { type: 'move', x: 12, y: -5 },
        { type: 'quad', cx: 18, cy: 5, x: 15, y: 12 }
      ], { stroke: strokeColor, lineWidth: lineWidth, lineCap: 'round' }));
    }

    return G.group('levator_labii_superioris', null, elements);
  }
}
