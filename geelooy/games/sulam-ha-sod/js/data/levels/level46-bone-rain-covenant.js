// B"H
import { buildFinalSeven } from './final-seven/finalSevenFactory.js';

/**
 * Bone Rain Covenant.
 *
 * The Awtsmoos lets white rain fall upward through bone-colored sky. The level
 * is a covenant of memorized betrayal: platforms flee, teeth become walkable,
 * and the door refuses every shortcut that was not earned through returning.
 */
export const level46 = buildFinalSeven({
  offset: 2,
  name: '46 · Bone Rain Covenant',
  short: 'bone-rain',
  gem: 'maneh',
  flip: true,
  law: 'Bone rain makes the obvious path brittle. Bait the rung, then step where fear says no.',
  shiftMsg: 'Bone rain pulls the platform away from the first greedy landing.',
  oneWayMsg: 'The ribbed one-way step catches only a falling answer.',
  fallMsg: 'The covenant rains three white teeth from the ceiling.',
  fakeMsg: 'The checkpoint is bone dust wearing paint.',
  openMsg: 'The covenant opens only after the walking debts are broken.',
  fakeOne: 'The bone coin cracked into teeth.',
  fakeTwo: 'The rain crown became falling ribs.',
  fakeThree: 'The pale spark lied softly.',
  lore: ['Bone rain has rhythm.', 'The first jump is a question, the second is the answer.', 'Safe spikes are covenant stones.']
});
