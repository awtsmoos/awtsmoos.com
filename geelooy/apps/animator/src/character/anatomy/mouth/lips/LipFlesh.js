
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @class LipFlesh
 * @description
 * THE BIOLOGICAL LIPS (Sfataim).
 * B"H
 * 
 * Separates the upper and lower vermillion borders into distinct
 * vector shells for depth and shading, utilizing complex bezier manifolds.
 */
export class LipFlesh {
  static build(lipPoints, viseme, tension = 0) {
    const raw = lipPoints.raw;
    if (!raw || raw.length < 8) return null;

    const nodes = [];
    const color = '#da7a8b'; // Slightly darker natural pink
    const darkColor = '#c25a6e'; // Shaded upper lip

    // We expand outward from the opening to create "thickness"
    const baseThick = (viseme === 'O' || viseme === 'M') ? 10 : 5;
    const thickness = Math.max(1, baseThick - (tension * 3));

    // Cupid's bow math: we indent the top center pixel downward slightly, and peak its adjacent control points
    const topCenter = { x: raw[2].x, y: raw[2].y - thickness * 0.7 };
    const leftPeak = { x: raw[2].x - 6, y: raw[2].y - thickness - 2 };
    const rightPeak = { x: raw[2].x + 6, y: raw[2].y - thickness - 2 };

    // UPPER LIP MANIFOLD (0 -> 1 -> 2 -> 3 -> 4)
    const upperPath = [
      { type: 'move', x: raw[0].x, y: raw[0].y },
      { type: 'quad', cx: raw[1].x, cy: raw[1].y, x: raw[2].x, y: raw[2].y },
      { type: 'quad', cx: raw[3].x, cy: raw[3].y, x: raw[4].x, y: raw[4].y },
      
      // The "Outer" puff curving back to start, featuring the Cupid's bow!
      { type: 'bezier', c1x: raw[4].x - 3, c1y: raw[4].y - thickness, c2x: rightPeak.x + 3, c2y: rightPeak.y, x: rightPeak.x, y: rightPeak.y },
      { type: 'bezier', c1x: rightPeak.x - 1, c1y: rightPeak.y, c2x: topCenter.x + 1, c2y: topCenter.y, x: topCenter.x, y: topCenter.y },
      { type: 'bezier', c1x: topCenter.x - 1, c1y: topCenter.y, c2x: leftPeak.x + 1, c2y: leftPeak.y, x: leftPeak.x, y: leftPeak.y },
      { type: 'bezier', c1x: leftPeak.x - 3, c1y: leftPeak.y, c2x: raw[0].x + 3, c2y: raw[0].y - thickness, x: raw[0].x, y: raw[0].y }
    ];

    // LOWER LIP MANIFOLD (4 -> 5 -> 6 -> 7 -> 0)
    const lowerPath = [
      { type: 'move', x: raw[4].x, y: raw[4].y },
      { type: 'quad', cx: raw[5].x, cy: raw[5].y, x: raw[6].x, y: raw[6].y },
      { type: 'quad', cx: raw[7].x, cy: raw[7].y, x: raw[0].x, y: raw[0].y },

      // The "Outer" puff of the lower lip
      { type: 'bezier', c1x: (raw[0].x + raw[5].x)/2, c1y: raw[6].y + thickness + 3, c2x: (raw[4].x + raw[5].x)/2, c2y: raw[6].y + thickness + 3, x: raw[4].x, y: raw[4].y }
    ];

    nodes.push(
      G.path('lip_upper_flesh', upperPath, { fill: darkColor, stroke: '#000', lineWidth: 1.2, lineJoin: 'round' }),
      G.path('lip_lower_flesh', lowerPath, { fill: color, stroke: '#000', lineWidth: 1.2, lineJoin: 'round' }),
      
      // Medial Cleft (Vertical subtle line on lower lip)
      G.path('lip_medial_cleft', [
         { type: 'move', x: raw[6].x, y: raw[6].y + 2 },
         { type: 'quad', cx: raw[6].x + 2, cy: raw[6].y + thickness/2, x: raw[6].x, y: raw[6].y + thickness + 2 }
      ], { stroke: '#c35568', lineWidth: 1, lineCap: 'round' })
    );

    return G.group('lip_volumes', null, nodes);
  }
}
