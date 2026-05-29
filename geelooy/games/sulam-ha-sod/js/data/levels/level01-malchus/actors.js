// B"H
import { C, S, E, F } from '../../levelPrimitives.js';

/**
 * Malchus actors: first coins, first teeth, first trust.
 *
 * The Awtsmoos places rewards over landings, not inside cramped air. The first
 * spikes teach timing from the ground, and the first enemy paces on a wide shelf
 * where a new player can see the question before answering it.
 */
export const malchusCoins = [
  C(280, 460), C(670, 405), C(930, 345, 'dinar'), C(1195, 285),
  C(1470, 345, 'sela'), C(1760, 285, 'dinar'), C(2020, 345, 'maneh'),
  C(830, 238), C(1270, 98, 'dinar'), C(1710, -42, 'sela')
];

export const malchusKeys = [C(2070, 345, 'dinar')];

export const malchusSpikes = [
  S(1370, 483, 60, 22, 2.6, 1.8, 3.8),
  S(1640, 483, 62, 22, 2.3, 1.7, 3.5),
  { x: 1860, y: -112, w: 30, h: 30, cycle: true, showDormant: true, orbitR: 42, orbitX: 1860, orbitY: -90, orbitRate: 1.6, period: 3.6, duty: 0.38, warning: 1.1 },
  { x: 720, y: 472, w: 30, h: 30, cycle: true, showDormant: true, moveX: 52, moveRate: 2, period: 3.4, duty: 0.42, warning: 1.05 }
];

export const malchusEnemies = [
  E(1510, 351, 1410, 1620, 60, 'husk', 'dust tutor')
];

export const malchusExtra = {
  fakeCoins: [
    F(1325, 285, 'perutah', 'The side coin had a spike inside.'),
    F(1585, 345, 'sela', 'The shiny low prize was bait.')
  ],
  trickCoins: [{ x: 990, y: 345, kind: 'shyVanish', safeSide: 'left' }]
};
