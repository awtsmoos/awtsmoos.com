/**
 * B"H
 * @module StoryIndex
 *
 * Chapter 77: The dialogue stopped being a cloud and became a path.
 * The Awtsmoos has no body and no form; story lines are only vessels, yet they
 * must arrive in order so the first guide can lead the player from confusion to
 * a clear mission: speak, gather sparks, enter the Beis Midrash, and continue.
 */
import { MidgameStories } from './StoryIndexMidgame.js';

const CoreStories = {
  'ג': [
    'Shalom, Ohr Chozer. I am the Village Guide. The hidden light is scattered through this world, and you woke beside the road because the first spark is already near you.',
    'Use Talk when you face a person. Use Interact for doors, sparks, books, and mitzvah stations. If nothing is in front of you, the button will tell you what to do next.',
    'Your first mission: walk to the Beis Midrash door marked by the blue star, then interact with it. Inside, learn from the sefarim and return with one clear teaching.',
    'After the Beis Midrash, follow the road east to the Sage of Sources. Win one Torah debate, then open Journal to see your path continue.',
    'Remember: the Awtsmoos has no body and no form, yet renews every tile every instant. Your job is to reveal the hidden light inside the ordinary road.'
  ],
  'ס': [
    'Sources are not chains; they are lamps along the way.',
    'Bring me a win from a debate and I will know you are reading truly.'
  ],
  'נ': [
    'Words are coins of soul; do not spend them cheaply.',
    'A parchment blew out of my shelf. Find it in the market.'
  ],
  'ש': [
    'The garden grows only what you give back to it.',
    'Three sparks will teach the trees to sing.'
  ],
  'י': [
    'The river crosses the player, not the other way around.',
    'Sweeten two wild musagim, and the water will remember you.'
  ],
  'ק': [
    'Every cave is the inside of a letter.',
    'Bring me the parchment from the cave and I will show you the returning light.'
  ],
  'צ': [
    'Hidden does not mean far. It means you are not yet quiet enough.',
    'Win five debates and return with a listening heart.'
  ]
};

export const StoryIndex = { ...CoreStories, ...MidgameStories };

/**
 * B"H
 * @description Returns all story lines for a glyph.
 * @param {string} glyph Tile glyph.
 * @returns {string[]} Ordered story lines.
 */
export const storyLinesForGlyph = glyph => StoryIndex[glyph] || [];

/**
 * B"H
 * @description Backward-compatible random story lookup.
 * @param {string} glyph Tile glyph.
 * @returns {string|null} A story line or null.
 */
export const storyForGlyph = glyph => {
  const lines = storyLinesForGlyph(glyph);
  if (!lines.length) return null;
  return lines[Math.floor(Math.random() * lines.length)];
};
