
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { seededRandom } from '../../../utils/random.js';

/**
 * @class SkyscraperNode
 * @description
 * THE TOWERS OF BABEL (Migdalei Babel).
 * B"H
 */
export class SkyscraperNode {
    static build(data, transform, w, h) {
        const color = data.color || '#1a1a1a';
        const seed = data.id?.charCodeAt(0) || 42;
        const windows = [];
        
        for (let r = 0; r < Math.floor(h/30); r++) {
            for (let c = 0; c < Math.floor(w/25); c++) {
                if (seededRandom(seed + r + c) > 0.6) {
                    windows.push(G.rect(`win_${r}_${c}`, -w/2 + 10 + c*25, -h + 20 + r*30, 10, 15, { fill: '#f1c40f' }));
                }
            }
        }

        return G.group(`sky_${data.id}`, transform, [
            G.rect('base', -w/2, -h, w, h, { fill: color, stroke: '#000', lineWidth: 6 }),
            ...windows,
            G.rect('antenna', -2, -h - 60, 4, 60, { fill: '#555' }),
            G.circle('light', 0, -h - 60, 4, { fill: '#e74c3c' })
        ]);
    }
}
