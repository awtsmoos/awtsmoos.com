
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LeafGenerator } from './LeafGenerator.js';
import { seededRandom } from '../../../utils/random.js';

/**
 * @file LeafCloudFactory.js
 * @description
 * THE GREENERY OF ASSIYAH.
 * B"H
 * Manifests dense clusters of leaves to sit atop the recursive wood.
 */
export class LeafCloudFactory {
  static build(id, x, y, size, seed) {
    const clouds = [];
    let rSeed = seed;

    for (let i = 0; i < 6; i++) {
      rSeed += 0.77;
      const ox = (seededRandom(rSeed) - 0.5) * size * 1.8;
      const oy = -size * 0.8 + (seededRandom(rSeed + 0.1) - 0.5) * size * 1.2;
      
      clouds.push(LeafGenerator.generateCluster(`cloud_${id}_${i}`, x + ox, y + oy, size * 0.4, rSeed));
    }

    return G.group(`canopy_${id}`, null, clouds);
  }
}
