// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file FurrowRenderer.js
 * @description
 * CORRUGATOR SUPERCILLI FURROWS.
 */
export class FurrowRenderer {
  static build(id, baseW, baseH, dir) {
    const innerX = (-baseW * dir) + (10 * dir); 
    return G.path(`furrow_${id}`, [
      { type: 'move', x: innerX, y: -baseH - 10 },
      { type: 'line', x: innerX + (2*dir), y: -baseH + 5 }
    ], { stroke: '#000', lineWidth: 2, lineCap: 'round' });
  }
}
