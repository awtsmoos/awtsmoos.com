/* B”H */
export class TrunkRenderer {
  static draw(ctx, size) {
    ctx.fillStyle = '#4d2600';
    ctx.fillRect(-size/10, -size * 0.8, size/5, size * 0.8);
  }
}
