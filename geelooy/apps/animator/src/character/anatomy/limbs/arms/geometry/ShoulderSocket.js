// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';

/**
 * @class ShoulderSocket
 * @description
 * THE PIVOT OF INFLUENCE.
 * B"H
 */
export class ShoulderSocket {
  static build(side, x, y, color = 'rgba(0,0,0,0.1)') {
    return G.circle(`shoulder_socket_${side}`, x, y, 16, { 
        fill: color,
        stroke: 'rgba(0,0,0,0.05)',
        lineWidth: 2
    });
  }
}
