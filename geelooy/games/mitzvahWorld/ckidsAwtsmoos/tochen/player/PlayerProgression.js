/**
 * B\"H
 * @file PlayerProgression.js
 * @description
 * Canonical single-player RPG progression state.
 */

import { getLevelFromExp, getExpForLevel } from "./LevelCurve.js";

export function createPlayerProgression() {
  return {
    level: 1,
    exp: 0,
    expNow: 0,
    expNext: getExpForLevel(2),
    maxHp: 100,
    hp: 100,
    emuna: 100,
    maxEmuna: 100,
    coins: 0,
    sparks: 0,
    reputation: {
      emeraldVillage: 0,
      scholars: 0,
      wanderers: 0,
      guardians: 0
    },
    unlockedSkills: ["shema_yisrael"]
  };
}

export function gainExp(state, amount = 0) {
  const safeAmount = Math.max(0, Number(amount) || 0);
  state.exp += safeAmount;
  state.level = getLevelFromExp(state.exp);
  state.expNext = getExpForLevel(state.level + 1);
  state.expNow = state.exp;

  return state;
}
