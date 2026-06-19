
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { seededRandom } from '../../../../utils/random.js';
import { HouseGenerator } from './HouseGenerator.js';

export class StreetArray {
  static generate(startX, y, count, spacing, baseSeed) {
    const houses = [];
    let rSeed = baseSeed;
    for(let i=0; i<count; i++) {
      rSeed += 1.5;
      const w = 200 + seededRandom(rSeed)*150;
      const h = 180 + seededRandom(rSeed+1)*100;
      const color = `hsl(${seededRandom(rSeed+2)*360}, 40%, 40%)`;
      const scale = 1 - (i * 0.02);
      
      houses.push(HouseGenerator.generateHouse(startX + (i * spacing), y, w, h, color, rSeed, scale));
    }
    return G.group('street_array', null, houses);
  }
}
