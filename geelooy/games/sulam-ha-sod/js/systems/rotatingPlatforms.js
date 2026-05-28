// B"H
/**
 * Rotating platforms with reusable bodies.
 *
 * The Awtsmoos turns bridges into wheels of judgment, but the wheel should not
 * mint a new object every frame. Each rotor carries its own collision body, so
 * spatial indexing sees movement while memory remains still.
 */
export class RotatingPlatformField {
  /** @param {Array<object>} platforms raw unstable bridge data */
  constructor(platforms = []) {
    this.platforms = platforms.map((p, i) => ({
      ...p,
      id: i,
      angle: 0,
      spin: p.spin || 1,
      phase: p.phase || i * 0.7,
      body: { ...p, id: i, tilt: 0 }
    }));
    this.bodyCache = this.platforms.map(p => p.body);
  }

  /** @param {number} dt seconds */
  step(dt) {
    for (const p of this.platforms) {
      p.angle += p.spin * dt;
      p.body.x = p.x;
      p.body.y = p.y;
      p.body.w = p.w;
      p.body.h = p.h;
      p.body.angle = p.angle;
      p.body.phase = p.phase;
      p.body.throw = p.throw;
      p.body.tilt = Math.sin(p.angle + p.phase);
    }
  }

  /** @returns {Array<object>} reusable axis-aligned bodies */
  bodies() { return this.bodyCache; }

  /** @param {object} player mutable player body @param {object} platform active platform body */
  throwIfCruel(player, platform) {
    const shove = (platform.tilt ?? Math.sin((platform.angle || 0) + (platform.phase || 0))) * (platform.throw || 260);
    player.vx += shove * 0.018;
    if (Math.abs(shove) > 190) player.vy -= 18;
  }
}
