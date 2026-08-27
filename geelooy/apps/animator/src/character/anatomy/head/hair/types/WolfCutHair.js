
// B"H
import { VirtualGraph as G } from '../../../../../engine/graph/VirtualGraph.js';
import { HairBase } from '../HairBase.js';

export class WolfCutHair extends HairBase {
  static build(data, profile) {
    const { h, color } = this.getParams(data, profile);
    return G.group('wolf_cut', {}, [
        G.ellipse('top', 0, -h.rY * 1.0, h.rX * 0.9, h.rY * 0.6, {fill: color}),
        G.path('bottom', [{type:'move', x: -h.rX, y: -h.rY * 0.4}, {type: 'line', x: -h.rX * 0.5, y: h.rY * 0.3}, {type:'line', x: h.rX * 0.5, y: h.rY * 0.3}, {type:'line', x: h.rX, y: -h.rY * 0.4}], {fill: color})
    ]);
  }
}
