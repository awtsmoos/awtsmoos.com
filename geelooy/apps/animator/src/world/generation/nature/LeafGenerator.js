
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { seededRandom } from '../../../utils/random.js';

/**
 * @file LeafGenerator.js
 * @description
 * THE LEAVES OF THE FOREST.
 * B"H
 * Abolishes the circle! Leaves are now tapered Bezier polygons.
 * This module generates clusters of these paths, rotating them in 
 * the direction of growth, creating a biological masterpiece 
 * using only fast 2D fills and strokes.
 */
export class LeafGenerator {
  /**
   * Generates a dense cluster of realistic leaves.
   */
  static generateCluster(id, x, y, size, seed) {
    const leaves = [];
    let rSeed = seed;

    const leafCount = 120; // Optimized density

    for (let i = 0; i < leafCount; i++) {
      rSeed += 0.5;
      const angle = seededRandom(rSeed) * Math.PI * 2;
      const dist = seededRandom(rSeed + 0.1) * size;
      const lx = Math.cos(angle) * dist;
      const ly = Math.sin(angle) * dist;
      const rot = angle * (180 / Math.PI) + 90;
      const scale = 0.5 + seededRandom(rSeed + 0.2) * 0.8;

      // The Leaf Path: A tapered biological spade
      const leafPath = [
        { type: 'move', x: 0, y: 0 },
        { type: 'bezier', c1x: 10, c1y: -10, c2x: 10, c2y: -25, x: 0, y: -30 },
        { type: 'bezier', c1x: -10, c1y: -25, c2x: -10, c2y: -10, x: 0, y: 0 }
      ];

      // B"H - Hyper-detailed vein network (Optimized)
      const microVeins = Array.from({ length: 8 }).map((_, vi) => {
          const vy = -3 - (vi * 3);
          const side = vi % 2 === 0 ? 1 : -1;
          const angle = (vi / 8) * Math.PI;
          return G.path(`leaf_micro_v_${vi}`, [
              { type: 'move', x: 0, y: vy },
              { type: 'line', x: side * 7 * Math.sin(angle), y: vy - 2 }
          ], { stroke: '#145a3288', lineWidth: 0.5 });
      });

      leaves.push(G.group(`leaf_${id}_${i}`, { x: lx, y: ly, rotation: rot, scaleX: scale, scaleY: scale }, [
        G.path('leaf_body', leafPath, { fill: '#2ecc71', stroke: '#145a32', lineWidth: 1.5 }),
        G.path('leaf_vein', [
            { type: 'move', x: 0, y: 0 },
            { type: 'line', x: 0, y: -28 }
        ], { stroke: '#145a32', lineWidth: 1.2 }),
        ...microVeins
      ]));
    }

    return G.group(id, { x, y }, leaves);
  }
}
