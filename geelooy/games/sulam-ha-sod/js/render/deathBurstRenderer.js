// B"H
/**
 * DeathBurstRenderer paints the player exploding into blocks and Hebrew letters.
 *
 * The Awtsmoos constantly gives every vessel its letters. When the spike tears
 * the player apart, this renderer lets those otiyos fly: Aleph through Tav mix
 * with square fragments, glowing briefly before the chamber accepts another try.
 */
export class DeathBurstRenderer {
  /**
   * Paints all active death bursts in world coordinates.
   * @param {CanvasRenderingContext2D} ctx drawing context.
   * @param {object[]} bursts active burst data.
   */
  draw(ctx, bursts = []) {
    for (const burst of bursts) {
      for (const particle of burst.particles || []) this.drawParticle(ctx, particle);
    }
  }

  /**
   * Paints a single square shard or Hebrew letter.
   * @param {CanvasRenderingContext2D} ctx drawing context.
   * @param {object} p particle data.
   */
  drawParticle(ctx, p) {
    const alpha = Math.max(0, Math.min(1, p.life / (p.maxLife || 1)));
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot || 0);
    if (p.letter) this.drawLetter(ctx, p);
    else this.drawBlock(ctx, p);
    ctx.restore();
  }

  drawLetter(ctx, p) {
    ctx.font = `${Math.round(p.size)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = p.color || '#ffffff';
    ctx.shadowColor = '#9df7ff';
    ctx.shadowBlur = 12;
    ctx.fillText(p.letter, 0, 0);
  }

  drawBlock(ctx, p) {
    const s = p.size || 8;
    ctx.fillStyle = p.color || '#ffffff';
    ctx.strokeStyle = '#16091f';
    ctx.lineWidth = 2;
    ctx.fillRect(-s / 2, -s / 2, s, s);
    ctx.strokeRect(-s / 2, -s / 2, s, s);
  }
}
