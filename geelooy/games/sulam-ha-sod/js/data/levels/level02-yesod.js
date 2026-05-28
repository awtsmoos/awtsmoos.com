// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Level 2 turns mirror trust into a deliberate trap grammar.
 *
 * The Awtsmoos lets Yesod reflect a path that almost makes sense. The player
 * can pass by waiting for the vanish, using the rotor, and refusing the coin
 * line that points straight into falling spikes.
 */
export const level02 = L(
  '2 · Yesod Mirror Causeway',
  2600,
  { x: 60, y: 420 },
  P(2410, 210, 44, 90),
  'Yesod teaches timing: mirrored safety is often a lie.',
  [P(0, 505, 420, 35), P(520, 455, 130, 20), P(760, 405, 120, 20), P(980, 350, 120, 20), P(1220, 295, 130, 20), P(1480, 360, 160, 20), P(1730, 300, 140, 20), P(1980, 250, 150, 20), P(2250, 300, 140, 20)],
  [R(665, 432, 70, 14, -1.4, 260), R(1640, 337, 80, 14, 1.3, 300)],
  [T(900, 385, 70, 16, 'vanish', { reform: 1.8 }), T(1165, 332, 78, 16, 'phantom'), T(1405, 342, 82, 16, 'falseSpike'), T(1880, 280, 70, 16, 'shatter', { reform: 2.2 }), T(2170, 284, 82, 16, 'commitDrop', { reform: 2.4 })],
  [C(250, 460), C(560, 420), C(805, 370, 'dinar'), C(1020, 315), C(1260, 260, 'sela'), C(1770, 265), C(2290, 260, 'maneh')],
  [C(2060, 205, 'dinar')],
  [S(1360, 481, 70, 24, 1.7, 1.5, 3), S(2140, 481, 70, 24, 2.5, 1.2, 2.4)],
  [E(780, 371, 760, 875, 80, 'husk', 'mirror husk'), E(1530, 326, 1480, 1640, 105, 'watcher', 'first watching eye')],
  [
    G(1110, 250, 80, 100, 'A bridge fades when rushed.', { platforms: [P(1380, 250, 90, 18)] }),
    G(1510, 270, 95, 100, 'The reflected coin line calls down teeth.', { spikes: [{ x: 1605, y: 120, w: 68, h: 22, warning: 0.6, duration: 1.05, fallSpeed: 350, safe: 80 }, { x: 1685, y: 148, w: 70, h: 22, warning: 0.72, duration: 1.05, fallSpeed: 375, safe: 80 }, { x: 1768, y: 176, w: 72, h: 22, warning: 0.84, duration: 1.05, fallSpeed: 400, safe: 80 }] }),
    G(2200, 220, 100, 100, 'The mirror accepts your climb.', { openExit: true })
  ],
  ['Not every glowing floor remains loyal.', 'Patience creates safe timing.', 'A real-looking coin can be the mirror wearing a blade.'],
  { fakeCoins: [F(1325, 252, 'sela', 'The reflected sela was a spike.'), F(1845, 246, 'perutah', 'The ordinary coin split into teeth.')], trickCoins: [{ x: 1040, y: 315, kind: 'trapBait', baitX: 1385, speed: 190, min: 980, max: 1420 }] }
);
