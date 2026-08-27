// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';

export class PompadourHair {
  static build(data, profile) {
    const color = data.colors?.hair || '#222';
    return G.group('hair_pompadour', null, [
        G.ellipse('pomp_base', 0, -85, 45, 25, 0, { fill: color, stroke: '#000', lineWidth: 2 }),
        G.ellipse('pomp_top', 0, -100, 35, 20, 0, { fill: color })
    ]);
  }
}
