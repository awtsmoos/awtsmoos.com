/** B"H @module StoryIndex */
import { MidgameStories } from './StoryIndexMidgame.js';
import { RambamStories } from './StoryIndexRambam.js';
const CoreStories = {
  'ג': ['Shalom, Ohr Chozer. The hidden light is waiting for your steps.', 'First gather a spark. Then walk east: the Garden of Ungiven Things is open.', 'The final words are not victory words. They are: I removed, I gave, I did not forget.'],
  'ס': ['A source is not a chain; it is a lamp. Bring one debate victory.'],
  'נ': ['Words are coins of soul; do not spend them cheaply.', 'Beware the Merchant of Exchange, who prices what must be given.'],
  'ש': ['The garden grows only what you give back to it.'],
  'ר': ['A bland battle is asleep. Wake it with route, chapter, and quote.'],
  'י': ['The river crosses the player, not the other way around.'],
  'ק': ['Every cave is the inside of a letter.'],
  'צ': ['Hidden does not mean far. It means you are not yet quiet enough.']
};
export const StoryIndex = { ...CoreStories, ...MidgameStories, ...RambamStories };
export const storyLinesForGlyph = glyph => StoryIndex[glyph] || [];
export const storyForGlyph = glyph => { const lines = storyLinesForGlyph(glyph); return lines.length ? lines[Math.floor(Math.random() * lines.length)] : null; };
