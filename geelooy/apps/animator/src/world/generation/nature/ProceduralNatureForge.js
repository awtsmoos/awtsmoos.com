
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { AwtsmoosNature } from '../AwtsmoosNature.js';

/**
 * @class ProceduralNatureForge
 * @description
 * THE FORGE OF THE FLORA (Kli HaTzemach).
 * B"H - No hardcoding! Every plant is a unique emanation of parameters.
 */
export class ProceduralNatureForge {
  static build(data, transform, time) {
    const type = data.species || data.type || 'tree';
    const s = (data.size || 100) * (transform.scaleX || 1.0);
    const color = data.color || '#2ecc71';
    
    // Global Wind Calculation
    const wind = Math.sin(time * 0.002 + (transform.x || 0)) * (s * 0.05);

    if (type === 'pine') {
      return G.group(`pine_${data.id}`, transform, [
        G.rect('trunk', -s*0.1, -s, s*0.2, s, { fill: '#3e2723' }),
        ...Array.from({length: 4}).map((_, i) => {
            const w = s * (1.0 - i * 0.2);
            const y = -s * 0.3 - (i * s * 0.2);
            return G.path(`t_${i}`, [
                { type: 'move', x: 0, y: y - s*0.5 + wind },
                { type: 'line', x: w/2, y: y },
                { type: 'line', x: -w/2, y: y },
                { type: 'close' }
            ], { fill: '#1b5e20', stroke: '#0d2e10', lineWidth: 2 });
        })
      ]);
    } 

    if (type === 'palm') {
      return G.group(`palm_${data.id}`, transform, [
        G.path('trunk', [
            { type: 'move', x: -s*0.1, y: 0 }, { type: 'quad', cx: s*0.3, cy: -s*0.5, x: wind, y: -s },
            { type: 'line', x: wind + s*0.1, y: -s }, { type: 'quad', cx: s*0.4, cy: -s*0.5, x: s*0.1, y: 0 }
        ], { fill: '#8d6e63' }),
        ...Array.from({length: 6}).map((_, i) => {
            const angle = (i / 6) * Math.PI * 2;
            const fx = wind + Math.cos(angle) * s * 0.8;
            const fy = -s + Math.sin(angle) * s * 0.4 + (Math.sin(time*0.005+i)*10);
            return G.path(`frond_${i}`, [{type:'move', x:wind, y:-s}, {type:'quad', cx:fx, cy:fy-s*0.2, x:fx, y:fy}], { stroke: color, lineWidth: 4, lineCap: 'round' });
        })
      ]);
    }

    if (type === 'bush') {
        return G.group(`bush_${data.id}`, transform, Array.from({length: 5}).map((_, i) => {
            const ox = Math.sin(i * 1.5) * s * 0.4;
            const oy = -s * 0.4 + Math.cos(i * 2.2) * s * 0.2 + wind;
            return G.circle(`leaf_${i}`, ox, oy, s * 0.4, { fill: color, stroke: '#145a32', lineWidth: 3 });
        }));
    }

    // Default: Hyper-Recursive Oak via Cache
    const cachedTree = AwtsmoosNature.drawCachedTree(0, 0, s, time, data.id?.length || 42);
    return G.group(`oak_${data.id}`, transform, [cachedTree]);
  }
}
