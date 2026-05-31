// B"H
/**
 * DeathBurstRenderer paints cheap hard shards.
 *
 * Chapter 6: When the vessel breaks, the Awtsmoos does not summon a fog; it
 * releases clean square letters into the air. No shadow blur, no costly aura,
 * only readable blocks and glyphs that vanish before the next breath.
 */
export class DeathBurstRenderer {
  /** @param {CanvasRenderingContext2D} ctx Context. @param {object[]} bursts Burst data. */
  draw(ctx, bursts = []) {
    for (const burst of bursts) for (const p of burst.particles || []) this.particle(ctx, p);
  }

  particle(ctx, p) {
    const alpha = Math.max(0, Math.min(1, p.life / (p.maxLife || 1)));
    ctx.save(); ctx.globalAlpha = alpha; ctx.translate(p.x, p.y); ctx.rotate(p.rot || 0);
    if (p.letter) this.letter(ctx, p); else this.block(ctx, p);
    ctx.restore();
  }

  letter(ctx, p) {
    ctx.font = `${Math.round(p.size || 12)}px serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = p.color || '#ffffff';
    ctx.fillText(p.letter, 0, 0);
  }

  block(ctx, p) {
    const s = p.size || 6;
    ctx.fillStyle = p.color || '#ffffff'; ctx.fillRect(-s / 2, -s / 2, s, s);
  }
}
