/**
 * B"H
 * @module DebateGarmentEffects
 * Stat effects that turn garments into battle mechanics.
 */
import { resolveStats } from './StatResolver.js';
import { torahPower } from '../books/TorahBooks.js';

export const computeDebateDamage = (move) => {
  const stats = resolveStats();
  const insight = stats.chochmah;
  const connection = stats.daat;
  const learnedPower = torahPower();
  const roll = Math.floor(Math.random() * 7);
  const critChance = Math.min(0.45, 0.05 + connection * 0.015);
  const crit = Math.random() < critChance;
  const critMod = crit ? Math.max(6, Math.floor(connection * 1.5)) : 0;
  return {
    damage: move.power + roll + insight + Math.floor(learnedPower * 0.75) + critMod,
    crit,
    critMod,
    desc: crit ? ' *Daat critical flash!*' : ''
  };
};

export const computeDefenseLoss = (raw) => {
  const stats = resolveStats();
  const shield = Math.floor(stats.binah * 0.6);
  const loss = Math.max(1, raw - shield);
  return { loss, shield };
};

export const computeHeal = (base) => {
  const stats = resolveStats();
  return base + Math.floor(stats.binah * 0.35) + Math.floor(stats.daat * 0.2);
};
