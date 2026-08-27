
// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';
import { HairBase } from '../HairBase.js';

export class MulletHair extends HairBase {
  static build(data, profile) {
    const { h, color } = this.getParams(data, profile);
    return G.group('hair_mullet', null, [
      G.rect('top', -h.rX, -h.rY * 1.2, h.rX * 2, h.rY * 0.5, { fill: color }),
      G.rect('back', h.rX * 0.5, -h.rY * 0.8, h.rX * 0.6, h.rY * 1.2, { fill: color })
    ]);
  }
}
