
// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';
import { HairBase } from '../HairBase.js';

export class AfroHair extends HairBase {
  static build(data, profile) {
    const { h, color, view, dir } = this.getParams(data, profile);
    const nodes = [];
    const volApex = -h.rY * 1.6;
    nodes.push(G.circle('hair_afro', 0, volApex, h.rX * 1.3, { fill: color, stroke: '#555', lineWidth: 2 }));
    return G.group('hair_afro_sys', null, nodes);
  }
}
