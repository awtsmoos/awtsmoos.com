
/* B”H */
import { ANATOMY } from '../../data/Anatomy.js';

export class Jacket {
  static draw(ctx, b, clothes) {
    // Lapels
    ctx.fillStyle = this.darkenColor(clothes, 20);
    ctx.beginPath();
    ctx.moveTo(-b.widthTop + 10, b.top);
    ctx.lineTo(0, b.top + 40);
    ctx.lineTo(-10, b.top + 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(b.widthTop - 10, b.top);
    ctx.lineTo(0, b.top + 40);
    ctx.lineTo(10, b.top + 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Central Fold / Zipper
    ctx.beginPath();
    ctx.moveTo(0, b.top + 40);
    ctx.lineTo(0, b.bottom + 8);
    ctx.stroke();
    
    // Buttons (Yesod)
    ctx.fillStyle = '#222';
    [b.top + 50, b.top + 70, b.top + 90].forEach(y => {
      if (y < b.bottom) {
        ctx.beginPath();
        ctx.arc(8, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    });
  }

  static darkenColor(color, percent) {
    let R = parseInt(color.substring(1,3),16);
    let G = parseInt(color.substring(3,5),16);
    let B = parseInt(color.substring(5,7),16);
    R = parseInt(R * (100 - percent) / 100);
    G = parseInt(G * (100 - percent) / 100);
    B = parseInt(B * (100 - percent) / 100);
    R = (R<0)?0:R; G = (G<0)?0:G; B = (B<0)?0:B;  
    const RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
    const GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
    const BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));
    return "#"+RR+GG+BB;
  }
}
