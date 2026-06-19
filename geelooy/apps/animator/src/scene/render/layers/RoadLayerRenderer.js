// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { SkylineLayerRenderer } from './SkylineLayerRenderer.js';

export class RoadLayerRenderer {
  static build(w, h) {
    const top = h * 0.87;
    const nodes = [
      SkylineLayerRenderer.rect('road_main', 0, top, w, h - top, '#252525', '#111', 3)
    ];
    for (let x = -50; x < w + 50; x += Math.max(120, w * 0.16)) {
      nodes.push(SkylineLayerRenderer.rect(`road_dash_${x}`, x, top + (h - top) * 0.42, 46, 5, 'rgba(230,230,220,0.35)', 'rgba(0,0,0,0)', 0));
    }
    return G.group('road_layer', null, nodes);
  }
}