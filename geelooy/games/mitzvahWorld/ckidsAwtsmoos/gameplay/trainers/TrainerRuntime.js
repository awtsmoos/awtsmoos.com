// B"H
import { TRAINER_DEFINITIONS } from "./TrainerDefinitions.js";

export function listTrainerAbilities(trainerId, player) {
  const trainer = TRAINER_DEFINITIONS[trainerId];
  return (trainer?.abilities || []).map(ability => ({
    ...ability,
    learned:player.learnedAbilities.includes(ability.id),
    canLearn:player.level >= ability.level && player.coins >= ability.cost
  }));
}

export function learnAbility(trainerId, abilityId, player) {
  const ability = (TRAINER_DEFINITIONS[trainerId]?.abilities || []).find(row => row.id === abilityId);
  if (!ability) return { ok:false, reason:"unknown-ability" };
  if (player.learnedAbilities.includes(abilityId)) return { ok:true, alreadyKnown:true, ability };
  if (player.level < ability.level) return { ok:false, reason:"level-too-low", required:ability.level };
  if (player.coins < ability.cost) return { ok:false, reason:"insufficient-funds", coins:player.coins, cost:ability.cost };
  player.coins -= ability.cost;
  player.learnedAbilities.push(abilityId);
  if (!player.actionBar.includes(abilityId)) player.actionBar.splice(Math.min(player.actionBar.length, 5), 0, abilityId);
  return { ok:true, ability, coins:player.coins, actionBar:player.actionBar.slice() };
}
