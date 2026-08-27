
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file GumsUpper.js
 * @description
 * THE BORDERS OF BONE (Gingival Margins).
 * B"H
 * 
 * Exquisite anatomical reproduction of Gingival Interdental Papillae. 
 * Pink triangles pointing downwards between every tooth division.
 */
export class GumsUpper {
  static build(w, upperY, intensity, gapSpacing = 12) {
    if (intensity < 0.6) return null; // Only revealed on extreme shouting

    const nodes = [];
    const gumBase = upperY;

    // Background block of gum filling up to the skull roof
    nodes.push(G.rect('gums_backing', -w, -50, w * 2, 50 + gumBase, {
      fill: '#ff6b8b'
    }));

    // The Papillae (Pink V-Shapes hanging down between teeth gaps)
    for (let i = -w + gapSpacing; i < w; i += gapSpacing) {
      nodes.push(G.path(`papilla_${i}`, [
        { type: 'move', x: i - 4, y: gumBase },
        { type: 'quad', cx: i, cy: gumBase + 6, x: i, y: gumBase + 6 }, // Sharp point dipping down
        { type: 'quad', cx: i, cy: gumBase + 6, x: i + 4, y: gumBase }
      ], { 
        fill: '#ff6b8b', 
        stroke: '#a32a48', 
        lineWidth: 1.5,
        lineJoin: 'round'
      }));
    }

    // Heavy red line outlining the entire gum ridge boundary over the teeth
    nodes.push(G.path('gums_border_line', [
      { type: 'move', x: -w, y: gumBase },
      { type: 'line', x: w, y: gumBase }
    ], { stroke: '#a32a48', lineWidth: 3 }));

    return G.group('gums_upper_matrix', null, nodes);
  }
}
