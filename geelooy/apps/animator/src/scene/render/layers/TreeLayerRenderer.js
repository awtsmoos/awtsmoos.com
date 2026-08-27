// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { SkylineLayerRenderer } from './SkylineLayerRenderer.js';

export class TreeLayerRenderer {
  static build(w, h) {
    const y = h * 0.73;
    const trees = [
      { x: w * 0.08, s: 1.05 },
      { x: w * 0.18, s: 0.9 },
      { x: w * 0.82, s: 1 },
      { x: w * 0.93, s: 1.1 }
    ];
    return G.group('tree_layer', null, trees.map((t, i) => this.tree(`tree_${i}`, t.x, y, t.s)));
  }

  static tree(id, x, base, s) {
    const trunkH = 98 * s;
    const top = base - trunkH;
    return G.group(id, null, [
      SkylineLayerRenderer.rect(`${id}_trunk`, x - 7 * s, top, 14 * s, trunkH, '#7b4a27', '#3d2412', 3),
      G.ellipse(`${id}_leaf_a`, x - 35 * s, top + 6, 39 * s, 33 * s, 0, { fill: '#208a55', stroke: '#0e4a2e', lineWidth: 3 }),
      G.ellipse(`${id}_leaf_b`, x, top - 11, 51 * s, 43 * s, 0, { fill: '#29a866', stroke: '#0e4a2e', lineWidth: 3 }),
      G.ellipse(`${id}_leaf_c`, x + 35 * s, top + 8, 39 * s, 33 * s, 0, { fill: '#208a55', stroke: '#0e4a2e', lineWidth: 3 })
    ]);
  }
}