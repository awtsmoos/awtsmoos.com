
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file LipCreases.js
 * @description
 * THE BOUNDARIES OF RESTRAINT (Kivutz).
 * B"H
 */
export class LipCreases {
  static build(lipPoints, viseme) {
    if (viseme !== 'O' && viseme !== 'M') return null;

    const upperLip = lipPoints[1];
    if (!upperLip) return null;

    const creases = [];
    const spread = 10;
    const height = 8;

    for(let x = -spread; x <= spread; x += spread) {
      const yBase = (upperLip.y || 0) + (upperLip.cy || 0) * 0.5 - 4;
      creases.push(G.path(`crease_u_${x}`, [
        { type: 'move', x: x, y: yBase },
        { type: 'line', x: x * 1.3, y: yBase - height }
      ], { stroke: '#000000', lineWidth: 2, lineCap: 'round' }));
    }

    return G.group('lip_tension_creases', null, creases);
  }
}
