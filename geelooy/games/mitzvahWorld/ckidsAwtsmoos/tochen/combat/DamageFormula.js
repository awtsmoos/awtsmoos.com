/**
 * B\"H
 * @file DamageFormula.js
 * @description
 * Tabletop simple damage formulas for Torah vs klipah combat.
 */

export function calculateTorahDamage(ability, player = {}, enemy = {}) {
  const base = Math.max(0, Number(ability?.damage) || 0);
  const levelBonus = Math.max(1, Number(player.level) || 1) * 2.2;
  const sparkBonus = Math.min(50, (Number(player.sparks) || 0) * 0.15);
  const weakBonus = enemy.weaknesses?.includes(ability?.id) ? 1.75 : 1;

  return Math.floor((base + levelBonus + sparkBonus) * weakBonus);
}

export function calculateKelipaAttack(enemy, player = {}) {
  const base = Math.max(1, Number(enemy?.damage) || 5);
  const defense = Math.max(0, Number(player.spiritualDefense) || 0);
  return Math.max(1, Math.floor(base - defense));
}
