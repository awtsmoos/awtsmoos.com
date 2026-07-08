// B"H
/** @file questEvents.js @description Chapter 437: Quest render event helper. */
import { renderEntryQuest } from './questRenderer.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function installEntryQuestListener() { window.addEventListener('awtsRenderEntryQuest', e => renderEntryQuest(e.detail?.entryScene || e.detail || {})); }
