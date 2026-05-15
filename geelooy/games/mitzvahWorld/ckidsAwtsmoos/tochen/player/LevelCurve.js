/**
 * B\"H
 * @file LevelCurve.js
 * @description
 * Single-player RPG level curve for Mitzvah World.
 */

export function getExpForLevel(level = 1) {
  const safeLevel = Math.max(1, Number(level) || 1);
  return Math.floor(50 + Math.pow(safeLevel, 1.8) * 75);
}

export function getLevelFromExp(exp = 0) {
  const safeExp = Math.max(0, Number(exp) || 0);
  let level = 1;

  while (safeExp >= getExpForLevel(level + 1)) {
    level += 1;

    if (level >= 100) break;
  }

  return level;
}
