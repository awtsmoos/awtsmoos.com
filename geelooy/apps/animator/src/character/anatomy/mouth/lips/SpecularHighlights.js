
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file SpecularHighlights.js
 * @description
 * THE LIGHT UPON THE VESSEL (Ohr Hozer).
 * B"H
 * 
 * We forbid glows and blurs! To create the illusion of a wet, 3D lower lip, 
 * we trace the lower lip Bezier arc from the morpher, offsetting it slightly 
 * upward, and drawing a crisp white stroke with low alpha.
 */
export class SpecularHighlights {
  static build(lipPoints, intensity) {
    const raw = lipPoints.raw;
    if (intensity < 0.2 || !raw || raw.length < 8) return null;

    // Index Map: 0:L-Corner, 1:L-Top, 2:Center-Top, 3:R-Top, 4:R-Corner, 5:R-Bot, 6:Center-Bot, 7:L-Bot
    const leftCorner = raw[0];
    const rightCorner = raw[4];
    const rBot = raw[5];
    const cBot = raw[6];
    const lBot = raw[7];

    // We only draw the highlight if it's a wide open mouth or a smile
    if (!cBot || !rightCorner) return null;

    // A tightened version of the lower lip curve sitting "on top" of the lip edge
    const highlightPath = [
      { type: 'move', x: rightCorner.x * 0.7, y: rightCorner.y + 4 },
      { type: 'quad', cx: cBot.x, cy: cBot.y - 6, x: leftCorner.x * 0.7, y: leftCorner.y + 4 }
    ];

    return G.path('lip_highlight_specular', highlightPath, {
      stroke: 'rgba(255,255,255,0.7)',
      lineWidth: 2.5,
      lineCap: 'round'
    });
  }
}
