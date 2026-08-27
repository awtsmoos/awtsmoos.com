
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { seededRandom } from '../../../utils/random.js';

/**
 * @file LeafGenerator.js
 * @description
 * THE LEAVES OF THE FOREST (Alei HaYa'ar).
 * B"H
 * Rectifies the 404 error by manifesting the missing leaf emanation. 
 * This module generates biological, tapered leaf paths. It is the 'Neshama' 
 * of the tree's greenery, providing the fundamental unit of the canopy.
 */
export class LeafGenerator {
  /**
   * Generates a cluster of realistic leaves using array modification logic.
   * @param {string} id - Base ID.
   * @param {number} x - Center X.
   * @param {number} y - Center Y.
   * @param {number} size - Cluster radius.
   * @param {number} seed - Deterministic soul-seed.
   */
  static generateCluster(id, x, y, size, seed) {
    const leaves = [];
    let rSeed = seed;

    const leafCount = 10;

    for (let i = 0; i < leafCount; i++) {
      rSeed += 0.42;
      const angle = seededRandom(rSeed) * Math.PI * 2;
      const dist = seededRandom(rSeed + 0.1) * size;
      const lx = Math.cos(angle) * dist;
      const ly = Math.sin(angle) * dist;
      
      // Point leaves away from the center of the cluster
      const rot = angle * (180 / Math.PI) + 90;
      const scale = 0.6 + seededRandom(rSeed + 0.2) * 0.9;

      // Hyper-realistic biological spade path
      const leafPath = [
        { type: 'move', x: 0, y: 0 },
        { type: 'bezier', c1x: 8, c1y: -8, c2x: 12, c2y: -22, x: 0, y: -28 },
        { type: 'bezier', c1x: -12, c1y: -22, c2x: -8, c2y: -8, x: 0, y: 0 }
      ];

      leaves.push(G.group(`leaf_${id}_${i}`, { 
        x: lx, y: ly, rotation: rot, scaleX: scale, scaleY: scale 
      }, [
        G.path('leaf_body', leafPath, { fill: '#2ecc71', stroke: '#145a32', lineWidth: 1 }),
        G.path('leaf_vein', [{type:'move', x:0, y:0}, {type:'line', x:0, y:-25}], { stroke: '#145a32', lineWidth: 0.5 })
      ]));
    }

    return G.group(id, { x, y }, leaves);
  }
}
