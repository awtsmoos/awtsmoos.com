
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * @class FurnitureGenerator
 * @description
 * THE INANIMATE VESSELS (Domem).
 * B"H
 */
export class FurnitureGenerator {
  static kitchenTable(x, y, w = 300) {
    return G.group('k_table', { x, y }, [
      G.rect('leg_l', -w/2 + 20, 0, 15, 100, { fill: '#4a2c10', stroke: '#000', lineWidth: 3 }),
      G.rect('leg_r', w/2 - 35, 0, 15, 100, { fill: '#4a2c10', stroke: '#000', lineWidth: 3 }),
      G.rect('top', -w/2, -10, w, 20, { fill: '#5d3a1a', stroke: '#000', lineWidth: 4, radius: 4 })
    ]);
  }

  static officeDesk(x, y) {
    const w = 250;
    return G.group('o_desk', { x, y }, [
      G.rect('base_l', -w/2, 0, 60, 100, { fill: '#333', stroke: '#000', lineWidth: 3 }),
      G.rect('base_r', w/2 - 60, 0, 60, 100, { fill: '#333', stroke: '#000', lineWidth: 3 }),
      G.rect('top', -w/2 - 10, -10, w + 20, 15, { fill: '#222', stroke: '#000', lineWidth: 3 })
    ]);
  }

  static chair(x, y, dir = 1) {
    return G.group('chair', { x, y, scaleX: dir }, [
      G.rect('back', -25, -60, 10, 60, { fill: '#111', stroke: '#000', lineWidth: 3 }),
      G.rect('seat', -25, 0, 50, 10, { fill: '#111', stroke: '#000', lineWidth: 3 }),
      G.rect('leg', -20, 10, 6, 30, { fill: '#000' }),
      G.rect('leg2', 14, 10, 6, 30, { fill: '#000' })
    ]);
  }
}
