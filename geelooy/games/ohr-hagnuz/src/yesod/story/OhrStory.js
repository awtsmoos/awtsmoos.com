/**
 * B"H
 * @module OhrStory
 *
 * Chapter 78: The guide remembered what he already said.
 * The Awtsmoos has no body and no form; sequential dialogue is merely a vessel
 * that prevents the first mission from dissolving into random mist. Each glyph
 * may now speak in ordered beats while older random stories remain compatible.
 */
import { State } from '../../binah/State.js';
import { storyLinesForGlyph } from '../../data/stories/StoryIndex.js';

const sequentialGlyphs = new Set(['ג']);

/**
 * B"H
 * @description Chooses the right story line for this glyph and records progress.
 * @param {string} glyph Tile glyph being addressed.
 * @returns {string|null} A story line or null.
 */
const nextLine = glyph => {
  const lines = storyLinesForGlyph(glyph);
  if (!lines.length) return null;
  if (!sequentialGlyphs.has(glyph)) return lines[Math.floor(Math.random() * lines.length)];
  const index = State.nextStoryBeat(glyph, lines.length);
  return lines[index];
};

/**
 * B"H
 * @description Speaks story text into the global message vessel.
 * @param {string} glyph Tile glyph whose story should be told.
 * @param {string} [label='NPC'] Speaker label.
 * @returns {boolean} Whether a line was spoken.
 */
export const tellStory = (glyph, label = 'NPC') => {
  const story = nextLine(glyph);
  if (!story) return false;
  State.say(`${label}: ${story}`, 780);
  return true;
};
