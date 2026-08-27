// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

export class CapillaryNetwork {
  static spawnMicroVeins(w, h) {
    return G.group('micro_veins', null, Array.from({ length: 120 }).map((_, i) => {
        const vx = (Math.random() - 0.5) * w * 1.9;
        const vy = (Math.random() - 0.5) * h * 1.9;
        return G.path(`vein_micro_${i}`, [
            { type: 'move', x: vx, y: vy },
            { type: 'bezier', 
              c1x: vx + (Math.random()-0.5)*15, c1y: vy + (Math.random()-0.5)*15, 
              c2x: vx + (Math.random()-0.5)*20, c2y: vy + (Math.random()-0.5)*20, 
              x: vx + (Math.random()-0.5)*28, y: vy + (Math.random()-0.5)*28 
            }
        ], { stroke: '#ff000033', lineWidth: 0.35 });
    }));
  }
}
