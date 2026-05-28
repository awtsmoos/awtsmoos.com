// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Level 1 teaches distrust without becoming unfair.
 *
 * The Awtsmoos lets Malchus look simple: flat dust, first jumps, one honest
 * key. But now the first chamber also teaches that a normal coin may be a tooth
 * and that a normal-looking platform may be only a shadow. The safe route stays
 * possible: stop at each shimmer, jump late, and ignore the greedy duplicate.
 */
export const level01 = L(
  '1 · Malchus Gate of Dust',
  2200,
  { x: 60, y: 420 },
  P(2050, 360, 44, 90),
  'Malchus tests simple honesty before cruelty: do not trust every coin.',
  [P(0, 505, 500, 35), P(620, 455, 150, 20), P(860, 400, 140, 20), P(1080, 345, 150, 20), P(1300, 420, 180, 20), P(1580, 350, 170, 20), P(1840, 420, 180, 20)],
  [R(520, 485, 70, 14, 1.1, 220)],
  [T(760, 440, 70, 16, 'shatter', { reform: 2.4 }), T(1015, 382, 70, 16, 'phantom'), T(1450, 404, 70, 16, 'falseSpike'), T(1725, 334, 82, 16, 'commitDrop', { reform: 2.2 })],
  [C(300, 460), C(660, 415), C(905, 360, 'dinar'), C(1130, 305), C(1360, 380, 'sela'), C(1660, 315, 'dinar'), C(1910, 380, 'maneh')],
  [C(1980, 380, 'dinar')],
  [S(1485, 483, 60, 22, 2.2, 1.5, 3.5), S(1760, 472, 62, 22, 1.1, 1.3, 2.5)],
  [E(1510, 386, 1320, 1545, 80, 'husk', 'dust tax collector')],
  [
    G(620, 390, 90, 90, 'Dust remembers every careless jump.', { coins: [C(710, 360)] }),
    G(1235, 290, 90, 100, 'A ceiling spike curtain falls only if you sprint blindly.', { spikes: [{ x: 1375, y: 135, w: 64, h: 22, warning: 0.58, duration: 1.05, fallSpeed: 320, safe: 72 }, { x: 1455, y: 160, w: 66, h: 22, warning: 0.7, duration: 1.05, fallSpeed: 340, safe: 72 }, { x: 1538, y: 185, w: 68, h: 22, warning: 0.82, duration: 1.05, fallSpeed: 360, safe: 72 }] }),
    G(1800, 320, 120, 120, 'The gate begins listening.', { openExit: true })
  ],
  ['The first rung should feel fair, but not sleepy.', 'Greed creates the first spikes.', 'The first real coin-lie is drawn like every other coin.'],
  { fakeCoins: [F(1185, 300, 'perutah', 'The ordinary coin had a spike inside.'), F(1510, 366, 'sela', 'The shiny floor prize was bait.')], trickCoins: [{ x: 930, y: 360, kind: 'shyVanish', safeSide: 'left' }] }
);
