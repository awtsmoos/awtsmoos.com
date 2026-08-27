
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * @class MountainCap
 * @description
 * THE CROWN OF THE MOUNTAIN (Keter HaHar).
 * B"H
 */
export class MountainCap {
  static build(w, h) {
    // Pure snow cap using source-atop clipping mode to bind to the mountain base
    return G.rect('mnt_snow', 0, -h, w, h * 0.35, { 
      fill: 'rgba(255,255,255,0.85)', 
      composite: 'source-atop' 
    });
  }
}
