
// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';
import { HairBase } from '../HairBase.js';

export class ShaggyHair extends HairBase {
  static build(data, profile) {
    const { h, color } = this.getParams(data, profile);
    return G.path('shaggy', [
        {type: 'move', x: -h.rX, y: -h.rY * 0.5},
        {type: 'bezier', c1x: -h.rX, c1y: -h.rY * 1.5, c2x: h.rX, c2y: -h.rY * 1.5, x: h.rX, y: -h.rY * 0.5},
        {type: 'bezier', c1x: h.rX * 0.5, c1y: -h.rY * 0.3, c2x: -h.rX * 0.5, c2y: -h.rY * 0.3, x: -h.rX, y: -h.rY * 0.5}
    ], {fill: color});
  }
}
