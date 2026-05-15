/**
 * B"H
 * @module BattleRank
 * Resolves difficulty, enemy scaling, rewards, and UI labels.
 */
import { State } from '../../binah/State.js';

const rank4fEncounter = (encounter) => {
  const name = encounter?.name || '';
  if (name.includes('Tzaddik') || name.includes('Keter')) {
    return { id: 'tzaddik', label: 'Tzaddik Test', mul: 1.6, exp: 50, sparks: 8 };
  }
  if (name.includes('Timekeeper') || name.includes('Blacksmith')) {
    return { id: 'midgame', label: 'Midgame Sugya', mul: 1.35, exp: 35, sparks: 6 };
  }
  if (name.includes('Wild Musag')) {
    return { id: 'wild', label: 'Wild Musag', mul: 1.15, exp: 24, sparks: 4 };
  }
  return { id: 'trainer', label: 'Trainer Debate', mul: 1, exp: 20, sparks: 3 };
};

export const resolveBattleRank = (encounter) => {
  const base = rank4fEncounter(encounter);
  const stage = Math.max(0, State.Stats.level - 1);
  const mul = base.mul + stage * 0.08;
  return { ...base, mul, levelBonus: stage };
};

export const scaleEnemyLight = (encounter) => {
  const rank = resolveBattleRank(encounter);
  return Math.max(1, Math.round(encounter.light * rank.mul));
};

export const battleReward = (encounter) => {
  const rank = resolveBattleRank(encounter);
  return {
    sparks: rank.sparks,
    exp: rank.exp + State.Stats.level * 6,
    label: rank.label
  };
};
