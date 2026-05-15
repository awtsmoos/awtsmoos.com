/**
 * B"H
 * @module OhrStory
 */
import { State } from '../../binah/State.js';
import { storyForGlyph } from '../../data/stories/StoryIndex.js';

export const tellStory = (glyph, label = 'NPC') => {
  const story = storyForGlyph(glyph);
  if (!story) return false;
  State.say(`${label}: ${story}`, 420);
  return true;
};
