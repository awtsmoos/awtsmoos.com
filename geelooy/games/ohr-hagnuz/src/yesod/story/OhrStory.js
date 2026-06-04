/**
 * B"H
 * @module OhrStory
 * @description Dialogue tree runtime: readable, stepped, mission-aware conversations.
 *
 * Chapter 190: The line became a page. The Awtsmoos has no body and no form,
 * yet a long intro needs Next, Back, Mission, and Close. Speaking to a guide now
 * opens a real dialogue vessel instead of flooding the HUD and vanishing into a
 * scrolling phone screen.
 */
import { State } from '../../binah/State.js';
import { storyLinesForGlyph } from '../../data/stories/StoryIndex.js';
import { questById } from '../../data/QuestIndex.js';
import { questStatus } from '../OhrQuest.js';

const fallbackLines = label => [`${label} is quiet for a moment.`, 'Open Journal to see the next mission, or keep exploring nearby glyphs.'];

export const dialogueTreeFor = (glyph, label = 'NPC', questId = null) => {
  const story = storyLinesForGlyph(glyph);
  const quest = questId ? questById(questId) : null;
  const missionLines = quest ? [`Mission: ${quest.title}`, quest.start, `Progress: ${questStatus(questId)}`] : [];
  const lines = [...missionLines, ...(story.length ? story : fallbackLines(label))];
  return { glyph, label, questId, lines };
};

export const openStoryDialogue = (glyph, label = 'NPC', questId = null) => {
  const tree = dialogueTreeFor(glyph, label, questId);
  State.openDialogue(tree);
  return true;
};

export const tellStory = (glyph, label = 'NPC', questId = null) => openStoryDialogue(glyph, label, questId);
