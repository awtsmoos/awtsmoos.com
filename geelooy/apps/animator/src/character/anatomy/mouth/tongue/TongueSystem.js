
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @class TongueSystem
 * @description
 * THE PEN OF THE HEART (Lashon).
 * B"H
 * 
 * Hyper-realistic muscle dynamics within the oral cavern.
 */
export class TongueSystem {
  static build(intensity, jawDrop, viseme, lipPoints) {
    const raw = lipPoints.raw;
    if (intensity < 0.08 || !raw) return [];

    // Index Map: 0:L-Corner, 2:Center-Top, 4:R-Corner, 6:Center-Bot
    const botY = raw[6].y; 
    const topY = raw[2].y;

    // PHONETIC ARCHING: Tongue shoots UP for alveolar/dental phonemes
    const isArched = ['L', 'T', 'D', 'N', 'S'].includes(viseme);
    const archH = isArched ? (topY - botY) + 4 : -8 - (intensity * 12);

    const w = 38 * Math.min(1.0, intensity + 0.4); 

    const tonguePath = [
      { type: 'move', x: -w, y: botY + 12 },
      { type: 'bezier', c1x: -w, c1y: botY + archH, c2x: w, c2y: botY + archH, x: w, y: botY + 12 },
      { type: 'line', x: w, y: botY + 30 },
      { type: 'line', x: -w, y: botY + 30 },
      { type: 'line', x: -w, y: botY + 12 }
    ];

    return [
      // Fleshy Body (Subtle internal gradient simulated via solid highlight)
      G.path('tongue_muscle', tonguePath, {
        fill: '#ff5c8a', stroke: '#000', lineWidth: 2, lineJoin: 'round'
      }),
      // Median Cleft (The Center Line)
      G.path('tongue_cleft', [
        { type: 'move', x: 0, y: botY + archH + 6 },
        { type: 'line', x: 0, y: botY + 22 }
      ], { stroke: '#b0003a', lineWidth: 3, lineCap: 'round' })
    ];
  }
}
