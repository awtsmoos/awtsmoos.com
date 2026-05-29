// B"H
const FAIR_WARNING = 0.9;

/**
 * Chapter 5: The Awtsmoos made every tooth announce its decree.
 *
 * SpikeOracle breathes timed, proximity, triggered, moving, rolling, and
 * orbiting danger. The old oracle allowed instant proximity violence. This one
 * enforces warning before contact, because a human player must be asked a clear
 * question before being punished for the answer.
 */
export class SpikeOracle {
  /** @param {Array<object>} traps Danger zones. @param {object|null} rng Random vessel. */
  constructor(traps = [], rng = null) {
    this.rng = rng;
    this.traps = traps.map((trap, index) => this.prepareTrap(trap, index));
  }

  /** @param {object} trap Raw trap. @param {number} index Stable id. @returns {object} Prepared trap. */
  prepareTrap(trap, index = 0) {
    const baseX = trap.baseX ?? trap.x;
    const baseY = trap.baseY ?? trap.y;
    const fair = this.fairTrap(trap);
    return { ...fair, id: fair.id ?? index, x: fair.x, y: fair.y, baseX, baseY, t: fair.t ?? fair.phase ?? index * 0.37, cooldown: fair.cooldown ?? ((fair.delay || 1) + this.roll(0.8) + index * 0.17), warn: fair.warn || 0, active: fair.active || 0, spent: fair.spent || false, cycleActive: fair.cycleActive ?? false };
  }

  /** @param {object} trap Raw trap. @returns {object} Trap with humane timing. */
  fairTrap(trap) {
    const needsMercy = trap.proximity || trap.instant || trap.fallSpeed || trap.orbitR || trap.moveX || trap.moveY || trap.rollSpeed;
    if (!needsMercy) return trap;
    const warning = Math.max(Number(trap.warning ?? FAIR_WARNING), FAIR_WARNING);
    return { ...trap, instant: false, warning, showDormant: trap.showDormant !== false, safe: Math.max(Number(trap.safe ?? 120), 120) };
  }

  /** @param {number} dt Seconds. @param {object} player Hero body. @returns {void} */
  step(dt, player) { for (const trap of this.traps) this.stepTrap(trap, dt, player); }

  /** @param {object} trap Trap. @param {number} dt Seconds. @param {object} player Hero. */
  stepTrap(trap, dt, player) {
    trap.t += dt;
    if (trap.proximity) this.stepProximity(trap, dt, player);
    else if (trap.cycle) this.stepCycle(trap, dt);
    else this.stepTimed(trap, dt, player);
    this.applyMotion(trap, dt);
  }

  /** @param {object} trap Trap. @param {number} dt Seconds. @param {object} player Hero. */
  stepProximity(trap, dt, player) {
    if (trap.once && trap.spent && !trap.active && !trap.warn) return;
    const near = this.nearPlayer(trap, player, trap.range || 92);
    if (near && !trap.warn && !trap.active) { trap.warn = Math.max(trap.warning ?? FAIR_WARNING, FAIR_WARNING); trap.spent = true; }
    this.tickWarnThenActive(trap, dt, trap.duration || 0.9);
  }

  /** @param {object} trap Trap. @param {number} dt Seconds. */
  stepCycle(trap, dt) {
    const period = Math.max(0.4, trap.period || 2.4);
    const phase = (trap.t % period) / period;
    const duty = trap.duty ?? 0.55;
    const warningBand = Math.min(0.22, Math.max(0.12, (trap.warning || FAIR_WARNING) / period));
    trap.active = phase < duty ? 0.08 : 0;
    trap.warn = !trap.active && phase < duty + warningBand ? 0.08 : 0;
  }

  /** @param {object} trap Trap. @param {number} dt Seconds. @param {object} player Hero. */
  stepTimed(trap, dt, player) {
    trap.cooldown -= dt;
    const safeDistance = Math.abs((player.x + 17) - (trap.x + trap.w / 2)) > (trap.safe || 28);
    if (trap.cooldown <= 0 && !trap.warn && !trap.active && safeDistance) trap.warn = Math.max((trap.warning || 0.9) + this.roll(0.35), FAIR_WARNING);
    this.tickWarnThenActive(trap, dt, (trap.duration || 0.75) + this.roll(0.32));
  }

  /** @param {object} trap Trap. @param {number} dt Seconds. @param {number} duration Active seconds. */
  tickWarnThenActive(trap, dt, duration) {
    if (trap.warn) { trap.warn -= dt; if (trap.warn <= 0) { trap.warn = 0; trap.active = duration; } }
    if (!trap.active) return;
    trap.active -= dt;
    if (trap.active <= 0) this.resetTrap(trap);
  }

  /** @param {object} trap Trap. @param {number} dt Seconds. */
  applyMotion(trap, dt) {
    if (!trap.active && !trap.warn && !trap.showDormant) return;
    if (trap.fallSpeed && trap.active) trap.y += trap.fallSpeed * dt;
    if (trap.moveX) trap.x = trap.baseX + Math.sin(trap.t * (trap.moveRate || 1.8)) * trap.moveX;
    if (trap.moveY) trap.y = trap.baseY + Math.sin(trap.t * (trap.moveRate || 1.8)) * trap.moveY;
    if (trap.rollSpeed) this.rollTrap(trap, dt);
    if (trap.orbitR) this.orbitTrap(trap);
  }

  /** @param {object} trap Trap. @param {number} dt Seconds. */
  rollTrap(trap, dt) {
    const min = trap.minX ?? trap.baseX;
    const max = trap.maxX ?? (trap.baseX + 320);
    trap.x += (trap.dir || 1) * trap.rollSpeed * dt;
    if (trap.x < min || trap.x > max) { trap.dir = -(trap.dir || 1); trap.x = Math.max(min, Math.min(max, trap.x)); }
  }

  /** @param {object} trap Trap. */
  orbitTrap(trap) {
    const cx = trap.orbitX ?? trap.baseX;
    const cy = trap.orbitY ?? trap.baseY;
    trap.x = cx + Math.cos(trap.t * (trap.orbitRate || 2.2)) * trap.orbitR;
    trap.y = cy + Math.sin(trap.t * (trap.orbitRate || 2.2)) * (trap.orbitYRadius || trap.orbitR);
  }

  /** @param {object} trap Trap. */
  resetTrap(trap) { trap.active = 0; trap.x = trap.baseX; trap.y = trap.baseY; trap.cooldown = this.nextCooldown(trap); }
  /** @returns {Array<object>} Active traps. */
  active() { return this.traps.filter(trap => trap.active > 0); }
  /** @returns {Array<object>} Warning traps. */
  warning() { return this.traps.filter(trap => trap.warn > 0); }
  /** @param {object} trap Trap. @returns {number} Cooldown. */
  nextCooldown(trap) { return (trap.min || 1.6) + this.roll((trap.max || 5.2) - (trap.min || 1.6)); }
  /** @param {object} trap Trap. @param {object} player Player. @param {number} range Range. @returns {boolean} Nearness. */
  nearPlayer(trap, player, range) { return Math.abs((trap.x + trap.w / 2) - (player.x + player.w / 2)) <= range && Math.abs((trap.y + trap.h / 2) - (player.y + player.h / 2)) <= range; }
  /** @param {number} span Random span. @returns {number} Random amount. */
  roll(span) { return (this.rng ? this.rng.next() : Math.random()) * span; }
}
