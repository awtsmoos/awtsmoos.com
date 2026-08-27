
// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';
import { HatBase } from '../HatBase.js';

/**
 * @class Yarmulke
 * @description
 * THE DIVINE SHIELD (Kippah).
 * B"H
 * 
 * Re-aligned perfectly to the crown vertex of the organic egg skull!
 * Now includes the iconic colored rims of the Sage's attire.
 */
export class Yarmulke extends HatBase {
  static build(data, profile) {
    const { h, view, dir, color } = this.getParams(data, profile);
    const nodes = [];

    // The apex of the skull from Skull.js:
    const apexY = -h.rY * 1.15; // Centered on the crown

    let shiftX = 0;
    let w = 50;

    if (view === 'side') {
      shiftX = -15 * dir;
      w = 38;
    } else if (view === 'threeQuarter') {
      shiftX = -8 * dir;
      w = 44;
    }
    
    const kippahPath = [
      { type: 'move', x: -w + shiftX, y: apexY + 15 },
      // Arching perfectly over the apex
      { type: 'quad', cx: shiftX, cy: apexY - 25, x: w + shiftX, y: apexY + 15 },
      // Clinging to the scalp underneath
      { type: 'quad', cx: shiftX, cy: apexY + 5, x: -w + shiftX, y: apexY + 15 }
    ];

    nodes.push(G.path('kippah_base', kippahPath, { 
      fill: color, stroke: '#000', lineWidth: 3, lineJoin: 'round' 
    }));

    // Panel seams typical of classic fabric cuts
    nodes.push(G.path('kippah_seam', [
      { type: 'move', x: shiftX, y: apexY - 5 },
      { type: 'quad', cx: shiftX - (10*dir), cy: apexY + 5, x: shiftX - (15*dir), y: apexY + 12 }
    ], { stroke: 'rgba(0,0,0,0.4)', lineWidth: 1.5, lineCap: 'round' }));

    // Decorative rim (The Red & Gold Bands of Wisdom)
    const rimY = apexY + 12;
    nodes.push(G.path('kippah_rim_red', [
      { type: 'move', x: -w + shiftX + 2, y: rimY },
      { type: 'quad', cx: shiftX, cy: rimY + 5, x: w + shiftX - 2, y: rimY }
    ], { stroke: '#e74c3c', lineWidth: 3, lineCap: 'round' }));
    
    nodes.push(G.path('kippah_rim_gold', [
      { type: 'move', x: -w + shiftX + 1, y: rimY - 4 },
      { type: 'quad', cx: shiftX, cy: rimY + 1, x: w + shiftX - 1, y: rimY - 4 }
    ], { stroke: '#f1c40f', lineWidth: 2, lineCap: 'round' }));

    return G.group('kippah_sys', null, nodes);
  }
}
