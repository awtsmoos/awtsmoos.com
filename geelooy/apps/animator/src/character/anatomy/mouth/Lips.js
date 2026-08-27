
/* B”H */
import { MouthMorpher } from './MouthMorpher.js';
import { Path } from '../../../utils/geom/Path.js';

/**
 * @class Lips
 * @description
 * THE DOORS TO MALCHUT (Kingship).
 * Binds exclusively through Kinematic interpolation now. The lips bend automatically, 
 * projecting a unified emotional expression fused to conversational velocity parameters.
 */
export class Lips {
  static getPath(data) {
    // Allows direct timeline control overlays to take manual superiority 
    if (data.customMouth) {
      const customP = new Path();
      data.customMouth.forEach((p) => {
        if (p.type === 'move') customP.moveTo(p.x, p.y);
        else if (p.type === 'bezier') customP.bezierCurveTo(p.cp1x || p.c1x, p.cp1y || p.c1y, p.cp2x || p.c2x, p.cp2y || p.c2y, p.endX || p.x, p.endY || p.y);
        else if (p.type === 'line') customP.lineTo(p.x, p.y);
      });
      return customP;
    }

    const id = data.id || 'omni_spirit';
    const view = data.view || 'front';
    const emotion = data.emotion || 'neutral';
    const intensity = data.mouthOpen || 0;
    
    // Call the locally instantiated morphing framework! 
    // Passes the entire responsibility to fluid, per-pixel tracking computation!
    return MouthMorpher.process(id, emotion, !!data.isTalking, intensity, view);
  }

  static draw(ctx, path) {
    if (!path) return;
    path.draw(ctx);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();
  }
}
