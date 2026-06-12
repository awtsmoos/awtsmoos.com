import { HATS } from '../data/hats.js';

/**
 * B"H
 * Applies hat class stats to a fighter.
 *
 * Chapter 207: the hat rests on the head and descends into physics. Extra
 * jump, recovery, air drift, defense, knockback, and charge become one small
 * class system without adding separate characters.
 */
export function applyHatStats(fighter) {
  const id = fighter.cosmetic?.headwear || 'kippah';
  const hat = HATS[id] || HATS.kippah;
  fighter.hatStats = { ...hat.stats, id: hat.id, label: hat.label };
  return fighter;
}

export function damageAfterDefense(target, amount) {
  const defense = target.hatStats?.defense || 1;
  return Math.max(1, Math.round(amount / defense));
}

export function knockAfterHat(attacker, amount) {
  return amount * (attacker.hatStats?.knock || 1);
}

export function chargeSpeed(fighter) {
  return fighter.hatStats?.charge || 1;
}
