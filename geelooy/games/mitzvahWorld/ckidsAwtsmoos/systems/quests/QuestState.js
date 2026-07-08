// B"H
/** @file QuestState.js @description Minimal stable quest state and inventory adapter. */
import { questById } from "./KidQuestCatalog.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { objectiveProgress } from "./QuestObjectives.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { grantQuestReward } from "./QuestRewards.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export function ensureQuestState(olam) {
  olam.__kidQuestState ||= { accepted:{}, completed:{}, turnedIn:{}, items:{}, events:[] };
  return olam.__kidQuestState;
}

function log(olam, type, payload = {}) {
  const state = ensureQuestState(olam);
  state.events.push({ at:Date.now(), type, ...payload });
  state.events = state.events.slice(-40);
}

export function acceptQuest(olam, questId) {
  const quest = questById(questId), state = ensureQuestState(olam);
  if (!quest) return { ok:false, reason:"missing-quest", questId };
  state.accepted[questId] = true;
  log(olam, "accept", { questId });
  return { ok:true, quest };
}

export function noteQuestItemCollected(olam, itemId, qty = 1) {
  const state = ensureQuestState(olam);
  state.items[itemId] = Number(state.items[itemId] || 0) + Math.max(1, Number(qty) || 1);
  for (const questId of Object.keys(state.accepted)) {
    const quest = questById(questId);
    if (quest?.objective?.itemId === itemId && objectiveProgress(state, quest).ready) state.completed[questId] = true;
  }
  log(olam, "item", { itemId, qty, total:state.items[itemId] });
  return state.items[itemId];
}

export function questMarkerType(olam, questId) {
  const state = ensureQuestState(olam);
  if (state.turnedIn[questId]) return null;
  if (state.completed[questId]) return "complete";
  if (!state.accepted[questId]) return "available";
  return "progress";
}

export function turnInQuest(olam, questId) {
  const quest = questById(questId), state = ensureQuestState(olam);
  if (!quest) return { ok:false, reason:"missing-quest", questId };
  if (!state.completed[questId] && !objectiveProgress(state, quest).ready) return { ok:false, reason:"not-ready", questId };
  state.completed[questId] = true;
  state.turnedIn[questId] = true;
  const reward = grantQuestReward(olam, quest);
  log(olam, "turn-in", { questId, reward });
  return { ok:true, quest, reward };
}

export default { ensureQuestState, acceptQuest, noteQuestItemCollected, questMarkerType, turnInQuest };
