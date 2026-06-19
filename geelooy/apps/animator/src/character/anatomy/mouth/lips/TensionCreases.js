
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file TensionCreases.js
 * @description
 * THE BOUNDARIES OF RESTRAINT (Kivutz).
 * B"H
 * 
 * When the mouth puckers into an 'O' or seals into an 'M', the skin bunches.
 * We generate tiny vertical tension lines radiating outward from the lip perimeter.
 */
export class TensionCreases {
  static build(lipPoints, viseme) {
    if (viseme !== 'O' && viseme !== 'M') return null;

    const raw = lipPoints.raw;
    if (!raw || raw.length < 8) return null;

    // Center Top is 2, Center Bot is 6
    const topY = raw[2].y;
    const botY = raw[6].y;

    const creases = [];
    const spread = 8;
    const height = 6;

    // Upper lip creases radiating upwards
    for(let x = -spread; x <= spread; x += spread) {
      creases.push(G.path(`crease_u_${x}`, [
        { type: 'move', x: x, y: topY - 5 },
        { type: 'line', x: x * 1.2, y: topY - 5 - height }
      ], { stroke: 'rgba(0,0,0,0.5)', lineWidth: 1.5, lineCap: 'round' }));
    }

    // Lower lip creases radiating downwards
    for(let x = -spread; x <= spread; x += spread) {
      creases.push(G.path(`crease_d_${x}`, [
        { type: 'move', x: x, y: botY + 5 },
        { type: 'line', x: x * 1.2, y: botY + 5 + height }
      ], { stroke: 'rgba(0,0,0,0.5)', lineWidth: 1.5, lineCap: 'round' }));
    }

    return G.group('lip_tension_creases', null, creases);
  }
}
