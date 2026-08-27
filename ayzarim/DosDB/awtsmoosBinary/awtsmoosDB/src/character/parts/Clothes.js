
/* B”H */
import { ANATOMY } from '../data/Anatomy.js';
import { CutoutShader } from '../../core/renderer/effects/CutoutShader.js';
import { Jacket } from './clothes/Jacket.js';
import { Shirt } from './clothes/Shirt.js';

/**
 * @class ClothesPart
 * @description
 * THE LEVUSH (Garment).
 * Upgraded to an extreme modular routing system.
 */
export class ClothesPart {
  static draw(ctx, data) {
    const { clothes } = data.colors;
    const { breath = 0 } = data.idle || {};
    const type = data.clothesType || 'trench';
    const b = ANATOMY.body;

    ctx.save();
    ctx.scale(1 + breath * 0.02, 1 + breath * 0.01);
    
    CutoutShader.apply(ctx, 4);

    ctx.fillStyle = clothes;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;

    // BASE SILHOUETTE
    ctx.beginPath();
    ctx.moveTo(-b.widthTop, b.top);
    ctx.lineTo(-b.widthBottom, b.bottom);
    ctx.quadraticCurveTo(0, b.bottom + 8, b.widthBottom, b.bottom);
    ctx.lineTo(b.widthTop, b.top);
    ctx.quadraticCurveTo(0, b.top - 5, -b.widthTop, b.top);
    ctx.closePath();
    ctx.fill();
    
    CutoutShader.clear(ctx);
    ctx.stroke();

    // ROUTE TO EXTREME DETAILS
    if (type === 'trench') {
      Jacket.draw(ctx, b, clothes);
    } else if (type === 'shirt') {
      Shirt.draw(ctx, b, clothes);
    }
    
    ctx.restore();
  }
}
