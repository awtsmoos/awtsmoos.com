// B"H
/** @file questState.js @description Chapter 434: First-entry quest state stays tiny and explicit. */
export function entryQuestState(entryScene = {}) {
  const quest = entryScene.manifest?.quest || {};
  return { title: quest.title || 'A New Beginning', text: quest.text || 'Speak to the guide near the Tree of Life.', complete: false };
}
