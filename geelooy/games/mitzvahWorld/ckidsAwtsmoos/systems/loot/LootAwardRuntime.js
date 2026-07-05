// B"H
/** @file LootAwardRuntime.js @description Bridges awarded loot into quest progress. */
import { noteQuestItemCollected } from "../quests/QuestState.js";
import { isQuestItem } from "./QuestItemRegistry.js";

export function awardLootItemsToQuests(olam, items = []) {
  const awarded = [];
  for (const item of items || []) {
    const id = item?.id || item;
    const qty = Math.max(1, Number(item?.qty || 1));
    if (!id || !isQuestItem(id)) continue;
    noteQuestItemCollected(olam, id, qty);
    awarded.push(id);
  }
  olam.__lootQuestAwardDiag = { at:Date.now(), awarded, questItemRecognized:awarded.length > 0 };
  return olam.__lootQuestAwardDiag;
}

export default { awardLootItemsToQuests };
