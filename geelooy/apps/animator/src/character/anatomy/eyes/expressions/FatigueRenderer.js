// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file FatigueRenderer.js
 * @description
 * INFRAORBITAL HOLLOWS / BAGS.
 */
export class FatigueRenderer {
  static build(id, baseW, baseH) {
    return G.path(`fatigue_${id}`, [
      { type: 'move', x: -baseW + 2, y: baseH + 4 },
      { type: 'quad', cx: 0, cy: baseH + 12, x: baseW - 2, y: baseH + 4 }
    ], { stroke: 'rgba(100,50,50,0.2)', lineWidth: 4, lineCap: 'round' });
  }
}
