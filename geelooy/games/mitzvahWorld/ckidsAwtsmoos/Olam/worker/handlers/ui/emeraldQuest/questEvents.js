// B"H
/** @file questEvents.js @description Chapter 437: Quest render event helper. */
import { renderEntryQuest } from './questRenderer.js';
export function installEntryQuestListener() { window.addEventListener('awtsRenderEntryQuest', e => renderEntryQuest(e.detail?.entryScene || e.detail || {})); }
