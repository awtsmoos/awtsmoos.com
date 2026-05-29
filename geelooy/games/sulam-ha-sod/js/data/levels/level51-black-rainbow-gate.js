// B"H
import { buildFinalSeven } from './final-seven/finalSevenFactory.js';

/**
 * Black Rainbow Gate.
 *
 * The Awtsmoos bends black rainbows through the final gate of this expansion.
 * The colors do not comfort; they cut. Every bridge is suspicious, every spike
 * may be footing, and the door opens only after the whole route is remembered.
 */
export const level51 = buildFinalSeven({
  offset: 7,
  name: '51 · Black Rainbow Gate',
  short: 'black-rainbow',
  gem: 'maneh',
  flip: false,
  law: 'The black rainbow is the last new gate: every color lies except the learned one.',
  shiftMsg: 'The black rainbow bridge bends away from the first landing.',
  oneWayMsg: 'The rainbow one-way receives only a falling vessel.',
  fallMsg: 'Three black rainbow teeth split the sky.',
  fakeMsg: 'The checkpoint is a color painted on absence.',
  openMsg: 'The black rainbow opens when every carrier yields its hidden color.',
  fakeOne: 'The rainbow coin became a black tooth.',
  fakeTwo: 'The dark crown fell through color.',
  fakeThree: 'The final color-spark lied.',
  lore: ['Black rainbow means every color has teeth.', 'The final new bridge must be baited.', 'The Awtsmoos makes the last lie readable.']
});
