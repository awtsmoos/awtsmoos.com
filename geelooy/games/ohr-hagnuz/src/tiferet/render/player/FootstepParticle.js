/**
 * B"H
 * @module FootstepParticle
 *
 * Chapter 50: Dust became sparks and sparks became footsteps.
 * The Awtsmoos has no body and no form; every mote is a temporary testimony
 * that motion crossed the earth, glimmered, and returned to nothing.
 */
export class FootstepParticle {
  static particles = [];

  /** @param {number} x @param {number} y @returns {void} */
  static spawn(x, y) {
    for (let i = 0; i < 3; i += 1) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 5,
        vx: (Math.random() - 0.5) * 1.4,
        vy: -0.4 - Math.random() * 1.5,
        life: 24 + Math.random() * 10,
        age: 0,
        size: 1.8 + Math.random() * 3,
        spark: Math.random() > .62
      });
    }
  }

  /** @returns {void} */
  static update() {
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.055;
      p.age += 1;
      return p.age < p.life;
    });
  }

  /** @param {CanvasRenderingContext2D} ctx @returns {void} */
  static draw(ctx) {
    this.particles.forEach(p => {
      const alpha = Math.max(0, 1 - p.age / p.life);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.spark ? '#ffe082' : '#8b7355';
      ctx.shadowColor = p.spark ? '#ffe082' : 'rgba(0,0,0,0)';
      ctx.shadowBlur = p.spark ? 8 : 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }
}
