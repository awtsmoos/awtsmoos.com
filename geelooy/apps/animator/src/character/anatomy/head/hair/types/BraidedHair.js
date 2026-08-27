
// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';
import { HairBase } from '../HairBase.js';

export class BraidedHair extends HairBase {
  static build(data, profile) {
    const { h, color, view, dir } = this.getParams(data, profile);
    const nodes = [];
    nodes.push(G.path('braid_l', [{type: 'move', x: -h.rX, y: -h.rY * 0.5}, {type: 'line', x: -h.rX * 0.8, y: h.rY * 0.5}], {stroke: color, lineWidth: 6}));
    nodes.push(G.path('braid_r', [{type: 'move', x: h.rX, y: -h.rY * 0.5}, {type: 'line', x: h.rX * 0.8, y: h.rY * 0.5}], {stroke: color, lineWidth: 6}));
    return G.group('hair_braid_sys', null, nodes);
  }
}
