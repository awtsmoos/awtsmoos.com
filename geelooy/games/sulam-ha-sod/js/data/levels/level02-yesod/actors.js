// B"H
import { C, S, E, F } from '../../levelPrimitives.js';

/**
 * Yesod actors: mirrors with space around them.
 *
 * Chapter 2 continues: the Awtsmoos lets reflected coins tempt the eye, yet the
 * real rewards now hover above breathable landings. The upper orbit still sings
 * danger, but slower, farther, and loud enough to be understood.
 */
export const yesodCoins = [
  C(250, 460), C(625, 410), C(875, 355, 'dinar'), C(1135, 300),
  C(1395, 245, 'sela'), C(1670, 305), C(1935, 250, 'dinar'),
  C(2215, 195), C(2405, 255, 'maneh'), C(825, 244), C(1275, 112, 'sela'),
  C(1720, -10, 'dinar')
];

export const yesodKeys = [C(2225, 190, 'dinar')];

export const yesodSpikes = [
  S(1295, 481, 66, 22, 2.1, 1.5, 3.4),
  S(2115, 481, 70, 22, 2.7, 1.4, 3.2),
  { x: 720, y: 472, w: 30, h: 30, cycle: true, showDormant: true, moveX: 58, moveRate: 2.1, period: 3.4, duty: 0.42, warning: 1.05 },
  { x: 2035, y: -142, w: 30, h: 30, cycle: true, showDormant: true, orbitR: 36, orbitX: 2035, orbitY: -118, orbitRate: -1.05, period: 4.2, duty: 0.34, warning: 1.35 }
];

export const yesodEnemies = [
  E(870, 361, 830, 1010, 70, 'husk', 'mirror husk'),
  E(1660, 311, 1610, 1810, 85, 'watcher', 'watching reflection')
];

export const yesodExtra = {
  fakeCoins: [
    F(1325, 245, 'sela', 'The reflected sela was a spike.'),
    F(2050, 250, 'perutah', 'The ordinary coin split into teeth.')
  ],
  trickCoins: [{ x: 1145, y: 300, kind: 'trapBait', baitX: 1360, speed: 180, min: 1080, max: 1420 }]
};
