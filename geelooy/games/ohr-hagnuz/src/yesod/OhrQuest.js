/**
 * B"H
 * @module OhrQuest
 * @description Campaign quest runtime: chapter gates, progress, rewards, and guidance.
 *
 * Chapter 146: The mission ledger began to think. The Awtsmoos has no body and
 * no form, yet a long game needs memory: prerequisites, active missions,
 * counters, next objective, completion rewards, and a short line that always
 * tells the player what vessel to touch next.
 */
import { State } from '../binah/State.js';
import { QuestIndex, orderedQuestIds, questById } from '../data/QuestIndex.js';
import { addGarment, garmentRewardForQuest, syncLightCapacity } from './equipment/EquipmentRuntime.js';

const defaultCounters = () => ({ spark: 0, scroll: 0, debateWon: 0, wildWon: 0, chest: 0, key: 0, book: 0, mitzvah: 0 });

export const ensureQuestState = () => {
  State.Quests ||= { active: {}, completed: {}, counters: defaultCounters() };
  State.Quests.active ||= {};
  State.Quests.completed ||= {};
  State.Quests.counters = { ...defaultCounters(), ...(State.Quests.counters || {}) };
  return State.Quests;
};

const prereqsMet = quest => (quest.prereq || []).every(id => ensureQuestState().completed[id]);
export const questAvailable = id => !!questById(id) && prereqsMet(questById(id));

export const startQuest = id => {
  const quest = questById(id);
  const qs = ensureQuestState();
  if (!quest) return false;
  if (!questAvailable(id)) return speakLocked(quest);
  if (qs.completed[id]) return speakNextAfterComplete(id, quest);
  if (!qs.active[id]) {
    qs.active[id] = { started: true, act: quest.act || 1 };
    State.Story.active = quest.title;
    State.Story.chapter = quest.act || State.Story.chapter || 1;
    State.say(`Act ${quest.act || 1}: ${quest.title}. ${quest.start}`, 720);
    return true;
  }
  return tryCompleteQuest(id);
};

const speakLocked = quest => {
  const missing = (quest.prereq || []).filter(id => !ensureQuestState().completed[id]).map(id => QuestIndex[id]?.title || id);
  State.say(`${quest.title} is not ready. First complete: ${missing.join(', ')}.`, 420);
  return true;
};

const speakNextAfterComplete = (id, quest) => {
  const next = quest.next && QuestIndex[quest.next];
  State.say(next ? `${quest.title} is complete. Next: ${next.title}. ${next.start}` : `${quest.title}: already complete.`, 420);
  return true;
};

export const recordQuestEvent = (kind, amount = 1) => {
  const qs = ensureQuestState();
  qs.counters[kind] = (qs.counters[kind] || 0) + amount;
  for (const id of Object.keys(qs.active)) tryCompleteQuest(id, false);
};

export const collectQuestItem = itemId => {
  recordQuestEvent(itemId, 1);
  State.Inventory.items[itemId] = (State.Inventory.items[itemId] || 0) + 1;
  State.say(`Collected ${itemId}. ${nextObjectiveLine()}`, 300);
};

export const tryCompleteQuest = (id, speak = true) => {
  const quest = questById(id);
  const qs = ensureQuestState();
  if (!quest || !qs.active[id]) return false;
  const ok = Object.entries(quest.need || {}).every(([key, count]) => (qs.counters[key] || 0) >= count);
  if (!ok) {
    if (speak) State.say(questStatus(id), 420);
    return false;
  }
  completeQuest(id, quest, speak);
  return true;
};

const completeQuest = (id, quest, speak) => {
  const qs = ensureQuestState();
  delete qs.active[id];
  qs.completed[id] = true;
  State.Stats.sparks += quest.finale ? 10 : 2;
  if (id === 'hidden_tzaddik' || quest.finale) {
    State.Stats.maxLight += quest.finale ? 40 : 20;
    State.Stats.light = State.Stats.maxLight;
  }
  const rewardId = garmentRewardForQuest(id);
  const rewardText = rewardId && addGarment(rewardId) ? ` Garment unlocked: ${rewardId}.` : '';
  syncLightCapacity();
  if (quest.next && QuestIndex[quest.next] && questAvailable(quest.next)) State.Quests.active[quest.next] = { started: true, act: QuestIndex[quest.next].act || quest.act };
  if (speak) State.say(`${quest.title} complete. ${quest.done}${rewardText} ${nextObjectiveLine()}`, 720);
};

export const questStatus = id => {
  const quest = questById(id);
  const qs = ensureQuestState();
  if (!quest) return 'Unknown quest.';
  const parts = Object.entries(quest.need || {}).map(([key, count]) => `${key}: ${qs.counters[key] || 0}/${count}`);
  return `${quest.title}: ${parts.join(', ')}.`;
};

export const interactQuest = meta => {
  if (meta.quest) return startQuest(meta.quest);
  if (meta.questItem) { collectQuestItem(meta.questItem); return true; }
  return false;
};

export const nextQuestId = () => {
  const qs = ensureQuestState();
  const active = orderedQuestIds().find(id => qs.active[id]);
  if (active) return active;
  return orderedQuestIds().find(id => !qs.completed[id] && questAvailable(id)) || null;
};

export const nextObjectiveLine = () => {
  const id = nextQuestId();
  if (!id) return 'All revealed missions are complete. Seek hidden guides.';
  const quest = QuestIndex[id];
  return qsLine(id, quest);
};

const qsLine = (id, quest) => {
  const status = ensureQuestState().active[id] ? questStatus(id) : `Start: ${quest.title}.`;
  return `Next mission: ${status} Find giver ${quest.giver}.`;
};

export const questSummary = () => {
  const qs = ensureQuestState();
  return {
    active: orderedQuestIds().filter(id => qs.active[id]).map(id => ({ id, title: QuestIndex[id]?.title, status: questStatus(id) })),
    available: orderedQuestIds().filter(id => !qs.active[id] && !qs.completed[id] && questAvailable(id)).slice(0, 3),
    completed: Object.keys(qs.completed),
    counters: qs.counters,
    next: nextObjectiveLine()
  };
};
