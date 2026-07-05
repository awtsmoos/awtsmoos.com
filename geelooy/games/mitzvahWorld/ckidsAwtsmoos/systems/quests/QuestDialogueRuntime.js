// B"H
/** @file QuestDialogueRuntime.js @description NPC quest dialogue payloads. */
import { questById } from "./KidQuestCatalog.js";
import { acceptQuest, questMarkerType, turnInQuest } from "./QuestState.js";
import { objectiveProgress } from "./QuestObjectives.js";

export function questDialoguePayload(olam, npc) {
  const quest = questById(npc?.questId);
  if (!quest) return null;
  const state = questMarkerType(olam, quest.id);
  if (state === "available") return { questId:quest.id, title:quest.title, marker:"!", line:quest.offer, action:"accept" };
  if (state === "complete") return { questId:quest.id, title:quest.title, marker:"?", line:"You found everything. Ready to turn it in?", action:"turnIn" };
  return { questId:quest.id, title:quest.title, marker:"...", line:"Keep going, you are helping the village.", action:"progress", progress:objectiveProgress(olam.__kidQuestState, quest) };
}

export function handleQuestTalk(olam, npc) {
  const payload = questDialoguePayload(olam, npc);
  if (!payload) return null;
  if (payload.action === "accept") acceptQuest(olam, payload.questId);
  else if (payload.action === "turnIn") payload.turnIn = turnInQuest(olam, payload.questId);
  return payload;
}

export default { questDialoguePayload, handleQuestTalk };
