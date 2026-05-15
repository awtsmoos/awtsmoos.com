/**
 * B"H
 * @module AbilityRuntime
 */
import { State } from '../../binah/State.js';
import { AbilityIndex, BaseAbilityIds } from '../../data/abilities/AbilityIndex.js';
import { hasGarment } from '../equipment/EquipmentRuntime.js';

export const isAbilityUnlocked = (ability) => {
  if (!ability) return false;
  if (ability.unlockLevel && State.Stats.level < ability.unlockLevel) return false;
  if (ability.unlockQuest && !State.Quests.completed[ability.unlockQuest]) return false;
  if (ability.unlockGarment && !hasGarment(ability.unlockGarment)) return false;
  return true;
};

export const unlockedAbilities = () => Object.values(AbilityIndex).filter(isAbilityUnlocked);

export const currentMoves = () => {
  const moves = unlockedAbilities();
  return moves.length >= 4 ? moves.slice(0, 4) : BaseAbilityIds.map(id => AbilityIndex[id]);
};

export const abilitySummary = () => unlockedAbilities().map(ability => ability.name);
