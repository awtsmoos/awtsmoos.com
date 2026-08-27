// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

export class SkyLayerRenderer {
  static build(w, h, scene = {}) {
    return G.group('sky_layer', null, [
      this.rect('sky_base', 0, 0, w, h, scene.sky || '#38aee2'),
      this.rect('sky_depth', 0, 0, w, h * 0.36, scene.skyTop || '#1f7daa'),
      this.rect('sky_horizon', 0, h * 0.36, w, h * 0.2, 'rgba(255,230,160,0.16)')
    ]);
  }

  static rect(id, x, y, w, h, fill) {
    return G.path(id, [
      { type: 'move', x, y },
      { type: 'line', x: x + w, y },
      { type: 'line', x: x + w, y: y + h },
      { type: 'line', x, y: y + h },
      { type: 'line', x, y }
    ], { fill, stroke: fill, lineWidth: 1 });
  }
}