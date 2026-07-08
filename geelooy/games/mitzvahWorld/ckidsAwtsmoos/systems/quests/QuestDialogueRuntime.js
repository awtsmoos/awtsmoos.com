// B"H
/** @file QuestDialogueRuntime.js @description NPC quest dialogue payloads. */
import { questById } from "./KidQuestCatalog.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { acceptQuest, questMarkerType, turnInQuest } from "./QuestState.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { objectiveProgress } from "./QuestObjectives.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export function questDialoguePayload(olam, npc) {
  const quest = questById(npc?.questId);
  if (!quest) return null;
  const state = questMarkerType(olam, quest.id);
  if (state === "available") return { questId:quest.id, title:quest.title, marker:"gold-bang", line:quest.offer, action:"offer", buttons:["ACCEPT QUEST", "TRACK QUEST", "CLOSE"] };
  if (state === "complete") return { questId:quest.id, title:quest.title, marker:"gold-question", line:"You found everything. Ready to turn it in?", action:"readyTurnIn", buttons:["TURN IN", "TRACK QUEST", "CLOSE"] };
  return { questId:quest.id, title:quest.title, marker:"silver-question", line:"Keep going, you are helping the village.", action:"progress", buttons:["TRACK QUEST", "CLOSE"], progress:objectiveProgress(olam.__kidQuestState, quest) };
}

export function handleQuestTalk(olam, npc) {
  const payload = questDialoguePayload(olam, npc);
  if (!payload) return null;
  return { ...payload, stateChanged:false };
}

export function handleQuestAction(olam, npc, action) {
  const payload = questDialoguePayload(olam, npc);
  if (!payload) return null;
  const normalized = String(action || "").toLowerCase();
  if (normalized.includes("accept")) return { ...payload, stateChanged:true, accepted:acceptQuest(olam, payload.questId) };
  if (normalized.includes("turn")) return { ...payload, stateChanged:true, turnIn:turnInQuest(olam, payload.questId) };
  return { ...payload, stateChanged:false };
}

export default { questDialoguePayload, handleQuestTalk, handleQuestAction };
