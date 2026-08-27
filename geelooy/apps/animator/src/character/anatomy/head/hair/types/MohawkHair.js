// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';
import { StrandRenderer } from '../parts/StrandRenderer.js';

export class MohawkHair {
  static build(data, profile) {
    const color = data.colors?.hair || '#222';
    const strands = [];
    for(let i = -20; i <= 20; i += 5) {
        strands.push(StrandRenderer.build(`mohawk_${i}`, [
            { type: 'move', x: i, y: -70 },
            { type: 'line', x: i, y: -100 }
        ], color, 6));
    }
    return G.group('hair_mohawk', null, strands);
  }
}
