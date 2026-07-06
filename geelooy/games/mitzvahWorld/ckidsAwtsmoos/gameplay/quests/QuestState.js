// B"H
import { QUEST_CHAIN, questById } from "./QuestDefinitions.js";
import { addItem } from "../inventory/InventoryState.js";
import { awardXp } from "../player/PlayerState.js";

export function createQuestState() {
  return {
    active:{},
    completed:{},
    available:["clear_the_garden"],
    lastReward:null
  };
}

export function markerForNpc(questState, npcId) {
  const available = questState.available.map(questById).find(q => q?.giverId === npcId && !questState.completed[q.id]);
  if (available) return "gold!";
  const active = Object.values(questState.active).map(row => questById(row.id)).find(q => q?.giverId === npcId);
  if (!active) return "";
  const row = questState.active[active.id];
  return row.progress >= active.objective.count ? "gold?" : "silver?";
}

export function acceptNextQuest(questState, npcId) {
  const quest = questState.available.map(questById).find(q => q?.giverId === npcId && !questState.active[q.id] && !questState.completed[q.id]);
  if (!quest) return { ok:false, reason:"no-available-quest" };
  questState.available = questState.available.filter(id => id !== quest.id);
  questState.active[quest.id] = { id:quest.id, progress:0, acceptedAt:Date.now() };
  return { ok:true, quest, marker:markerForNpc(questState, npcId) };
}

export function updateKillQuest(questState, species) {
  const updates = [];
  for (const row of Object.values(questState.active)) {
    const quest = questById(row.id);
    if (quest?.objective.type === "kill" && quest.objective.target.includes(species)) {
      row.progress = Math.min(quest.objective.count, row.progress + 1);
      updates.push({ id:quest.id, progress:row.progress, count:quest.objective.count });
    }
  }
  return updates;
}

export function updateCollectQuest(questState, itemId, qty = 1) {
  const updates = [];
  for (const row of Object.values(questState.active)) {
    const quest = questById(row.id);
    if (quest?.objective.type === "collect" && quest.objective.target.includes(itemId)) {
      row.progress = Math.min(quest.objective.count, row.progress + qty);
      updates.push({ id:quest.id, progress:row.progress, count:quest.objective.count });
    }
  }
  return updates;
}

export function turnInReadyQuest(questState, npcId, player, inventory) {
  const row = Object.values(questState.active).find(active => {
    const quest = questById(active.id);
    return quest?.giverId === npcId && active.progress >= quest.objective.count;
  });
  if (!row) return { ok:false, reason:"no-complete-quest" };
  const quest = questById(row.id);
  delete questState.active[quest.id];
  questState.completed[quest.id] = { at:Date.now() };
  if (quest.next) questState.available.push(quest.next);
  player.coins += quest.rewards.coins || 0;
  const levelUps = awardXp(player, quest.rewards.xp || 0);
  for (const id of quest.rewards.items || []) addItem(inventory, id, 1);
  questState.lastReward = { questId:quest.id, rewards:quest.rewards, levelUps };
  return { ok:true, quest, rewards:quest.rewards, levelUps, marker:markerForNpc(questState, npcId) };
}

export function questTrackerRows(questState) {
  return Object.values(questState.active).map(row => {
    const quest = questById(row.id);
    return { id:row.id, title:quest.title, text:`${quest.objective.label}: ${row.progress}/${quest.objective.count}`, complete:row.progress >= quest.objective.count };
  });
}

export function chainSummary(questState) {
  return QUEST_CHAIN.map(quest => ({
    id:quest.id,
    status:questState.completed[quest.id] ? "complete" : questState.active[quest.id] ? "active" : questState.available.includes(quest.id) ? "available" : "locked",
    progress:questState.active[quest.id]?.progress || 0,
    count:quest.objective.count
  }));
}
