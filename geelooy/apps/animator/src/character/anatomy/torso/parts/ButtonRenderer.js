// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file ButtonRenderer.js
 */
export class ButtonRenderer {
  static build(yCenter) {
    const elements = [];
    const buttonCount = 3;
    for (let i = 0; i < buttonCount; i++) {
      elements.push(G.ellipse(`button_${i}`, 0, yCenter + 10 + i * 20, 3, 3, 0, { fill: '#111' }));
    }
    return elements;
  }
}
