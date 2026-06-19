// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

export class EyelashGenerator {
  static generate(w, hC, eyelidDropLevel) {
    const upper = G.group('eyelashes_upper', null, Array.from({ length: 58 }).map((_, i) => {
        const t = i / 57;
        const ex = -w + (i * (w * 2) / 57);
        const ey = -hC * 0.52 + (eyelidDropLevel * hC * 0.8) - Math.sin(t * Math.PI) * 6;
        return G.path(`lash_u_${i}`, [
            { type: 'move', x: ex, y: ey },
            { type: 'quad', cx: ex + 2.5, cy: ey - 18, x: ex + 6, y: ey - 14 }
        ], { stroke: '#000', lineWidth: 1.2 });
    }));

    const lower = G.group('eyelashes_lower', null, Array.from({ length: 29 }).map((_, i) => {
        const ex = -w * 0.85 + (i * (w * 1.7) / 28);
        const ey = hC * 0.62;
        return G.path(`lash_l_${i}`, [
            { type: 'move', x: ex, y: ey },
            { type: 'quad', cx: ex + 1.5, cy: ey + 10, x: ex + 4, y: ey + 7 }
        ], { stroke: '#00000088', lineWidth: 0.9 });
    }));

    return [upper, lower];
  }
}
