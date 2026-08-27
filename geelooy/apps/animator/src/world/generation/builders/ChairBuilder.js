
/* B”H */

/**
 * @class ChairBuilder
 * @description
 * The Architect of Resting. Converts JSON into a 4-legged vessel for characters 
 * to inhabit. The chair is a symbol of 'Yesod', providing a foundation for 
 * the soul to sit in peace.
 */
export class ChairBuilder {
  static build(data) {
    const w = data.w || 60;
    const h = data.h || 80;
    const color = data.color || '#4a2b10';
    
    return {
      ...data,
      type: 'chair',
      render: (ctx) => {
        ctx.fillStyle = color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        
        // Backrest
        ctx.fillRect(-w/2, -h, w, h/2);
        ctx.strokeRect(-w/2, -h, w, h/2);
        
        // Seat
        ctx.fillRect(-w/2, -h/2, w, 10);
        ctx.strokeRect(-w/2, -h/2, w, 10);

        // B"H - Hyper-detailed wood grain (Optimized for performance)
        ctx.strokeStyle = '#00000033';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 58; i++) {
            const gx = -w/2 + Math.random() * w;
            const gy = -h + Math.random() * h;
            ctx.beginPath();
            ctx.moveTo(gx, gy);
            ctx.lineTo(gx + 12 + Math.random() * 25, gy + (Math.random() - 0.5) * 1.5);
            ctx.stroke();
        }
        
        // Legs
        const legW = 6;
        const legH = h/2;
        ctx.fillRect(-w/2, -h/2 + 10, legW, legH);
        ctx.strokeRect(-w/2, -h/2 + 10, legW, legH);
        ctx.fillRect(w/2 - legW, -h/2 + 10, legW, legH);
        ctx.strokeRect(w/2 - legW, -h/2 + 10, legW, legH);
      }
    };
  }
}
