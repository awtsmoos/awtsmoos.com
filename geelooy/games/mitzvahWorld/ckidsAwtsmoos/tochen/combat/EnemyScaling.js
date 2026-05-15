/**
 * B\"H
 * @file EnemyScaling.js
 * @description
 * Single-player RPG klipah scaling helpers.
 */

export function scaleEnemy(base, playerLevel = 1) {
  const level = Math.max(1, Number(playerLevel) || 1);
  const multiplier = 1 + (level * 0.12);

  return {
    ...base,
    maxHp: Math.floor((base.maxHp || 100) * multiplier),
    damage: Math.floor((base.damage || 10) * (1 + level * 0.08)),
    exp: Math.floor((base.exp || 10) * (1 + level * 0.05))
  };
}
