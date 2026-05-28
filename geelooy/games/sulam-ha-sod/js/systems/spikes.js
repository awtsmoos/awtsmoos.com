// B"H
/**
 * SpikeOracle breathes timed and triggered spike geometry.
 *
 * The Awtsmoos hides judgment inside time: a spike may sleep, warn, bloom, fall,
 * reset, and breathe again. Its cruelty is deterministic enough to learn, but
 * alive enough to break autopilot. Falling curtains are authored with fallSpeed;
 * they descend only after a warning so hard levels stay possible rather than RNG.
 */
export class SpikeOracle {
  /**
   * @param {Array<object>} traps fixed and triggered danger zones.
   * @param {object} rng deterministic random vessel.
   */
  constructor(traps = [], rng = null) {
    this.rng = rng;
    this.traps = traps.map((trap, index) => this.prepareTrap(trap, index));
  }

  prepareTrap(trap, index) {
    return {
      ...trap,
      id: trap.id ?? index,
      baseX: trap.baseX ?? trap.x,
      baseY: trap.baseY ?? trap.y,
      cooldown: trap.cooldown ?? ((trap.delay || 1) + this.roll(0.8) + index * 0.17),
      warn: trap.warn || 0,
      active: trap.active || 0
    };
  }

  /** @param {number} dt seconds @param {object} player hero body */
  step(dt, player) {
    for (const trap of this.traps) this.stepTrap(trap, dt, player);
  }

  stepTrap(trap, dt, player) {
    trap.cooldown -= dt;
    const safeDistance = Math.abs((player.x + 17) - (trap.x + trap.w / 2)) > (trap.safe || 28);
    if (trap.cooldown <= 0 && !trap.warn && !trap.active && safeDistance) trap.warn = (trap.warning || 0.9) + this.roll(0.35);
    if (trap.warn) {
      trap.warn -= dt;
      if (trap.warn <= 0) { trap.warn = 0; trap.active = (trap.duration || 0.75) + this.roll(0.32); }
    }
    if (!trap.active) return;
    if (trap.fallSpeed) trap.y += trap.fallSpeed * dt;
    trap.active -= dt;
    if (trap.active <= 0) this.resetTrap(trap);
  }

  resetTrap(trap) {
    trap.active = 0;
    trap.x = trap.baseX;
    trap.y = trap.baseY;
    trap.cooldown = this.nextCooldown(trap);
  }

  /** @returns {Array<object>} traps that currently pierce the world */
  active() { return this.traps.filter(trap => trap.active > 0); }

  /** @returns {Array<object>} traps whispering before violence */
  warning() { return this.traps.filter(trap => trap.warn > 0); }

  /** @param {object} trap deterministic pseudo-random timing from fixed location */
  nextCooldown(trap) { return (trap.min || 1.6) + this.roll((trap.max || 5.2) - (trap.min || 1.6)); }

  /** @param {number} span max random span */
  roll(span) { return (this.rng ? this.rng.next() : Math.random()) * span; }
}
