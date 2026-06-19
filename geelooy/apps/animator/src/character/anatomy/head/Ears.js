
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * @file Ears.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 18: THE GATES OF UNDERSTANDING (Oznayim)
 * ═══════════════════════════════════════════════════════════════
 * Hyper-modularized for intense cartoon realism.
 */
export class Ears {
  static draw(r, profile, skinColor, jawDrop = 0, shape = 'round') {
    const dir = profile.dir || 1;
    const type = profile.type;
    const nodes = [];

    const earY = -15;

    const buildEar = (id, ex, ey, w, h, eDir) => {
      let earPath, depthPath;
      if (shape === 'pointed') {
        earPath = G.path('e_base', [
          { type: 'move', x: 0, y: -h*0.3 },
          { type: 'quad', cx: w, cy: -h*1.5, x: w*1.5, y: -h },
          { type: 'quad', cx: w, cy: 0, x: 0, y: h*0.8 },
          { type: 'quad', cx: -w*0.5, cy: h*0.5, x: 0, y: -h*0.3 }
        ], { fill: skinColor, stroke: '#000000', lineWidth: 4, lineJoin: 'round' });
        depthPath = G.path('e_depth', [
          { type: 'move', x: -w * 0.1, y: -h * 0.2 },
          { type: 'quad', cx: w * 0.4, cy: -h*0.8, x: w, y: -h*0.6 }
        ], { stroke: '#000000', lineWidth: 1.5, lineCap: 'round' });
      } else if (shape === 'droopy') {
        earPath = G.path('e_base', [
          { type: 'move', x: 0, y: -h*0.3 },
          { type: 'quad', cx: w*1.5, cy: -h*0.2, x: w*1.8, y: h },
          { type: 'quad', cx: w, cy: h*1.5, x: 0, y: h*0.5 },
          { type: 'quad', cx: -w*0.5, cy: 0, x: 0, y: -h*0.3 }
        ], { fill: skinColor, stroke: '#000000', lineWidth: 4, lineJoin: 'round' });
        depthPath = G.path('e_depth', [
          { type: 'move', x: 0, y: 0 },
          { type: 'quad', cx: w * 0.8, cy: 0, x: w*1.2, y: h*0.8 }
        ], { stroke: '#000000', lineWidth: 1.5, lineCap: 'round' });
      } else {
        // Default Round
        earPath = G.ellipse('e_base', 0, 0, w, h, -10, { fill: skinColor, stroke: '#000000', lineWidth: 4 });
        depthPath = G.path('e_depth', [
          { type: 'move', x: -w * 0.3, y: -h * 0.5 },
          { type: 'bezier', c1x: w * 0.6, c1y: -h * 0.2, c2x: w * 0.6, c2y: h * 0.2, x: -w * 0.4, y: h * 0.5 }
        ], { stroke: '#000000', lineWidth: 1.5, lineCap: 'round' });
      }

      return G.group(id, { x: ex, y: ey, scaleX: eDir }, [
        earPath, depthPath,
        G.path('e_tragus', [
          { type: 'move', x: -w * 0.7, y: -5 },
          { type: 'quad', cx: -w * 0.2, cy: 5, x: -w * 0.7, y: 15 }
        ], { stroke: '#000000', lineWidth: 3, lineCap: 'round' })
      ]);
    };

    if (profile.ears && profile.ears.visible) {
      profile.ears.visible.forEach(side => {
        const config = profile.ears[side] || {};
        
        // B"H - Absolute coordinate resolution with direction mirroring!
        // In 3/4 view, the config.x is provided. We MUST multiply it by profile.dir!
        let x = 0;
        if (type === 'front') {
            x = side === 'left' ? -r + 4 : r - 4;
        } else {
            // It's a profile view, the X offset is explicitly given
            x = (config.x || 0) * dir;
        }
        
        const y = earY + (config.y || 0); 
        const flip = (type === 'side' || type === 'threeQuarter') ? -dir : (side === 'left' ? -1 : 1);
        
        nodes.push(buildEar(`ear_${side}`, x, y, 12, 22, flip));
      });
    }

    return G.group('ears_layer', null, nodes);
  }
}
