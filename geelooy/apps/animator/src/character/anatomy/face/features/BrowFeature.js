// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

export class BrowFeature {
  static draw(id, x, y, rotation, specs) {
    const { width, height } = specs;
    return G.rect(`brow_${id}`, x - width/2, y - height/2, width, height, { 
      fill: '#000', 
      rotation 
    });
  }
}
