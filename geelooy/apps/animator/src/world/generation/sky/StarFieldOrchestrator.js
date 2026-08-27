
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

export class StarFieldOrchestrator {
  static build(width, height, timeOfDay, time) {
    if (timeOfDay < 0.6) return null;
    const stars = [];
    const intensity = (timeOfDay - 0.6) / 0.4;
    for (let i = 0; i < 60; i++) {
      let starX = (Math.sin(i * 721) * 10000) % width;
      if (starX < 0) starX += width;
      let starY = (Math.cos(i * 311) * 10000) % (height * 0.6);
      if (starY < 0) starY += height * 0.6;
      const sz = 1 + (Math.sin(i + time * 0.002) + 1);
      const alpha = ((Math.sin(i + time * 0.005) + 1) / 2) * intensity;
      stars.push(G.circle(`star_${i}`, starX, starY, sz, { fill: '#ffffff', alpha }));
    }
    return G.group('star_field', null, stars);
  }
}
