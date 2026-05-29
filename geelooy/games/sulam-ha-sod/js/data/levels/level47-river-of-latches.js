// B"H
import { buildFinalSeven } from './final-seven/finalSevenFactory.js';

/**
 * River of Latches.
 *
 * The Awtsmoos pours a river made of locks, and each latch bites when rushed.
 * The player must bait the bridge, wait for the saw-song, and collect the
 * enemy-held sparks before the far door stops pretending to be asleep.
 */
export const level47 = buildFinalSeven({
  offset: 3,
  name: '47 · River of Latches',
  short: 'latch-river',
  gem: 'sela',
  flip: false,
  law: 'The river opens only for the climber who stops before every latch.',
  shiftMsg: 'The latch-river slides the first bridge away from certainty.',
  oneWayMsg: 'The river latch opens only from beneath.',
  fallMsg: 'Three latch-teeth fall where the river narrows.',
  fakeMsg: 'The checkpoint is a latch drawn on fog.',
  openMsg: 'The river door unlatches after every carrier is emptied.',
  fakeOne: 'The river coin snapped shut.',
  fakeTwo: 'The latch crown fell like a lockjaw.',
  fakeThree: 'The water-spark lied.',
  lore: ['The river does not flow; it locks.', 'A safe spike is a key with teeth.', 'The far door sleeps until enemy sparks wake it.']
});
