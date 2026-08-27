
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @class SebaceousFlow
 * @description
 * THE OIL OF GLADNESS (Shemen Sasson).
 * B"H
 * 
 * Replaces the string stub. Bare skin reflects the ambient light of the world, 
 * especially on the forehead, the tip of the nose, and the cheekbones where 
 * natural oils (sebaceous glands) reside. 
 * We use flat, low-alpha white polygons to map these specular highlights.
 * 
 * @author Chariot of the Awtsmoos
 */
export class SebaceousFlow {
  /**
   * @function build
   * @description Manifests specular skin shine.
   * @param {Object} data - Character state.
   * @param {Object} profile - View perspective.
   * @param {number} rx - Skull width.
   * @param {number} ry - Skull height.
   * @returns {Object} VirtualGraph group of specular zones.
   */
  static build(data, profile, rx, ry) {
    const elements = [];
    const isNight = data.sceneTimeOfDay > 0.6;
    // Shine is less pronounced at night unless illuminated
    const alpha = isNight ? 0.03 : 0.08; 
    const shineColor = `rgba(255, 255, 255, ${alpha})`;

    const dir = profile.dir || 1;
    const isSide = profile.type === 'side';

    // 1. Forehead Shine (A wide, subtle horizontal ellipse)
    const fhX = isSide ? (rx * 0.6 * dir) : 0;
    const fhW = isSide ? rx * 0.4 : rx * 0.6;
    elements.push(G.ellipse('shine_forehead', fhX, -ry * 0.6, fhW, 15, 0, { fill: shineColor }));

    // 2. Nose Tip Shine (A sharp, small vertical dot/ellipse)
    const noseX = isSide ? (rx * 0.8 * dir) : 0;
    elements.push(G.ellipse('shine_nose', noseX, 15, 4, 8, 0, { fill: `rgba(255, 255, 255, ${alpha * 1.5})` }));

    // 3. Cheekbone Highlights
    if (!isSide || dir === -1) {
      elements.push(G.path('shine_cheek_L', [
        { type: 'move', x: -rx * 0.5, y: 0 },
        { type: 'quad', cx: -rx * 0.6, cy: 5, x: -rx * 0.4, y: 10 }
      ], { stroke: shineColor, lineWidth: 6, lineCap: 'round' }));
    }

    if (!isSide || dir === 1) {
      elements.push(G.path('shine_cheek_R', [
        { type: 'move', x: rx * 0.5, y: 0 },
        { type: 'quad', cx: rx * 0.6, cy: 5, x: rx * 0.4, y: 10 }
      ], { stroke: shineColor, lineWidth: 6, lineCap: 'round' }));
    }

    return G.group('sebaceous_flow_map', null, elements);
  }
}
