import { COMBAT_TUNING } from '../data/combatTuning.js';
import { damageAfterDefense, knockAfterHat } from '../fighters/applyHatStats.js';

/**
 * B"H
 * Damage and force math.
 *
 * Chapter 11: before sparks fly, the numbers pass through a quiet chamber.
 * Buffs, hats, weapons, rapid minimums, and launch danger are weighed in one
 * small scale so the resolver can stay lean and fierce.
 */
export function attackPower(attacker) {
  return {
    damage: attacker.buffs?.gevurahFist ? 1.45 : attacker.buffs?.rageScroll ? 1.1 : 1,
    knock: attacker.buffs?.heavyGloves ? 1.24 : attacker.buffs?.gevurahFist ? 1.1 : 1
  };
}

export function damageFor(attacker, target, attack, weapon) {
  const power = attackPower(attacker);
  const base = attack.damage + (weapon?.damage || 0);
  const raw = Math.max(COMBAT_TUNING.rapid.minDamage, Math.round(base * power.damage));
  return damageAfterDefense(target, raw);
}

export function knockFor(attacker, attack, weapon) {
  const power = attackPower(attacker);
  return knockAfterHat(attacker, attack.knock * power.knock + (weapon?.knock || 0));
}

export function applyHitstop(state, attack, force) {
  if (attack.rapid) return;
  const t = COMBAT_TUNING.hitstop;
  state.hitstop = Math.max(state.hitstop || 0, Math.min(t.max, t.base + Math.floor(force / t.forceDivisor)));
}
