
// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';
import { HairBase } from '../HairBase.js';

export class BuzzCutHair extends HairBase {
  static build(data, profile) {
    const { h, color } = this.getParams(data, profile);
    return G.group('hair_buzz', null, [
      G.ellipse('buzz', 0, -h.rY * 1.1, h.rX * 0.95, h.rY * 0.9, { fill: color, fillOpacity: 0.5 })
    ]);
  }
}
