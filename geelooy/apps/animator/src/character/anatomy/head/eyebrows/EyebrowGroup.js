// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { EyebrowVessel } from './EyebrowVessel.js';

/**
 * @file EyebrowGroup.js
 * @description
 * THE ARCHES OF EXPRESSION.
 * B"H
 */
export class EyebrowGroup {
  static build(data, profile, morph) {
    const brows = [];
    
    profile.eyebrows.visible.forEach(side => {
      const config = profile.eyebrows[side];
      const dir = side === 'right' ? 1 : (side === 'left' ? -1 : profile.dir);
      
      // B"H - Pure precision alignment. 
      // config.x already contains the correct world-space signed offset for the brow.
      brows.push(G.group(`br_${side}`, { x: config.x, y: 0 }, [ 
        EyebrowVessel.build(side[0].toUpperCase(), morph, 26 * config.scaleX, dir, data.eyebrowShape || 'standard')
      ]));
    });

    return G.group('eyebrows_layer', { x: 0, y: -45 }, brows); // Slightly higher placement
  }
}
