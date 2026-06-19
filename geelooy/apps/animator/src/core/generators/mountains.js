/* B”H */
import { ShapeCache } from '../renderer/ShapeCache.js';
import { seededRandom } from '../../utils/random.js';

export class MountainGenerator {
  static generate(ctx, x, y, width, height, color) {
    ctx.save();
    ctx.translate(x, y);
    
    const path = ShapeCache.getPath(`mountain_${x}_${y}_${width}_${height}`, (p) => {
      p.moveTo(0, 0);
      
      const segments = 10;
      const step = width / segments;
      
      for (let i = 1; i <= segments; i++) {
        const px = i * step;
        const py = -seededRandom(x + i) * height - (i === segments || i === 0 ? 0 : height * 0.5);
        p.lineTo(px, py);
      }
      
      p.lineTo(width, 0);
      p.closePath();
    });
    
    ctx.fillStyle = color;
    ctx.fill(path);
    
    // Snow caps
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.rect(0, -height, width, height * 0.3);
    ctx.fill();
    
    ctx.restore();
  }
}
