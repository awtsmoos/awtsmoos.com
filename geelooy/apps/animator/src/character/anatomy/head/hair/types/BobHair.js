
// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';
import { HairBase } from '../HairBase.js';

export class BobHair extends HairBase {
  static build(data, profile) {
    const { h, color, view, dir } = this.getParams(data, profile);
    const nodes = [];
    const path = [
        { type: 'move', x: -h.rX * 1.1, y: -h.rY * 0.4 },
        { type: 'bezier', c1x: -h.rX * 1.4, c1y: -h.rY * 0.8, c2x: -h.rX * 1.4, c2y: -h.rY * 1.2, x: 0, y: -h.rY * 1.3 },
        { type: 'bezier', c1x: h.rX * 1.4, c1y: -h.rY * 1.2, c2x: h.rX * 1.4, c2y: -h.rY * 0.8, x: h.rX * 1.1, y: -h.rY * 0.4 },
        { type: 'line', x: h.rX * 0.9, y: 0 },
        { type: 'line', x: -h.rX * 0.9, y: 0 }
    ];
    nodes.push(G.path('hair_bob', path, { fill: color, stroke: '#000', lineWidth: 2 }));
    return G.group('hair_bob_sys', null, nodes);
  }
}
