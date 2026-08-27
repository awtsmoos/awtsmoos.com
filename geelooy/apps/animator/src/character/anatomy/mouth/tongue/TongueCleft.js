
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @class TongueCleft
 * @description
 * THE CENTRAL DIVIDER.
 * B"H
 */
export class TongueCleft {
  static build(jawDrop, isArched) {
    const baseY = 25 + jawDrop;
    const archY = isArched ? -45 : 10; 
    
    return G.path('tongue_cleft_line', [
      { type: 'move', x: 0, y: baseY + archY + 8 },
      { type: 'line', x: 0, y: baseY + 25 }
    ], { stroke: '#8b0020', lineWidth: 3, lineCap: 'round' });
  }
}
