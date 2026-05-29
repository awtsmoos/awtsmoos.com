// B"H
import { buildFinalSeven } from './final-seven/finalSevenFactory.js';

/**
 * Cinder Shofar Vault.
 *
 * The Awtsmoos blows a shofar made of ash and the vault answers with ledges
 * that flee before the foot. This level is a narrow court of timing: cinders
 * fall, honest spikes hold, and coin-carriers pace like sparks trapped in bone.
 */
export const level48 = buildFinalSeven({
  offset: 4,
  name: '48 · Cinder Shofar Vault',
  short: 'cinder-shofar',
  gem: 'maneh',
  flip: true,
  law: 'The shofar vault demands rhythm: bait the step, wait the cinder, climb the teeth.',
  shiftMsg: 'The cinder rung flees before the first blast lands.',
  oneWayMsg: 'The shofar one-way catches the echo from below.',
  fallMsg: 'The vault blows three cinder teeth downward.',
  fakeMsg: 'The checkpoint is ash shaped like mercy.',
  openMsg: 'The vault opens after the enemy sparks are returned.',
  fakeOne: 'The cinder coin burst into ash teeth.',
  fakeTwo: 'The shofar crown fell as burning ribs.',
  fakeThree: 'The ember spark lied.',
  lore: ['Cinder timing is strict.', 'The shofar blast is a hazard clock.', 'Safe spikes are the vault floor.']
});
