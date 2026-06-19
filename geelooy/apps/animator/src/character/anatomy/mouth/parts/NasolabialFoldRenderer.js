// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file NasolabialFoldRenderer.js
 */
export class NasolabialFoldRenderer {
  static build(lipPoints, intensity, targetViseme, profile) {
    const raw = lipPoints.raw;
    const folds = [];
    
    if (intensity > 0.4 || targetViseme === 'smile' || targetViseme === 'A') {
      const fW = 1.0;
      const fStroke = 'rgba(0,0,0,0.15)';
      const isSide = profile.type === 'side';
      
      if (isSide) {
         const corner = profile.dir > 0 ? raw[4] : raw[0];
         folds.push(G.path('fold_profile', [
            { type: 'move', x: corner.x, y: corner.y - 15 },
            { type: 'quad', cx: corner.x + (10 * profile.dir), cy: corner.y - 12, x: corner.x + (5 * profile.dir), y: corner.y }
         ], { stroke: fStroke, lineWidth: fW }));
      } else {
        folds.push(G.path('fold_l', [
          { type: 'move', x: raw[0].x - 12, y: raw[0].y - 20 },
          { type: 'quad', cx: raw[0].x - 18, cy: raw[0].y - 10, x: raw[0].x - 8, y: raw[0].y }
        ], { stroke: fStroke, lineWidth: fW }));
        
        folds.push(G.path('fold_r', [
          { type: 'move', x: raw[4].x + 12, y: raw[4].y - 20 },
          { type: 'quad', cx: raw[4].x + 18, cy: raw[4].y - 10, x: raw[4].x + 8, y: raw[4].y }
        ], { stroke: fStroke, lineWidth: fW }));
      }
    }
    return folds;
  }
}
