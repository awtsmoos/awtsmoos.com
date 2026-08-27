// B"H

/** Draws food as expressive 2D production props on raw canvas. */
export class FoodPropRenderer {
  static draw(ctx, prop = {}) {
    const type = prop.type || prop.propType;
    if (type === 'apple') return this.apple(ctx, prop);
    if (type === 'carrot') return this.carrot(ctx, prop);
    if (type === 'sandwich') return this.sandwich(ctx, prop);
    if (type === 'plate') return this.plate(ctx, prop);
    if (type === 'lunchbox') return this.lunchbox(ctx, prop);
    if (type === 'sparkle') return this.sparkle(ctx, prop);
    return false;
  }

  static apple(ctx, p) { const r = p.size || 18; ctx.fillStyle = '#d9342f'; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#46110f'; ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = '#5d3a18'; ctx.fillRect(-2, -r - 8, 4, 10); ctx.fillStyle = '#53a548'; ctx.beginPath(); ctx.ellipse(7, -r - 5, 8, 4, -0.4, 0, Math.PI * 2); ctx.fill(); }
  static carrot(ctx, p) { const s = p.size || 22; ctx.fillStyle = '#f28c28'; ctx.beginPath(); ctx.moveTo(-s * 0.55, -s * 0.25); ctx.lineTo(s * 0.7, 0); ctx.lineTo(-s * 0.55, s * 0.25); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#2f8a3e'; ctx.fillRect(-s * 0.75, -s * 0.35, 10, 6); ctx.fillRect(-s * 0.75, 2, 12, 6); }
  static sandwich(ctx, p) { const s = p.size || 30; ctx.fillStyle = '#f0c36a'; ctx.fillRect(-s, -s * 0.45, s * 1.7, s * 0.9); ctx.strokeRect(-s, -s * 0.45, s * 1.7, s * 0.9); ctx.fillStyle = '#76b852'; ctx.fillRect(-s * 0.9, -3, s * 1.5, 7); ctx.fillStyle = '#f7fff0'; ctx.fillRect(-s * 0.85, -s * 0.18, s * 1.4, 7); }
  static plate(ctx, p) { const s = p.size || 62; ctx.fillStyle = '#f9fbff'; ctx.beginPath(); ctx.ellipse(0, 0, s, s * 0.34, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#789'; ctx.lineWidth = 2; ctx.stroke(); ctx.beginPath(); ctx.ellipse(0, 0, s * 0.62, s * 0.2, 0, 0, Math.PI * 2); ctx.stroke(); }
  static lunchbox(ctx, p) { const s = p.size || 42; ctx.fillStyle = '#f05a4f'; ctx.fillRect(-s * 0.7, -s * 0.45, s * 1.4, s * 0.9); ctx.strokeRect(-s * 0.7, -s * 0.45, s * 1.4, s * 0.9); ctx.fillStyle = '#ffd36b'; ctx.fillRect(-s * 0.35, -s * 0.64, s * 0.7, 7); }
  static sparkle(ctx, p) { const s = p.size || 12; ctx.strokeStyle = '#fff176'; ctx.lineWidth = 3; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; ctx.beginPath(); ctx.moveTo(Math.cos(a) * s * 0.25, Math.sin(a) * s * 0.25); ctx.lineTo(Math.cos(a) * s, Math.sin(a) * s); ctx.stroke(); } }
}
