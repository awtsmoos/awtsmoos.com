// B"H
import { addItem } from "../inventory/InventoryState.js";
import { updateCollectQuest } from "../quests/QuestState.js";
import { lootForSpecies } from "./LootTables.js";

export function createCorpse(enemy) {
  return {
    id:`corpse_${enemy.id}_${Date.now()}`,
    enemyId:enemy.id,
    species:enemy.species,
    name:`${enemy.name} remains`,
    kosherSpecies:Boolean(enemy.kosherSpecies),
    properHarvest:false,
    items:lootForSpecies(enemy.species, { proper:false }),
    coins:enemy.elite ? 5 : 2,
    looted:false,
    clickable:true,
    spark:true,
    createdAt:Date.now()
  };
}

export function processCorpseWithDesignatedTool(corpse) {
  if (!corpse || corpse.looted) return { ok:false, reason:"corpse-empty" };
  corpse.properHarvest = true;
  corpse.items = lootForSpecies(corpse.species, { tool:"shechitaKnife" });
  return { ok:true, corpseId:corpse.id, kosherSpecies:Boolean(corpse.kosherSpecies), items:corpse.items };
}

export function collectCorpse(corpse, player, inventory, questState) {
  if (!corpse || corpse.looted) return { ok:false, reason:"corpse-empty" };
  const collected = [];
  for (const item of corpse.items) {
    const added = addItem(inventory, item.id, item.qty);
    if (added.ok) {
      updateCollectQuest(questState, item.id, item.qty);
      collected.push(item);
    }
  }
  player.coins += corpse.coins || 0;
  corpse.looted = true;
  corpse.clickable = false;
  return { ok:true, corpseId:corpse.id, items:collected, coins:corpse.coins || 0 };
}
