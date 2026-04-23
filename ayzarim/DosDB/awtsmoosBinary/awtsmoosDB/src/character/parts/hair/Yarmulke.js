
/* B”H */
import { CutoutShader } from '../../../core/renderer/effects/CutoutShader.js';

export class Yarmulke {
  static draw(ctx, h, profile) {
    CutoutShader.apply(ctx, 4);
    ctx.fillStyle = '#000000'; // Velvet black
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    const kippahX = -15 * profile.dir;
    ctx.arc(kippahX, -h.r + 10, 40, Math.PI, 0);
    ctx.quadraticCurveTo(kippahX, -h.r + 25, kippahX - 40, -h.r + 10);
    ctx.fill();
    ctx.stroke();
    CutoutShader.clear(ctx);
  }
}
