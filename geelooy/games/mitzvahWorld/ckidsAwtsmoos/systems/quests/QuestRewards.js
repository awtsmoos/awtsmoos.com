// B"H
/** @file QuestRewards.js @description Quest reward delivery. */
import { addBagItem } from "../inventory/BagRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { awardMoney, walletPlayerOf } from "../economy/wallet/PersonalPerutaWallet.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export function grantQuestReward(olam, quest) {
  const reward = quest?.reward || {};
  const player = walletPlayerOf(olam);
  if (reward.perutah) awardMoney(player, reward.perutah, `quest ${quest.id}`);
  if (reward.gift_token) addBagItem(olam, "gift_token", { silent:true });
  if (reward.mitzvahPoints) player && (player.mitzvahPoints = Number(player.mitzvahPoints || 0) + Number(reward.mitzvahPoints));
  return { perutah:Number(reward.perutah || 0), giftToken:Number(reward.gift_token || 0), mitzvahPoints:Number(reward.mitzvahPoints || 0) };
}

export default { grantQuestReward };
