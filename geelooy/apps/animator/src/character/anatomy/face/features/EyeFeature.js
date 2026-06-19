// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

export class EyeFeature {
  static draw(id, x, y, state, specs) {
    const { w, h, pupil } = specs;
    const { blink = 0, lookX = 0, lookY = 0 } = state;
    
    return G.group(`eye_${id}`, { x, y, scaleY: 1 - blink }, [
      // Eyeball shadow
      G.ellipse(`eye_shadow_${id}`, 0, -2, w + 2, h + 2, 0, { fill: 'rgba(0,0,0,0.1)' }),
      // Eyeball
      G.ellipse(`eye_white_${id}`, 0, 0, w, h, 0, { fill: '#fff', stroke: 'rgba(0,0,0,0.2)', lineWidth: 1 }),
      // Iris/Pupil
      G.group(`pupil_unit_${id}`, { x: (lookX || 0), y: (lookY || 0) }, [
          G.ellipse(`eye_pupil_${id}`, 0, 0, pupil, pupil * 1.1, 0, { fill: '#000' }),
          // Glare
          G.ellipse(`eye_glare_${id}`, -pupil * 0.3, -pupil * 0.3, pupil * 0.4, pupil * 0.4, 0, { fill: 'rgba(255,255,255,0.8)' })
      ])
    ]);
  }
}
