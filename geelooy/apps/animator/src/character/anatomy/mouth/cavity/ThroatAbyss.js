
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file ThroatAbyss.js
 * @description
 * THE DEEP VOID (Tehom).
 * B"H
 * Solid flat vectors. High contrast. 
 */
export class ThroatAbyss {
  static build(lipPoints, intensity) {
    const nodes = [];
    const raw = lipPoints.raw;
    if (!raw) return null;

    // 1. SOLID FLESH CAVITY (Bright enough to contrast with the black void)
    nodes.push(G.path('cavity_base', lipPoints, { fill: '#6e0f27' }));

    if (intensity > 0.05) {
      // Index Map: 0:L-Corner, 2:Center-Top, 4:R-Corner, 6:Center-Bot
      const topY = raw[2].y;
      const botY = raw[6].y;
      const mouthCenterY = (topY + botY) / 2;
      const wSpan = Math.abs(raw[0].x - raw[4].x);

      // Mid Throat (Solid color)
      nodes.push(G.ellipse('throat_mid', 0, mouthCenterY, wSpan * 0.45, (botY - topY) * 0.4, 0, { fill: '#330310' }));
      
      // The True Void (Absolute Black)
      nodes.push(G.ellipse('throat_void', 0, mouthCenterY + 2, wSpan * 0.25, (botY - topY) * 0.25, 0, { fill: '#000000' }));
      
      // Hanging Uvula
      if (intensity > 0.4) {
        const uShake = Math.sin(Date.now() * 0.08) * (intensity * 5);
        nodes.push(G.path('uvula', [
          { type: 'move', x: -6, y: topY },
          { type: 'bezier', c1x: -6, c1y: topY+5, c2x: uShake-4, c2y: topY+22, x: uShake, y: topY+24 },
          { type: 'bezier', c1x: uShake+4, c1y: topY+22, c2x: 6, c2y: topY+5, x: 6, y: topY }
        ], { fill: '#b51b3d', stroke: '#000000', lineWidth: 1.5, lineJoin: 'round' }));
      }
    }

    return G.group('cavern_sys', null, nodes);
  }
}
