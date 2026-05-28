// B"H
/**
 * MomentumCurse punishes autopilot movement without becoming instant death.
 * If the player holds one direction too long, a warned spike omen appears
 * ahead on the travel lane. The warning gives a short chance to brake, jump,
 * or reverse. It is intentionally mean, but readable.
 */
export class MomentumCurse {
  constructor() {
    this.lastDir = 0;
    this.hold = 0;
    this.cooldown = 1.4;
    this.omens = [];
  }

  reset() {
    this.lastDir = 0;
    this.hold = 0;
    this.cooldown = 1.4;
    this.omens = [];
  }

  step(dt, input, player, rng) {
    const dir = Math.sign(input.x || 0);
    if (dir && dir === this.lastDir) this.hold += dt;
    else this.hold = dir ? dt : 0;
    this.lastDir = dir;

    this.cooldown -= dt;
    if (this.hold > 1.05 && this.cooldown <= 0) {
      this.spawnOmen(player, dir, rng);
      this.cooldown = 1.25 + (rng?.next?.() || Math.random()) * 1.1;
      this.hold *= 0.38;
    }

    for (const omen of this.omens) {
      omen.life -= dt;
      if (omen.warn > 0) {
        omen.warn -= dt;
        if (omen.warn <= 0) omen.active = omen.duration;
      } else if (omen.active > 0) {
        omen.active -= dt;
      }
    }
    this.omens = this.omens.filter(omen => omen.life > 0 && (omen.warn > 0 || omen.active > 0));
  }

  spawnOmen(player, dir, rng) {
    const variance = ((rng?.next?.() || Math.random()) - 0.5) * 52;
    const x = Math.max(30, player.x + dir * (170 + Math.abs(player.vx) * 0.18) + variance);
    const y = Math.max(120, Math.min(500, player.y + 34));
    this.omens.push({
      x,
      y,
      w: 48,
      h: 42,
      warn: 0.62,
      active: 0,
      duration: 0.78,
      life: 1.65,
      momentum: true
    });
  }

  warning() {
    return this.omens.filter(omen => omen.warn > 0);
  }

  active() {
    return this.omens.filter(omen => omen.active > 0);
  }
}
