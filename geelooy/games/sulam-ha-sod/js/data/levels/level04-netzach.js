// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Netzach is momentum with betrayal placed by hand.
 *
 * The Awtsmoos makes persistence holy only when it is awake. This garden now
 * punishes holding right across ice, because the safe-looking rungs include a
 * ghost shelf, a platform-spike, and a hidden falling curtain after commitment.
 */
export const level04 = L(
  '4 · Netzach Sliding Garden',
  3400,
  { x: 60, y: 420 },
  P(3220, 350, 44, 90),
  'Netzach teaches momentum: once you commit, the path keeps pulling.',
  [P(0, 505, 420, 35), P(560, 455, 140, 20), P(820, 405, 140, 20), P(1080, 360, 150, 20), P(1360, 420, 180, 20), P(1660, 360, 150, 20), P(1940, 305, 150, 20), P(2220, 380, 160, 20), P(2520, 320, 160, 20), P(2860, 420, 220, 20), P(3160, 440, 150, 20)],
  [R(720, 430, 70, 14, 1.4, 260), R(1840, 335, 80, 14, -1.7, 330)],
  [T(980, 390, 85, 16, 'ice', { duration: 0.95 }), T(1240, 345, 70, 16, 'phantom'), T(1500, 405, 82, 16, 'booster', { dir: 1, boost: 620, lift: 40 }), T(2100, 350, 78, 16, 'falseSpike'), T(2700, 300, 90, 16, 'ice', { duration: 1.05 }), T(1160, 340, 70, 16, 'falseSpike'), T(2400, 360, 75, 16, 'phantom'), T(3000, 404, 90, 16, 'commitDrop', { reform: 2.4 })],
  [C(260, 460), C(610, 415), C(860, 365, 'dinar'), C(1120, 320), C(1410, 380, 'sela'), C(1705, 320), C(1980, 265, 'dinar'), C(2560, 280), C(2920, 380, 'maneh')],
  [C(3040, 380, 'dinar')],
  [S(740, 481, 70, 24, 1.6, 1.2, 3), S(2320, 356, 70, 24, 2, 1.3, 3), S(3100, 481, 80, 24, 2.4, 1.2, 2.8), S(1760, 486, 65, 24, 1.4, 1.1, 2.4)],
  [E(1360, 386, 1320, 1460, 110, 'thief', 'garden thief'), E(2260, 346, 2220, 2380, 115, 'watcher', 'sliding eye')],
  [
    G(820, 330, 110, 100, 'Netzach: ice keeps the direction you chose.', { coins: [C(930, 350, 'dinar')] }),
    G(1480, 330, 120, 90, 'The gold arrow is a shove, not a suggestion.', {}),
    G(1900, 230, 110, 120, 'The garden ceiling falls if momentum becomes autopilot.', { spikes: [{ x: 2020, y: 120, w: 76, h: 24, warning: 0.65, duration: 1.2, fallSpeed: 420, safe: 88 }] }),
    G(2860, 320, 120, 110, 'Persistence opens the garden gate.', { openExit: true })
  ],
  ['Netzach is not speed; it is refusal to stop.', 'The first false platform looks honest on purpose.', 'The garden rewards braking before the ice finishes speaking.'],
  { fakeCoins: [F(2160, 310, 'sela', 'The garden coin was a thorn.'), F(2745, 260, 'dinar', 'The sliding reward was a hidden spike.')], trickCoins: [{ x: 1680, y: 320, kind: 'reverseRunner', speed: 300, min: 1620, max: 1860 }] }
);
