/**
 * B"H
 * Buff timers.
 *
 * Chapter 183: every blessing must fade cleanly. This module owns no powers;
 * it only counts down the candles so no buff becomes immortal by accident.
 */
export function tickBuffs(fighters) {
  for (let i = 0; i < fighters.length; i++) {
    const f = fighters[i];
    f.buffs ||= {};
    for (const key of Object.keys(f.buffs)) {
      f.buffs[key]--;
      if (f.buffs[key] <= 0) delete f.buffs[key];
    }
  }
}
