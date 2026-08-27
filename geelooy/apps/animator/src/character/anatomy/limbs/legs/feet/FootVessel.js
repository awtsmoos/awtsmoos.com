
// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';

/**
 * @file FootVessel.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 14: THE BASE (Malchut)
 * ═══════════════════════════════════════════════════════════════
 * Handles perspective-based shoe geometry.
 */
export class FootVessel {
  static build(side, data, config) {
    const { angle = 0, scaleX = 1.0, color = '#333' } = config;
    const dir = side === 'right' ? 1 : -1;
    
    return G.group(`foot_${side}`, { x: 0, y: 0, rotation: angle, scaleX }, [
      G.rect(`sole_${side}`, -15 * dir, 0, 30 * dir, 6, { fill: '#1a1a1a' }),
      G.path(`shoe_body_${side}`, [
        { type: 'move', x: -16 * dir, y: 0 },
        { type: 'bezier', c1x: -16 * dir, c1y: -15, c2x: 14 * dir, c2y: -15, x: 14 * dir, y: 0 },
        { type: 'line', x: -16 * dir, y: 0 }
      ], { fill: color, stroke: '#000', lineWidth: 2 })
    ]);
  }
}
