
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * @class GrassGenerator
 * @description
 * THE GROUND BREATH (Nishmat Haaretz).
 * Generates purely geometric grass clusters that sway in the wind.
 */
export class GrassGenerator {
  static generate(x, y, count, time, seed) {
    const blades = [];
    const windAngle = Math.sin((time * 0.001) + x) * 0.15;
    
    // B"H - Hyper-detailed grass field (Optimized for performance)
    const densityMultiplier = 15; 
    const hyperCount = count * densityMultiplier;
    
    for (let i = 0; i < hyperCount; i++) {
        const bx = x + (i * (8 / densityMultiplier)) - (count * 4);
        const rand = Math.sin(seed + i * 543.21);
        const h = 20 + (rand * 15);
        const tilt = windAngle * (1 + Math.abs(rand)) + (Math.sin(time * 0.003 + i) * 0.1);

        blades.push(G.path(`grass_${seed}_${i}`, [
            { type: 'move', x: bx, y: y },
            { type: 'line', x: bx + Math.sin(tilt) * h, y: y - Math.cos(tilt) * h }
        ], { stroke: rand > 0 ? '#1a3317' : '#2d5a27', lineWidth: (2 + Math.abs(rand) * 2) / 2.5, lineCap: 'round' }));
    }

    return G.group(`grass_cluster_${seed}`, null, blades);
  }
}
