/* B”H */
import { ShapeCache } from '../renderer/ShapeCache.js';

export class CloudGenerator {
  static generate(ctx, x, y, size, opacity = 0.8) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    
    const path = ShapeCache.getPath(`cloud_${size}`, (p) => {
      p.arc(0, 0, size, 0, Math.PI * 2);
      p.arc(size * 0.6, -size * 0.2, size * 0.8, 0, Math.PI * 2);
      p.arc(size * 1.2, 0, size * 0.7, 0, Math.PI * 2);
      p.arc(size * 0.5, size * 0.3, size * 0.6, 0, Math.PI * 2);
    });
    
    ctx.fill(path);
    ctx.restore();
  }
}
