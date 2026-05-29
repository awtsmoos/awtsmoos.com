// B"H
import { buildFinalSeven } from './final-seven/finalSevenFactory.js';

/**
 * Blue Fire Beis Din.
 *
 * The Awtsmoos convenes blue fire as a court where every platform testifies.
 * The ruling is savage and exact: bait the moving rung, step on the honest
 * teeth, and empty the enemy carriers before the door recognizes your name.
 */
export const level45 = buildFinalSeven({
  offset: 1,
  name: '45 · Blue Fire Beis Din',
  short: 'blue-fire',
  gem: 'sela',
  flip: false,
  law: 'Blue fire judges speed. The bridge that looks lethal may be your only witness.',
  shiftMsg: 'The blue court moves the rung before the verdict lands.',
  oneWayMsg: 'The one-way flame accepts only descent.',
  fallMsg: 'Blue fire hardens into three falling teeth.',
  fakeMsg: 'The checkpoint is a painted witness.',
  openMsg: 'The blue court opens after every carrier gives back the hidden coin.',
  fakeOne: 'The blue coin burned into teeth.',
  fakeTwo: 'The fire crown fell as judgment.',
  fakeThree: 'The quiet flame lied.',
  lore: ['Blue fire is readable, but never kind.', 'The safe spike bridge glows like a verdict.', 'A bait platform must be watched before trusted.']
});
