
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @class TensionMap
 * @description
 * THE BANDS OF RESTRICTION (Mitzrei Gevurah).
 * B"H
 * 
 * Replaces the string stub. When a human experiences sheer panic, stress, 
 * or blinding rage, the muscles of the entire skull tighten. 
 * This module draws topological wireframe-like bands across the temples 
 * and jaw to visually express that the flesh is being pulled taut.
 * 
 * @author Chariot of the Awtsmoos
 */
export class TensionMap {
  /**
   * @function build
   * @description Manifests global skull tension lines.
   * @param {Object} data - Character state.
   * @param {Object} profile - View perspective.
   * @param {number} rx - Skull width.
   * @param {number} ry - Skull height.
   * @returns {Object} VirtualGraph group of tension vectors.
   */
  static build(data, profile, rx, ry) {
    const stress = data.stress || data.fear || data.anger || 0;
    if (stress < 0.4) return G.group('tension_map_relaxed', null, []);

    const elements = [];
    const alpha = (stress - 0.3) * 0.2; // Max 0.14 opacity
    const strokeColor = `rgba(0, 0, 0, ${alpha})`;
    const lineWidth = 1 + (stress * 1.5);

    const dir = profile.dir || 1;
    const isSide = profile.type === 'side';

    // Temple Tension (Pulling back to the ears)
    if (!isSide || dir === -1) {
      elements.push(G.path('tension_temple_L1', [
        { type: 'move', x: -rx * 0.7, y: -ry * 0.3 },
        { type: 'line', x: -rx * 0.9, y: -ry * 0.4 }
      ], { stroke: strokeColor, lineWidth, lineCap: 'round' }));
      
      elements.push(G.path('tension_temple_L2', [
        { type: 'move', x: -rx * 0.65, y: -ry * 0.2 },
        { type: 'line', x: -rx * 0.85, y: -ry * 0.3 }
      ], { stroke: strokeColor, lineWidth: lineWidth * 0.6, lineCap: 'round' }));
    }

    if (!isSide || dir === 1) {
      elements.push(G.path('tension_temple_R1', [
        { type: 'move', x: rx * 0.7, y: -ry * 0.3 },
        { type: 'line', x: rx * 0.9, y: -ry * 0.4 }
      ], { stroke: strokeColor, lineWidth, lineCap: 'round' }));
      
      elements.push(G.path('tension_temple_R2', [
        { type: 'move', x: rx * 0.65, y: -ry * 0.2 },
        { type: 'line', x: rx * 0.85, y: -ry * 0.3 }
      ], { stroke: strokeColor, lineWidth: lineWidth * 0.6, lineCap: 'round' }));
    }

    // Jaw Clench Tension (Masseter bulging pull lines)
    if (!isSide || dir === -1) {
      elements.push(G.path('tension_jaw_L', [
        { type: 'move', x: -rx * 0.4, y: ry * 0.6 },
        { type: 'quad', cx: -rx * 0.6, cy: ry * 0.7, x: -rx * 0.8, y: ry * 0.5 }
      ], { stroke: strokeColor, lineWidth, lineCap: 'round' }));
    }

    if (!isSide || dir === 1) {
      elements.push(G.path('tension_jaw_R', [
        { type: 'move', x: rx * 0.4, y: ry * 0.6 },
        { type: 'quad', cx: rx * 0.6, cy: ry * 0.7, x: rx * 0.8, y: ry * 0.5 }
      ], { stroke: strokeColor, lineWidth, lineCap: 'round' }));
    }

    return G.group('tension_map_stressed', null, elements);
  }
}
