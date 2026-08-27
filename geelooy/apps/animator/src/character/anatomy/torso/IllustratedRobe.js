
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * @file IllustratedRobe.js
 * @brief THE GARMENTS OF LIGHT (Levushim).
 */
export class IllustratedRobe {
  static build(data, color = '#1a40ff') {
    // B"H - Taller and wider for better presence
    const torsoW = 110;
    const torsoH = 160;

    return G.group('robe_assembly', null, [
      // 1. THE MAIN TORSO BLOCK (Descending to feet)
      G.path('robe_body', [
        { type: 'move', x: -torsoW/2.2, y: -torsoH },
        { type: 'quad', cx: -torsoW/1.4, cy: -torsoH/2, x: -torsoW/1.1, y: 10 }, // Flare down
        { type: 'line', x: torsoW/1.1, y: 10 },
        { type: 'quad', cx: torsoW/1.4, cy: -torsoH/2, x: torsoW/2.2, y: -torsoH },
        { type: 'close' }
      ], { fill: color, stroke: '#000000', lineWidth: 5, lineJoin: 'round' }),
      
      // 2. THE CEREMONIAL COLLAR
      G.path('collar_L', [
        { type: 'move', x: 0, y: -torsoH + 40 },
        { type: 'line', x: -35, y: -torsoH },
        { type: 'line', x: -10, y: -torsoH },
        { type: 'line', x: 0, y: -torsoH + 15 }
      ], { fill: '#111', stroke: '#000', lineWidth: 4, lineJoin: 'round' }),
      
      G.path('collar_R', [
        { type: 'move', x: 0, y: -torsoH + 40 },
        { type: 'line', x: 35, y: -torsoH },
        { type: 'line', x: 10, y: -torsoH },
        { type: 'line', x: 0, y: -torsoH + 15 }
      ], { fill: '#111', stroke: '#000', lineWidth: 4, lineJoin: 'round' }),

      // 3. INNER SHIRT
      G.path('shirt_peek', [
        { type: 'move', x: -12, y: -torsoH },
        { type: 'line', x: 0, y: -torsoH + 18 },
        { type: 'line', x: 12, y: -torsoH }
      ], { fill: '#ffffff', stroke: '#000', lineWidth: 2 })
    ]);
  }
}
