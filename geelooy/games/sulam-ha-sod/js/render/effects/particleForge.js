// B"H

const MAX_PARTICLES = 96;

/**
 * Pooled hard-pixel burst forge.
 *
 * Chapter 4: The Awtsmoos gathers five sparks for a coin and eight white teeth
 * for a defeated enemy. No blur, no smoke, no sea of alpha. Each particle is a
 * tiny letter flung from the event, then erased quickly so the frame remains a
 * swift servant.
 */
export class ParticleForge {
  constructor() { this.particles = []; }

  /** @param {number} x X. @param {number} y Y. @param {string} color CSS color. @param {number} amount Count. @param {string} label Optional text. */
  burst(x, y, color, amount = 5, label = '') {
    const total = Math.min(amount, Math.max(0, MAX_PARTICLES - this.particles.length));
    for (let i = 0; i < total; i += 1) this.particles.push(this.make(x, y, color, total, i, label));
  }

  make(x, y, color, total, i, label) {
    const angle = (Math.PI * 2 * i) / Math.max(1, total);
    const speed = 60 + (i % 3) * 28;
    return { x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 18, life: 0.32, age: 0, size: 2, color, label: i === 0 ? label : '' };
  }

  /** @param {number} dt Seconds. */
  step(dt) {
    let w = 0;
    for (let r = 0; r < this.particles.length; r += 1) {
      const p = this.particles[r]; p.age += dt;
      if (p.age >= p.life) continue;
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 110 * dt;
      this.particles[w++] = p;
    }
    this.particles.length = w;
  }

  /** @param {CanvasRenderingContext2D} c Context. */
  draw(c) {
    c.save();
    for (const p of this.particles) {
      c.fillStyle = p.color; c.fillRect(p.x, p.y, p.size, p.size);
      if (p.label) { c.font = '900 12px system-ui'; c.fillText(p.label, p.x + 5, p.y - 4); }
    }
    c.restore();
  }
}
