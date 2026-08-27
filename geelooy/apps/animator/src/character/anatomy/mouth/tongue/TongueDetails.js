
// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @class TongueDetails
 * @description
 * THE TEXTURE OF TASTE.
 * B"H
 * 
 * Re-aligned the Tongue Cleft (Median Sulcus) to dynamically follow the arc.
 */
export class TongueDetails {
  static build(jawDrop, isArched) {
    const baseY = 20 + jawDrop;
    const archY = isArched ? -35 : 12; // Must match TongueMuscle Y-elevations!
    
    return G.group('tongue_details', null, [
      // Central Cleft (Median Sulcus) - Follows the tongue down from its tip!
      G.path('tongue_cleft_line', [
        { type: 'move', x: 0, y: baseY + archY + 5 },
        { type: 'line', x: 0, y: baseY + 45 }
      ], { stroke: '#500015', lineWidth: 3, lineCap: 'round' }),
      
      // Side Volume Sub-surface Lines (creating 3D curvature along the edges)
      G.path('tongue_vol_L', [
        { type: 'move', x: -25, y: baseY + archY + 15 },
        { type: 'quad', cx: -35, cy: baseY + 15, x: -15, y: baseY + 50 }
      ], { stroke: 'rgba(80, 0, 21, 0.3)', lineWidth: 2, lineCap: 'round' }),
      
      G.path('tongue_vol_R', [
        { type: 'move', x: 25, y: baseY + archY + 15 },
        { type: 'quad', cx: 35, cy: baseY + 15, x: 15, y: baseY + 50 }
      ], { stroke: 'rgba(80, 0, 21, 0.3)', lineWidth: 2, lineCap: 'round' })
    ]);
  }
}
