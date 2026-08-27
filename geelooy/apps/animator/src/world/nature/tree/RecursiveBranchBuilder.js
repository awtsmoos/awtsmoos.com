
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { seededRandom } from '../../../utils/random.js';

/**
 * @file RecursiveBranchBuilder.js
 * @description
 * THE BRANCHES OF REVELATION.
 * B"H
 * Restores the intense fractal branching algorithms. 
 * Every limb of the tree is a recursive descendant of the trunk, 
 * tapering its physical width until it reaches the leaves.
 */
export class RecursiveBranchBuilder {
  /**
   * Sprouts a complex trunk and branch network.
   */
  static build(id, x, y, size, seed) {
    const branches = [];
    let rSeed = seed;

    const rand = (min, max) => {
      rSeed += 0.137; // Prime increment for soul-shuffling
      return min + seededRandom(rSeed) * (max - min);
    };

    /**
     * Internal recursive Sprouter.
     */
    const sprout = (bx, by, angle, length, depth, width) => {
      if (depth === 0) return;

      const x2 = bx + Math.cos(angle) * length;
      const y2 = by + Math.sin(angle) * length;

      // The segment of wood
      branches.push(G.path(`wood_${depth}_${bx}`, [
        { type: 'move', x: bx, y: by },
        { type: 'line', x: x2, y: y2 }
      ], { stroke: '#4d2c12', lineWidth: width, lineCap: 'round' }));

      // Texture Grains (The Bark)
      if (width > 4) {
        branches.push(G.path(`grain_${depth}`, [
          { type: 'move', x: bx + width * 0.2, y: by },
          { type: 'line', x: x2 + width * 0.2, y: y2 }
        ], { stroke: 'rgba(0,0,0,0.2)', lineWidth: width * 0.3 }));
      }

      // Branch Splitting (The Multiply Directive)
      const splitCount = depth > 3 ? 2 : rand(1, 3);
      for (let i = 0; i < splitCount; i++) {
        sprout(
          x2, y2, 
          angle + rand(-0.6, 0.6), 
          length * rand(0.65, 0.85), 
          depth - 1, 
          width * 0.7
        );
      }
    };

    // Root invocation: Straight up into the heavens
    sprout(x, y, -Math.PI / 2, size * 0.5, 5, size * 0.12);

    return G.group(`branches_${id}`, null, branches);
  }
}
