/**
 * B"H
 * @module BattleRank
 * @description Difficulty, enemy scaling, money, item drops, and reward labels.
 *
 * Chapter 198: Victory learned to leave objects behind. The Awtsmoos has no
 * body and no form, yet a battle should pay the bag: zuz, sparks, exp, tea,
 * ink, balm, scrolls, and sometimes a garment. The reward is now a felt landing
 * instead of only a sentence that disappears.
 */
import { State } from '../../binah/State.js';

const rankForEncounter = encounter => {
  const name = encounter?.name || '';
  if (name.includes('Tzaddik') || name.includes('Keter')) return { id: 'tzaddik', label: 'Tzaddik Test', mul: 1.6, exp: 50, sparks: 8, zuz: 18 };
  if (name.includes('Timekeeper') || name.includes('Blacksmith')) return { id: 'midgame', label: 'Midgame Sugya', mul: 1.35, exp: 35, sparks: 6, zuz: 12 };
  if (name.includes('Wild Musag')) return { id: 'wild', label: 'Wild Musag', mul: 1.15, exp: 24, sparks: 4, zuz: 7 };
  return { id: 'trainer', label: 'Trainer Debate', mul: 1, exp: 20, sparks: 3, zuz: 9 };
};

export const resolveBattleRank = encounter => {
  const base = rankForEncounter(encounter);
  const stage = Math.max(0, State.Stats.level - 1);
  return { ...base, mul: base.mul + stage * 0.08, levelBonus: stage };
};

export const scaleEnemyLight = encounter => Math.max(1, Math.round(encounter.light * resolveBattleRank(encounter).mul));

const itemDrops = rank => {
  const drops = {};
  if (rank.id === 'wild') drops.tea = 1;
  if (rank.id === 'trainer') drops.ink = 1;
  if (rank.id === 'midgame') drops.scroll = 1;
  if (rank.id === 'tzaddik') { drops.balm = 1; drops.scroll = 1; }
  if (Math.random() < 0.22) drops.balm = (drops.balm || 0) + 1;
  return drops;
};

export const battleReward = encounter => {
  const rank = resolveBattleRank(encounter);
  return {
    sparks: rank.sparks,
    exp: rank.exp + State.Stats.level * 6,
    zuzim: rank.zuz + State.Stats.level * 2,
    items: itemDrops(rank),
    label: rank.label
  };
};
