// B"H
/** @file questRenderer.js @description Chapter 436: Renders the standalone current quest card. */
import { QUEST_CSS } from './questCss.js';
import { entryQuestState } from './questState.js';
export function renderEntryQuest(entryScene = {}) {
  document.getElementById('emerald-quest-style')?.remove();
  const style = document.createElement('style'); style.id = 'emerald-quest-style'; style.textContent = QUEST_CSS; document.head.appendChild(style);
  document.getElementById('emerald-quest-card')?.remove();
  const quest = entryQuestState(entryScene), el = document.createElement('section');
  el.id = 'emerald-quest-card'; el.className = 'emerald-quest-card';
  el.innerHTML = `<h3>CURRENT QUEST</h3><strong>✦ ${quest.title}</strong><p>${quest.text}</p>`;
  document.body.appendChild(el); return el;
}
