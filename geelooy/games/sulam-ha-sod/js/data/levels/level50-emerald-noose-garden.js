// B"H
import { buildFinalSeven } from './final-seven/finalSevenFactory.js';

/**
 * Emerald Noose Garden.
 *
 * The Awtsmoos grows emerald vines into loops of judgment. The garden looks
 * alive, but each leaf is a timing contract. Stand on the honest spike, bait
 * the moving rung, and take the coins from enemies before the noose tightens.
 */
export const level50 = buildFinalSeven({
  offset: 6,
  name: '50 · Emerald Noose Garden',
  short: 'emerald-noose',
  gem: 'maneh',
  flip: true,
  law: 'The garden tightens around habit. Pause, reverse, and step on forbidden teeth.',
  shiftMsg: 'The emerald rung slips aside like a living noose.',
  oneWayMsg: 'The vine one-way catches only descent.',
  fallMsg: 'Three emerald teeth fall from the hanging garden.',
  fakeMsg: 'The checkpoint is a leaf-shaped lie.',
  openMsg: 'The garden opens after each carrier drops its hidden seed.',
  fakeOne: 'The garden coin snapped like a vine.',
  fakeTwo: 'The emerald crown fell green and sharp.',
  fakeThree: 'The leaf-spark lied.',
  lore: ['The garden is beautiful because it is dangerous.', 'Safe spikes are emerald roots.', 'Every carrier holds a seed of the door.']
});
