// B"H
import { SkylineLayerRenderer } from './SkylineLayerRenderer.js';
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

export class SidewalkLayerRenderer {
  static build(w, h) {
    const top = h * 0.74;
    const roadTop = h * 0.87;
    const nodes = [
      SkylineLayerRenderer.rect('sidewalk_main', 0, top, w, roadTop - top, '#bab9b2', '#6a6a64', 3),
      SkylineLayerRenderer.rect('curb_green', 0, roadTop - 12, w, 14, '#19b66b', '#0d5f38', 2)
    ];
    for (let x = 0; x < w; x += Math.max(76, w * 0.12)) {
      nodes.push(SkylineLayerRenderer.rect(`sidewalk_joint_${x}`, x, top, 3, roadTop - top, 'rgba(60,60,60,0.18)', 'rgba(0,0,0,0)', 0));
    }
    return G.group('sidewalk_layer', null, nodes);
  }
}