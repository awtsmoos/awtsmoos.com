// B"H

const MAX_PARTICLES = 96;

/**
 * Pooled hard-pixel burst forge.
 *
 * Chapter 14: The Awtsmoos taught sparks to return without duplication. A dead
 * spark swaps with the last living spark, so each object remains one vessel and
 * no burst accidentally paints the same letter twice. Beauty stays sharp,
 * memory stays still, and the frame runs like a messenger with no baggage.
 */
export class ParticleForge {
  constructor() {
    this.particles = Array.from({ length: MAX_PARTICLES }, () => this.blank());
    this.live = 0;
  }

  blank() { return { x: 0, y: 0, vx: 0, vy: 0, life: 0, age: 0, size: 2, color: '#fff', label: '' }; }

  /** @param {number} x X. @param {number} y Y. @param {string} color CSS color. @param {number} amount Count. @param {string} label Optional text. */
  burst(x, y, color, amount = 5, label = '') {
    const total = Math.min(amount, MAX_PARTICLES - this.live);
    for (let i = 0; i < total; i += 1) this.revive(this.particles[this.live++], x, y, color, total, i, label);
  }

  revive(p, x, y, color, total, i, label) {
    const angle = (Math.PI * 2 * i) / Math.max(1, total), speed = 60 + (i % 3) * 28;
    p.x = x; p.y = y; p.vx = Math.cos(angle) * speed; p.vy = Math.sin(angle) * speed - 18;
    p.life = 0.32; p.age = 0; p.size = 2; p.color = color; p.label = i === 0 ? label : '';
  }

  /** @param {number} dt Seconds. */
  step(dt) {
    let i = 0;
    while (i < this.live) {
      const p = this.particles[i]; p.age += dt;
      if (p.age >= p.life) { this.live -= 1; this.swap(i, this.live); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 110 * dt; i += 1;
    }
  }

  swap(a, b) { if (a === b) return; const temp = this.particles[a]; this.particles[a] = this.particles[b]; this.particles[b] = temp; }

  /** @param {CanvasRenderingContext2D} c Context. */
  draw(c) {
    c.save();
    for (let i = 0; i < this.live; i += 1) {
      const p = this.particles[i]; c.fillStyle = p.color; c.fillRect(p.x, p.y, p.size, p.size);
      if (p.label) { c.font = '900 12px system-ui'; c.fillText(p.label, p.x + 5, p.y - 4); }
    }
    c.restore();
  }

  clear() { this.live = 0; }
}
