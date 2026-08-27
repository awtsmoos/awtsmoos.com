
// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';

export class HouseDoor {
  static build() {
    return G.group('door', { x: 0, y: -25 }, [
      G.rect('door_frame', -20, -25, 40, 50, { fill: '#5c4033', stroke: '#000', lineWidth: 3 }),
      G.circle('doorknob', 12, 0, 4, { fill: '#ffd700', stroke: '#000', lineWidth: 1 })
    ]);
  }
}
