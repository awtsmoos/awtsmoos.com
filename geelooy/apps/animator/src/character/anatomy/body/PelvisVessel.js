
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * @file PelvisVessel.js
 * @description
 * THE HUB (Yesod).
 * B"H - Connects the Guf (Torso) to the Netzach/Hod (Legs).
 * The absolute pathing alias '@' has been purged, ensuring the static 
 * browser engine can resolve the divine geometry without bundler interference.
 */
export class PelvisVessel {
  static build(data, pantsColor) {
    const w = 68;
    const h = 28;
    
    const points = [
      { type: 'move', x: -w/2, y: -5 },
      { type: 'bezier', c1x: -w/2, c1y: h * 0.8, c2x: w/2, c2y: h * 0.8, x: w/2, y: -5 },
      { type: 'bezier', c1x: w/2, c1y: -8, c2x: -w/2, c2y: -8, x: -w/2, y: -5 }
    ];

    return G.group('pelvis_unit', { y: -2 }, [
      G.path('pelvis_main', points, { 
          fill: pantsColor, 
          stroke: '#000', 
          lineWidth: 4.5, 
          lineJoin: 'round'
      }),
      G.path('pelvis_creases', [
          { type: 'move', x: -w * 0.25, y: h * 0.2 },
          { type: 'bezier', c1x: 0, c1y: h * 0.4, c2x: 0, c2y: h * 0.4, x: w * 0.25, y: h * 0.2 }
      ], { stroke: 'rgba(0,0,0,0.15)', lineWidth: 2 })
    ]);
  }
}
