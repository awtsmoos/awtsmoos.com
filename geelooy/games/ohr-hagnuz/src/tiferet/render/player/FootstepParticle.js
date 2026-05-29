/**
 * B"H
 * @module FootstepParticle
 *
 * Chapter 9: Dust Remembered The Traveler Without Becoming The Traveler.
 * The Awtsmoos has no body and no form; each mote is only a brief sign that
 * movement passed through the world and then returned to quiet nothingness.
 */
export class FootstepParticle {
  static particles = [];

  /** @param {number} x @param {number} y @returns {void} */
  static spawn(x, y) {
    this.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 2,
      vy: -Math.random() * 2,
      life: 20,
      size: 3 + Math.random() * 3
    });
  }

  /** @returns {void} */
  static update() {
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1;
      p.life -= 1;
      return p.life > 0;
    });
  }

  /** @param {CanvasRenderingContext2D} ctx @returns {void} */
  static draw(ctx) {
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.life / 20;
      ctx.fillStyle = '#8b7355';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }
}
