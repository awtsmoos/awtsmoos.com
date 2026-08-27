
/* B”H */
import { ANATOMY } from '../data/Anatomy.js';
import { PerspectiveManager } from '../anatomy/PerspectiveManager.js';
import { Yarmulke } from './hair/Yarmulke.js';

/**
 * @class HairPart
 * @description
 * THE CROWN OF GLORY (Keter).
 */
export class HairPart {
  static draw(ctx, data) {
    const { hair = '#4a2b10' } = data.colors;
    const type = data.hairType || 'standard';
    const hasHat = data.hatType && data.hatType !== 'none';
    const h = ANATOMY.head;
    const profile = PerspectiveManager.get(data.view);

    ctx.save();
    ctx.translate(h.cx + profile.head.x, h.cy);
    
    if (type === 'standard') {
      ctx.fillStyle = hair;
      ctx.beginPath();
      ctx.arc(0, 0, h.r + 2, Math.PI, Math.PI * 2);
      ctx.fill();
    }

    // YARMULKE LOGIC (Only if no hat is worn)
    if (!hasHat) {
      Yarmulke.draw(ctx, h, profile);
    }
    
    ctx.restore();
  }
}
