// B"H
/**
 * @file RewardApplier.js
 * @description
 * A reward is not a private mutation. This exported RPG helper keeps its old
 * bare-object contract, but when an `olam` is present it lets XP, wallet, and
 * inventory flow through the same rivers heard by HUD, persistence, and tests.
 */
import { gainExp } from "../player/PlayerProgression.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { rewardMissionXp } from "../../systems/progression/XpRewardRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { awardMoney, bindWalletOlam } from "../../systems/economy/wallet/PersonalPerutaWallet.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { addBagItem } from "../../systems/inventory/BagRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

const number = value => Number.isFinite(Number(value)) ? Number(value) : 0;
const whole = value => Math.max(0, Math.floor(number(value)));
const olamOf = (player, context = {}) => context.olam || player?.olam || null;
const rewardXp = rewards => whole(rewards.xp ?? rewards.exp ?? rewards.shlichusXp);
const rewardMoney = rewards => whole(rewards.perutah ?? rewards.perutas ?? rewards.coins);

function addUnique(list, value) {
  if (!value) return list;
  if (!list.includes(value)) list.push(value);
  return list;
}

function itemEntry(item) {
  if (typeof item === "string") return { id:item, amount:1, qty:1 };
  const id = item?.id || item?.itemId || item?.baseId;
  if (!id) return null;
  const amount = Math.max(1, Math.floor(number(item.amount ?? item.qty ?? 1)));
  return { ...item, id, amount, qty:amount };
}

function grantLegacyItem(player, entry) {
  if (!entry) return null;
  if (player.inventory && typeof player.inventory.addItem === "function") {
    player.inventory.addItem({ ...entry }, entry.amount);
    return entry;
  }
  if (!player.inventory) player.inventory = [];
  if (Array.isArray(player.inventory)) player.inventory.push({ id:entry.id, amount:entry.amount });
  else player.inventory[entry.id] = number(player.inventory[entry.id]) + entry.amount;
  return entry;
}

function grantItems(player, rewards, olam) {
  const items = Array.isArray(rewards.items) ? rewards.items : [];
  return items.map(itemEntry).filter(Boolean).map(entry => olam ? addBagItem(olam, entry) : grantLegacyItem(player, entry));
}

export function applyRewards(player, rewards = {}, context = {}) {
  if (!player) return player;
  const olam = olamOf(player, context), xp = rewardXp(rewards), perutas = rewardMoney(rewards);

  if (xp) olam ? rewardMissionXp(olam, xp, context.title || rewards.title || "Shlichus") : gainExp(player, xp);
  if (perutas) olam ? awardMoney(bindWalletOlam(player, olam), perutas, context.reason || "shlichus reward") : player.coins = number(player.coins) + perutas;
  if (rewards.sparks) player.sparks = number(player.sparks) + whole(rewards.sparks);

  player.unlockedSkills ||= [];
  addUnique(player.unlockedSkills, rewards.unlockSkill);
  for (const skill of rewards.skills || []) addUnique(player.unlockedSkills, skill);

  player.titles ||= [];
  addUnique(player.titles, rewards.title);

  grantItems(player, rewards, olam);
  return player;
}
