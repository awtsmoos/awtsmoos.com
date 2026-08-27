
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { AwtsmoosMath } from '../../../engine/core/AwtsmoosMath.js';

export class ProceduralCityForge {
  static build(data, transform, time) {
    const type = data.style || data.type || 'building';
    const w = (data.w || 150) * (transform.scaleX || 1.0);
    const h = (data.h || 300) * (transform.scaleY || 1.0);
    const color = data.color || '#2c3e50';
    const seed = (data.id || transform.x).toString().split('').reduce((a, b) => a + b.charCodeAt(0), 0);

    const windows = [];
    for (let r = 0; r < Math.floor(h/40); r++) {
        for (let c = 0; c < Math.floor(w/30); c++) {
            if (AwtsmoosMath.seededRandom(seed + r + c) > 0.6) {
                windows.push(G.rect(`win_${r}_${c}`, -w/2 + 10 + c*30, -h + 20 + r*40, 15, 25, { fill: '#f1c40f' }));
            }
        }
    }

    return G.group(`sky_${data.id}`, transform, [
        G.rect('base', -w/2, -h, w, h, { fill: color, stroke: '#000', lineWidth: 6 }),
        ...windows,
        G.rect('antenna', -2, -h - 80, 4, 80, { fill: '#555' }),
        G.circle('light', 0, -h - 80, 5, { fill: '#e74c3c' })
    ]);
  }
}
