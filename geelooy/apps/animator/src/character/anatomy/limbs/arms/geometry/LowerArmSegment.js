// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';

/**
 * @class LowerArmSegment
 * @description
 * THE PRECISION OF THE FOREARM.
 * B"H
 */
export class LowerArmSegment {
  static build(side, p1, p2, sleeveColor) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const angle = Math.atan2(dy, dx);
    const perp = angle + Math.PI/2;
    
    const wTop = 11;
    const wBot = 8;

    const points = [
      { type: 'move', x: p1.x + Math.cos(perp) * wTop, y: p1.y + Math.sin(perp) * wTop },
      { type: 'line', x: p2.x + Math.cos(perp) * wBot, y: p2.y + Math.sin(perp) * wBot },
      { type: 'line', x: p2.x - Math.cos(perp) * wBot, y: p2.y - Math.sin(perp) * wBot },
      { type: 'line', x: p1.x - Math.cos(perp) * wTop, y: p1.y - Math.sin(perp) * wTop },
      { type: 'close' }
    ];
    
    return G.path(`forearm_vessel_${side}`, points, { 
      fill: sleeveColor, 
      stroke: '#000', 
      lineWidth: 3, 
      lineJoin: 'round'
    });
  }
}
