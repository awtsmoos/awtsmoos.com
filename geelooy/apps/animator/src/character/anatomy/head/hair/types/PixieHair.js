
// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';
import { HairBase } from '../HairBase.js';

export class PixieHair extends HairBase {
  static build(data, profile) {
    const { h, color } = this.getParams(data, profile);
    return G.ellipse('pixie', 0, -h.rY * 1.1, h.rX * 0.8, h.rY * 0.7, { fill: color });
  }
}
