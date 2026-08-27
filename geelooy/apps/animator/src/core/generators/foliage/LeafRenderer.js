/* B”H */
export class LeafRenderer {
  static draw(ctx, size) {
    const colors = ['#006400', '#228b22', '#004d00'];
    for (let i = 0; i < 15; i++) {
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      const ox = Math.sin(i * 2.4) * (size * 0.4);
      const oy = -size * 0.8 + Math.cos(i * 1.5) * (size * 0.3);
      ctx.arc(ox, oy, size * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
