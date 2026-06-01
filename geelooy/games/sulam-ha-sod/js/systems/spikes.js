// B"H
const FAIR_WARNING = 0.9;

/**
 * SpikeOracle: teeth that announce judgment without creating garbage.
 *
 * Chapter 13: The Awtsmoos made every tooth speak before it bites. Dormant
 * iron sleeps low, warning iron rises, active iron stands tall. The oracle now
 * keeps reusable active and warning arrays, so the renderer no longer summons
 * new lists from nothing sixty times a second.
 */
export class SpikeOracle {
  constructor(traps = [], rng = null) {
    this.rng = rng;
    this.traps = traps.map((trap, index) => this.prepareTrap(trap, index));
    this.activeCache = [];
    this.warningCache = [];
    this.dormantCache = [];
  }

  prepareTrap(trap, index = 0) {
    const baseX = trap.baseX ?? trap.x, baseY = trap.baseY ?? trap.y, fair = this.fairTrap(trap);
    return {
      ...fair, id: fair.id ?? index, x: fair.x, y: fair.y, baseX, baseY,
      t: fair.t ?? fair.phase ?? index * 0.37,
      cooldown: fair.cooldown ?? ((fair.delay || 1) + this.roll(0.8) + index * 0.17),
      warn: fair.warn || 0, active: fair.active || 0, spent: fair.spent || false,
      cycleActive: fair.cycleActive ?? false
    };
  }

  fairTrap(trap) {
    const needsMercy = trap.proximity || trap.instant || trap.fallSpeed || trap.orbitR || trap.moveX || trap.moveY || trap.rollSpeed;
    if (!needsMercy) return trap;
    const warning = Math.max(Number(trap.warning ?? FAIR_WARNING), FAIR_WARNING);
    return { ...trap, instant: false, warning, showDormant: trap.showDormant !== false, safe: Math.max(Number(trap.safe ?? 120), 120) };
  }

  step(dt, player) { for (const trap of this.traps) this.stepTrap(trap, dt, player); }

  stepTrap(trap, dt, player) {
    trap.t += dt;
    if (trap.proximity) this.stepProximity(trap, dt, player);
    else if (trap.cycle) this.stepCycle(trap, dt);
    else this.stepTimed(trap, dt, player);
    this.applyMotion(trap, dt);
  }

  stepProximity(trap, dt, player) {
    if (trap.once && trap.spent && !trap.active && !trap.warn) return;
    const near = this.nearPlayer(trap, player, trap.range || 92);
    if (near && !trap.warn && !trap.active) { trap.warn = Math.max(trap.warning ?? FAIR_WARNING, FAIR_WARNING); trap.spent = true; }
    this.tickWarnThenActive(trap, dt, trap.duration || 0.9);
  }

  stepCycle(trap, dt) {
    const period = Math.max(0.4, trap.period || 2.4), phase = (trap.t % period) / period, duty = trap.duty ?? 0.55;
    const warningBand = Math.min(0.22, Math.max(0.12, (trap.warning || FAIR_WARNING) / period));
    trap.active = phase < duty ? 0.08 : 0;
    trap.warn = !trap.active && phase < duty + warningBand ? 0.08 : 0;
  }

  stepTimed(trap, dt, player) {
    trap.cooldown -= dt;
    const safeDistance = Math.abs((player.x + 17) - (trap.x + trap.w / 2)) > (trap.safe || 28);
    if (trap.cooldown <= 0 && !trap.warn && !trap.active && safeDistance) trap.warn = Math.max((trap.warning || 0.9) + this.roll(0.35), FAIR_WARNING);
    this.tickWarnThenActive(trap, dt, (trap.duration || 0.75) + this.roll(0.32));
  }

  tickWarnThenActive(trap, dt, duration) {
    if (trap.warn) { trap.warn -= dt; if (trap.warn <= 0) { trap.warn = 0; trap.active = duration; } }
    if (!trap.active) return;
    trap.active -= dt;
    if (trap.active <= 0) this.resetTrap(trap);
  }

  applyMotion(trap, dt) {
    if (!trap.active && !trap.warn && !trap.showDormant) return;
    if (trap.fallSpeed && trap.active) trap.y += trap.fallSpeed * dt;
    if (trap.moveX) trap.x = trap.baseX + Math.sin(trap.t * (trap.moveRate || 1.8)) * trap.moveX;
    if (trap.moveY) trap.y = trap.baseY + Math.sin(trap.t * (trap.moveRate || 1.8)) * trap.moveY;
    if (trap.rollSpeed) this.rollTrap(trap, dt);
    if (trap.orbitR) this.orbitTrap(trap);
  }

  rollTrap(trap, dt) {
    const min = trap.minX ?? trap.baseX, max = trap.maxX ?? (trap.baseX + 320);
    trap.x += (trap.dir || 1) * trap.rollSpeed * dt;
    if (trap.x < min || trap.x > max) { trap.dir = -(trap.dir || 1); trap.x = Math.max(min, Math.min(max, trap.x)); }
  }

  orbitTrap(trap) {
    const cx = trap.orbitX ?? trap.baseX, cy = trap.orbitY ?? trap.baseY;
    trap.x = cx + Math.cos(trap.t * (trap.orbitRate || 2.2)) * trap.orbitR;
    trap.y = cy + Math.sin(trap.t * (trap.orbitRate || 2.2)) * (trap.orbitYRadius || trap.orbitR);
  }

  resetTrap(trap) { trap.active = 0; trap.x = trap.baseX; trap.y = trap.baseY; trap.cooldown = this.nextCooldown(trap); }

  active() { return this.collect(this.activeCache, trap => trap.active > 0); }
  warning() { return this.collect(this.warningCache, trap => trap.warn > 0); }
  dormant() { return this.collect(this.dormantCache, trap => trap.showDormant !== false && trap.warn <= 0 && trap.active <= 0); }

  collect(out, predicate) { out.length = 0; for (const trap of this.traps) if (predicate(trap)) out.push(trap); return out; }
  nextCooldown(trap) { return (trap.min || 1.6) + this.roll((trap.max || 5.2) - (trap.min || 1.6)); }
  nearPlayer(trap, player, range) { return Math.abs((trap.x + trap.w / 2) - (player.x + player.w / 2)) <= range && Math.abs((trap.y + trap.h / 2) - (player.y + player.h / 2)) <= range; }
  roll(span) { return (this.rng ? this.rng.next() : Math.random()) * span; }
}
