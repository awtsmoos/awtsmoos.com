// B"H
/** @file questPanel.js @description Chapter 415: Current quest card mirrors the screenshot corner. */
export function questPanel(quest = {}) { return `<section class="ehud-panel ehud-quest"><h3>CURRENT QUEST</h3><div class="ehud-row"><span>✦ ${quest.title || 'A New Beginning'}</span></div><p>${quest.text || 'Speak to the guide near the Tree of Life.'}</p></section>`; }
