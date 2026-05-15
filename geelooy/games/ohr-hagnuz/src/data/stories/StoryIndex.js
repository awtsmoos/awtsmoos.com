/** B"H * @module StoryIndex */
import { MidgameStories } from './StoryIndexMidgame.js';

const CoreStories = {
  'ג': ['I saw a spark fall near the old path.', 'Every quest is a vessel. Every vessel must be begun.'],
  'ס': ['Sources are not chains; they are lamps along the way.', 'Bring me a win from a debate and I will know you are reading truly.'],
  'נ': ['Words are coins of soul; do not spend them cheaply.', 'A parchment blew out of my shelf. Find it in the market.'],
  'ש': ['The garden grows only what you give back to it.', 'Three sparks will teach the trees to sing.'],
  'י': ['The river crosses the player, not the other way around.', 'Sweeten two wild musagim, and the water will remember you.'],
  'ק': ['Every cave is the inside of a letter.', 'Bring me the parchment from the cave and I will show you the returning light.'],
  'צ': ['Hidden does not mean far. It means you are not yet quiet enough.', 'Win five debates and return with a listening heart.']
};

export const StoryIndex = { ...CoreStories, ...MidgameStories };

export const storyForGlyph = (glyph) => {
  const lines = StoryIndex[glyph] || [];
  if (!lines.length) return null;
  return lines[Math.floor(Math.random() * lines.length)];
};
