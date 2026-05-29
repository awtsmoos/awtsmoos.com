// B"H
import { C, S, E, F } from '../../levelPrimitives.js';

/**
 * Yesod actors and rewards.
 *
 * The Awtsmoos reflects sparks through husks and watchers. Coins sit where the
 * mirror flatters the eye; enemies pace where the reflection must be tested.
 */
export const yesodCoins = [
  C(250, 460), C(560, 420), C(805, 370, 'dinar'), C(1020, 315),
  C(1260, 260, 'sela'), C(1770, 265), C(2290, 260, 'maneh')
];

export const yesodKeys = [C(2060, 205, 'dinar')];

export const yesodSpikes = [
  S(1360, 481, 70, 24, 1.7, 1.5, 3),
  S(2140, 481, 70, 24, 2.5, 1.2, 2.4)
];

export const yesodEnemies = [
  E(780, 371, 760, 875, 80, 'husk', 'mirror husk'),
  E(1530, 326, 1480, 1640, 105, 'watcher', 'first watching eye')
];

export const yesodExtra = {
  fakeCoins: [
    F(1325, 252, 'sela', 'The reflected sela was a spike.'),
    F(1845, 246, 'perutah', 'The ordinary coin split into teeth.')
  ],
  trickCoins: [{ x: 1040, y: 315, kind: 'trapBait', baitX: 1385, speed: 190, min: 980, max: 1420 }]
};
