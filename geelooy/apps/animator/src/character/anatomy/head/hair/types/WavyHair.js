
// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';
import { HairBase } from '../HairBase.js';

export class WavyHair extends HairBase {
  static build(data, profile) {
    const { h, color } = this.getParams(data, profile);
    return G.path('wavy', [
        {type: 'move', x: -h.rX, y: -h.rY * 0.5},
        {type: 'bezier', c1x: -h.rX * 0.5, c1y: -h.rY * 1.8, c2x: h.rX * 0.5, c2y: -h.rY * 1.0, x: h.rX, y: -h.rY * 0.5},
        {type: 'bezier', c1x: h.rX * 0.3, c1y: -h.rY * 0.3, c2x: -h.rX * 0.3, c2y: -h.rY * 0.3, x: -h.rX, y: -h.rY * 0.5}
    ], {fill: color});
  }
}
