/* B”H */
import { seededRandom } from '../../utils/random.js';

export class VegetationGenerator {
  static drawGrass(ctx, x, y, density = 20, width = 100, time) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = '#2d5a27';
    ctx.lineWidth = 2;
    
    for (let i = 0; i < density; i++) {
      const gx = seededRandom(x + i) * width;
      const gh = 10 + seededRandom(x + i + 1) * 15;
      const sway = Math.sin(time * 0.005 + gx) * 5;
      
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.quadraticCurveTo(gx + sway, -gh * 0.5, gx + sway * 1.5, -gh);
      ctx.stroke();
    }
    ctx.restore();
  }

  static drawBush(ctx, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#1e3d1a';
    
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      const ox = (i - 2) * (size * 0.3);
      const oy = -Math.sin(i) * (size * 0.2);
      ctx.arc(ox, oy, size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
