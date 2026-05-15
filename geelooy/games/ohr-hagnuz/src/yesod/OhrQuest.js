/**
 * B"H
 * @module OhrQuest
 * Tiny quest runtime: start, count, reward, complete, and display.
 */
import { State } from '../binah/State.js';
import { QuestIndex, questById } from '../data/QuestIndex.js';
import { addGarment, garmentRewardForQuest, syncLightCapacity } from './equipment/EquipmentRuntime.js';

export const ensureQuestState = () => {
  State.Quests ||= { active: {}, completed: {}, counters: { spark: 0, scroll: 0, debateWon: 0, wildWon: 0, chest: 0 } };
  State.Quests.counters ||= { spark: 0, scroll: 0, debateWon: 0, wildWon: 0, chest: 0 };
  return State.Quests;
};

export const startQuest = (id) => {
  const quest = questById(id);
  const qs = ensureQuestState();
  if (!quest) return false;
  if (qs.completed[id]) {
    State.say(`${quest.title}: already complete.`, 240);
    return true;
  }
  if (!qs.active[id]) {
    qs.active[id] = { started: true, progress: {} };
    State.say(`${quest.title}: ${quest.start}`, 520);
    return true;
  }
  return tryCompleteQuest(id);
};

export const recordQuestEvent = (kind, amount = 1) => {
  const qs = ensureQuestState();
  qs.counters[kind] = (qs.counters[kind] || 0) + amount;
  for (const id of Object.keys(qs.active)) tryCompleteQuest(id, false);
};

export const collectQuestItem = (itemId) => {
  recordQuestEvent(itemId, 1);
  State.say(`Collected ${itemId}.`, 220);
};

export const tryCompleteQuest = (id, speak = true) => {
  const quest = questById(id);
  const qs = ensureQuestState();
  if (!quest || !qs.active[id]) return false;
  const ok = Object.entries(quest.need || {}).every(([key, count]) => (qs.counters[key] || 0) >= count);
  if (!ok) {
    if (speak) State.say(questStatus(id), 360);
    return false;
  }

  delete qs.active[id];
  qs.completed[id] = true;
  State.Stats.sparks += 2;
  if (id === 'hidden_tzaddik') {
    State.Stats.maxLight += 20;
    State.Stats.light = State.Stats.maxLight;
  }

  const rewardId = garmentRewardForQuest(id);
  const rewardText = rewardId ? (addGarment(rewardId) ? ` Garment unlocked: ${rewardId}.` : '') : '';
  syncLightCapacity();

  State.say(`${quest.title} complete. ${quest.done}${rewardText}`, 520);
  return true;
};

export const questStatus = (id) => {
  const quest = questById(id);
  const qs = ensureQuestState();
  if (!quest) return 'Unknown quest.';
  const parts = Object.entries(quest.need || {}).map(([key, count]) => `${key}: ${qs.counters[key] || 0}/${count}`);
  return `${quest.title}: ${parts.join(', ')}`;
};

export const interactQuest = (meta) => {
  if (meta.quest) return startQuest(meta.quest);
  if (meta.questItem) {
    collectQuestItem(meta.questItem);
    return true;
  }
  return false;
};

export const questSummary = () => {
  const qs = ensureQuestState();
  return {
    active: Object.keys(qs.active).map(id => ({ id, title: QuestIndex[id]?.title, status: questStatus(id) })),
    completed: Object.keys(qs.completed),
    counters: qs.counters
  };
};
