
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * @class RoofStructures
 * @description
 * THE CROWNS OF THE CITY.
 * B"H
 */
export class RoofStructures {
  static build(w, h) {
    return G.group('roof_elements', null, [
      // Overhanging Edge
      G.rect('roof_lip', -5, -h - 10, w + 10, 10, { fill: '#111' }),
      // AC Unit / Water Tower abstraction
      G.rect('ac_unit', w * 0.2, -h - 30, 20, 20, { fill: '#444', stroke: '#000', lineWidth: 2 })
    ]);
  }
}
