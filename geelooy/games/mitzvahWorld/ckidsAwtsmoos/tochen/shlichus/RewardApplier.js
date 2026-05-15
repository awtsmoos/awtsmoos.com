/**
 * B\"H
 * @file RewardApplier.js
 * @description
 * Applies quest rewards to player progression state.
 */

import { gainExp } from "../player/PlayerProgression.js";

export function applyRewards(player, rewards = {}) {
  if (!player) return player;

  if (rewards.exp) gainExp(player, rewards.exp);
  if (rewards.coins) player.coins = (player.coins || 0) + rewards.coins;
  if (rewards.sparks) player.sparks = (player.sparks || 0) + rewards.sparks;

  if (rewards.unlockSkill) {
    player.unlockedSkills = player.unlockedSkills || [];
    if (!player.unlockedSkills.includes(rewards.unlockSkill)) {
      player.unlockedSkills.push(rewards.unlockSkill);
    }
  }

  if (rewards.title) {
    player.titles = player.titles || [];
    if (!player.titles.includes(rewards.title)) player.titles.push(rewards.title);
  }

  if (Array.isArray(rewards.items)) {
    player.inventory = player.inventory || [];
    rewards.items.forEach(id => player.inventory.push({ id, amount: 1 }));
  }

  return player;
}
