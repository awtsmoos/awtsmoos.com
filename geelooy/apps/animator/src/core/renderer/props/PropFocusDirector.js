// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/** Screen-space story props for cinematic mode; old prop systems remain alive. */
export class PropFocusDirector {
  static screenProps(plan = {}, safe = {}) {
    if (!plan.enabled) return null;
    const y = safe.height * 0.58;
    const x = safe.width * 0.5;
    const nodes = [
      G.rect('cinematic_book', x - 58, y - 12, 62, 28, { fill: '#7b4b22', stroke: '#2d1608', lineWidth: 3 }),
      G.rect('cinematic_book_page', x - 52, y - 7, 50, 18, { fill: '#f7e7b2', stroke: '#7b4b22', lineWidth: 1 }),
      G.circle('cinematic_soup_bowl', x + 38, y + 2, 22, { fill: '#f6f0dd', stroke: '#7b4b22', lineWidth: 3 }),
      G.circle('cinematic_soup', x + 38, y + 2, 13, { fill: '#e9bd55' }),
      G.rect('cinematic_cup', x + 74, y - 16, 22, 28, { fill: '#6aa55a', stroke: '#2f5d2b', lineWidth: 2 })
    ];
    return G.group('cinematic_prop_focus_layer', null, nodes);
  }
}
