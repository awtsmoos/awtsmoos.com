
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { AwtsmoosMath } from '../../../engine/core/AwtsmoosMath.js';

export class TreeGenerator {
  static generate(x, y, size, time, seed) {
    const leaves = [];
    let rSeed = seed;

    for (let i = 0; i < 20; i++) {
      rSeed += 0.42;
      const angle = AwtsmoosMath.seededRandom(rSeed) * Math.PI * 2;
      const dist = AwtsmoosMath.seededRandom(rSeed + 0.1) * size;
      const lx = Math.cos(angle) * dist;
      const ly = -size * 0.8 + Math.sin(angle) * dist;
      
      const rot = angle * (180 / Math.PI) + 90;
      const scale = 0.6 + AwtsmoosMath.seededRandom(rSeed + 0.2) * 0.9;

      leaves.push(G.path(`leaf_${i}`, [
        { type: 'move', x: 0, y: 0 },
        { type: 'bezier', c1x: 8, c1y: -8, c2x: 12, c2y: -22, x: 0, y: -28 },
        { type: 'bezier', c1x: -12, c1y: -22, c2x: -8, c2y: -8, x: 0, y: 0 }
      ], { fill: '#2ecc71', stroke: '#145a32', lineWidth: 1, transform: { x: lx, y: ly, rotation: rot, scaleX: scale, scaleY: scale } }));
    }

    return G.group(`tree_${seed}`, { x, y }, [
      G.rect('trunk', -size*0.1, -size, size*0.2, size, { fill: '#4a2c10' }),
      ...leaves
    ]);
  }
}
