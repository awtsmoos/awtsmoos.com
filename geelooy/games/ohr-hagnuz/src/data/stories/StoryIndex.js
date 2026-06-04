/**
 * B"H
 * @module StoryIndex
 * @description Ordered storyline dialogue for visible guides.
 *
 * Chapter 137: The village became a chapter book. The Awtsmoos has no body and
 * no form, yet a player enters through sequence: guide, home door, beis midrash,
 * sage, merchant, shepherd, trainer, gatekeeper, mekubal, hidden tzaddik. Each
 * NPC now has a longer path of speech so the world feels led instead of random.
 */
import { MidgameStories } from './StoryIndexMidgame.js';

const CoreStories = {
  'ג': [
    'Shalom, Ohr Chozer. I am the Village Guide. The hidden light scattered here is not lost; it is waiting for your steps.',
    'First, see the glowing letters above people. Face a guide and press Talk. Face a door, spark, book, or station and press Interact.',
    'Some doors sit in houses below the road; approach them from the grass side. If the box says no path, step around the wall and come from the doorway side.',
    'Your first task is simple: gather one spark א, then enter the Beis Midrash door ה to learn from a sefer.',
    'After learning, walk east to the Sage ס. He will ask for a source proven through debate.',
    'In debate you do not just press attack. Choose a category, then a route, then a chapter, then a quote. Each victory opens deeper routes.',
    'The road south has the Shepherd ש and Trainer ר. They teach sparks and battle practice. The Merchant נ teaches weighed words.',
    'When two wild musagim are sweetened, the Gatekeeper י will open the next widening of the world.',
    'Remember: the Awtsmoos has no body and no form, yet renews every tile every instant. Reveal the light inside the ordinary road.'
  ],
  'ס': [
    'A source is not a chain; it is a lamp. Bring me one debate victory and I will know your learning has entered action.',
    'When you choose Mishnah, open Avos, choose a chapter, and answer with a quote. That is how the light becomes precise.',
    'After one victory, return. I will mark your path toward deeper sources.'
  ],
  'נ': [
    'Words are coins of soul; do not spend them cheaply.',
    'Find lost parchment פ in the market roads. A merchant who counts words learns to count sparks.',
    'Between battles, open Journal. Your known Torah routes are written there.'
  ],
  'ש': [
    'The garden grows only what you give back to it.',
    'Gather three sparks א from the southern grass. Each spark is a little yes to creation.',
    'If the road is quiet, press Talk to review a learned route and recover a little light.'
  ],
  'ר': [
    'I am the trainer. A bland battle is a sleeping battle; awaken it with route, quote, and courage.',
    'Choose category first. Mishnah breaks confusion; Chassidus warms it; Kabbalah reframes it; Niggun heals it.',
    'Win debates to unlock new chapters and quotes. The quote is your actual strike.'
  ],
  'י': [
    'The river crosses the player, not the other way around.',
    'Sweeten two wild musagim, and the water will remember you.',
    'The world beyond opens only when your learned routes become lived routes.'
  ],
  'ק': [
    'Every cave is the inside of a letter.',
    'Bring me the parchment from the cave and I will show you the returning light.',
    'Ohr Chozer is the answer rising from below; do not fear questions.'
  ],
  'צ': [
    'Hidden does not mean far. It means you are not yet quiet enough.',
    'Win five debates and return with a listening heart.',
    'When the route, chapter, and quote become one breath, the hidden tzaddik is already speaking inside you.'
  ]
};

export const StoryIndex = { ...CoreStories, ...MidgameStories };
export const storyLinesForGlyph = glyph => StoryIndex[glyph] || [];
export const storyForGlyph = glyph => {
  const lines = storyLinesForGlyph(glyph);
  return lines.length ? lines[Math.floor(Math.random() * lines.length)] : null;
};
