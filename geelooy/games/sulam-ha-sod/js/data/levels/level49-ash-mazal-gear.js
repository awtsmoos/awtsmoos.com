// B"H
import { buildFinalSeven } from './final-seven/finalSevenFactory.js';

/**
 * Ash Mazal Gear.
 *
 * The Awtsmoos turns luck into machinery and machinery into ash. This chamber
 * grinds impatience: gears rotate, bait rungs flee, and the required coins hide
 * inside enemies that pace between safe-spike bridges and false gold.
 */
export const level49 = buildFinalSeven({
  offset: 5,
  name: '49 · Ash Mazal Gear',
  short: 'ash-gear',
  gem: 'sela',
  flip: false,
  law: 'Mazal is not luck here. It is timing, teeth, and memory.',
  shiftMsg: 'The ash gear pulls the bridge out of the first jump.',
  oneWayMsg: 'The gear one-way turns only after a falling step.',
  fallMsg: 'Three ash gears drop as teeth.',
  fakeMsg: 'The checkpoint is a gear painted on smoke.',
  openMsg: 'The gear gate opens when all carried sparks are paid.',
  fakeOne: 'The ash coin became a grinding tooth.',
  fakeTwo: 'The mazal crown fell into the gearwork.',
  fakeThree: 'The gray spark lied.',
  lore: ['Ash remembers pressure.', 'The gear route must be watched, not rushed.', 'A spike bridge is the axle of truth.']
});
