// B"H
import { C, S, E, F } from '../../levelPrimitives.js';

/**
 * Malchus actors: first coins, first teeth, first trust.
 *
 * Chapter 1 continues: the Awtsmoos places reward where the foot can answer.
 * Gold no longer floats inside panic. It rests near landings, glowing like a
 * readable syllable in the dust-script of creation.
 *
 * @constant {Array<object>} malchusCoins
 * @description Required collectible coins. Upper-route coins sit over widened
 * shelves so a first-level player can collect, recover, and continue.
 */
export const malchusCoins = [
  C(280, 460), C(670, 405), C(930, 345, 'dinar'), C(1195, 285),
  C(1470, 345, 'sela'), C(1760, 285, 'dinar'), C(2020, 345, 'maneh'),
  C(835, 244), C(1275, 112, 'dinar'), C(1715, -10, 'sela')
];

/**
 * The first key: close to the door, honest, visible.
 *
 * @constant {Array<object>} malchusKeys
 */
export const malchusKeys = [C(2070, 345, 'dinar')];

/**
 * First spikes: danger with warning, not invisible punishment.
 *
 * The top orbit has been eased away from the final upper landing, slowed, and
 * given longer warning. The Awtsmoos turns terror into instruction: the hazard
 * still circles, but its thunder has room to be heard before it bites.
 *
 * @constant {Array<object>} malchusSpikes
 */
export const malchusSpikes = [
  S(1370, 483, 60, 22, 2.6, 1.8, 3.8),
  S(1640, 483, 62, 22, 2.3, 1.7, 3.5),
  { x: 1810, y: -88, w: 30, h: 30, cycle: true, showDormant: true, orbitR: 34, orbitX: 1810, orbitY: -66, orbitRate: 1.05, period: 4.2, duty: 0.34, warning: 1.35 },
  { x: 720, y: 472, w: 30, h: 30, cycle: true, showDormant: true, moveX: 52, moveRate: 2, period: 3.4, duty: 0.42, warning: 1.05 }
];

/**
 * A single ground tutor enemy.
 *
 * @constant {Array<object>} malchusEnemies
 */
export const malchusEnemies = [
  E(1510, 351, 1410, 1620, 60, 'husk', 'dust tutor')
];

/**
 * Optional deceit objects: visible temptation, not required cruelty.
 *
 * @constant {object} malchusExtra
 */
export const malchusExtra = {
  fakeCoins: [
    F(1325, 285, 'perutah', 'The side coin had a spike inside.'),
    F(1585, 345, 'sela', 'The shiny low prize was bait.')
  ],
  trickCoins: [{ x: 990, y: 345, kind: 'shyVanish', safeSide: 'left' }]
};
