// B"H
/** @file QuestItemRegistry.js @description Quest item ids recognized by missions. */
export const QUEST_ITEM_IDS = Object.freeze([
  "deer_antler", "deer_hide_token", "fox_tail_token", "fox_fur", "milk_token",
  "goat_wool", "goat_horn", "soft_fur", "frog_charm", "feather",
  "gift_token", "apple_token", "perutah_token"
]);

export function isQuestItem(id) {
  return QUEST_ITEM_IDS.includes(id);
}

export default { QUEST_ITEM_IDS, isQuestItem };
