/**
 * B"H
 * @module DebateGarmentEffects
 * @description Damage, defense, healing, and Torah-species weakness math.
 *
 * Chapter 173: The type chart became Torah. The Awtsmoos has no body and no
 * form, yet Pokémon-like tension needs weakness and affinity. A Musag now has a
 * route-category weakness; using the fitting Torah family cuts deeper, while
 * garments, books, fusions, and collected concepts still shape the blow.
 */
import { resolveStats } from './StatResolver.js';
import { torahPower } from '../books/TorahBooks.js';

const weaknessBonus = (move, enemy) => {
  if (!enemy?.weakTo || !move?.category) return { amount: 0, text: '' };
  const hit = enemy.weakTo === move.category || enemy.route === move.routeTitle;
  return hit ? { amount: 10, text: ` ${enemy.element || 'Musag'} weakness opened!` } : { amount: 0, text: '' };
};

export const computeDebateDamage = (move, enemy = null) => {
  const stats = resolveStats();
  const insight = stats.chochmah;
  const connection = stats.daat;
  const learnedPower = torahPower();
  const weak = weaknessBonus(move, enemy);
  const roll = Math.floor(Math.random() * 7);
  const critChance = Math.min(0.45, 0.05 + connection * 0.015);
  const crit = Math.random() < critChance;
  const critMod = crit ? Math.max(6, Math.floor(connection * 1.5)) : 0;
  return {
    damage: move.power + roll + insight + Math.floor(learnedPower * 0.75) + critMod + weak.amount,
    crit,
    critMod,
    desc: `${crit ? ' *Daat critical flash!*' : ''}${weak.text}`
  };
};

export const computeDefenseLoss = raw => {
  const stats = resolveStats();
  const shield = Math.floor(stats.binah * 0.6);
  const loss = Math.max(1, raw - shield);
  return { loss, shield };
};

export const computeHeal = base => {
  const stats = resolveStats();
  return base + Math.floor(stats.binah * 0.35) + Math.floor(stats.daat * 0.2);
};
