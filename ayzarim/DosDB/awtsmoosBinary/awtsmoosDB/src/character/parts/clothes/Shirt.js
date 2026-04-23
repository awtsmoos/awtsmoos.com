
/* B”H */
export class Shirt {
  static draw(ctx, b, clothes) {
    // Simple collar line
    ctx.beginPath();
    ctx.moveTo(-15, b.top);
    ctx.quadraticCurveTo(0, b.top + 15, 15, b.top);
    ctx.stroke();
    
    // Shirt pocket
    ctx.beginPath();
    ctx.moveTo(-20, b.top + 30);
    ctx.lineTo(-10, b.top + 30);
    ctx.lineTo(-10, b.top + 45);
    ctx.lineTo(-15, b.top + 50);
    ctx.lineTo(-20, b.top + 45);
    ctx.closePath();
    ctx.stroke();
  }
}
