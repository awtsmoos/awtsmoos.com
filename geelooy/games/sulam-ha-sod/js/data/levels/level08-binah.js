// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Binah hides floors inside understanding.
 *
 * The Awtsmoos teaches that structure can be absent. The player must test air,
 * brake after boosters, and distrust the lowest visible reward. The route is
 * possible by staying high through the phantom pair and waiting before the last
 * push.
 */
export const level08 = L(
  '8 · Binah Womb of Hidden Floors',
  5000,
  { x: 60, y: 420 },
  P(4780, 240, 44, 90),
  'Binah hides structure until you test it: absence has a shape.',
  [P(0, 505, 360, 35), P(520, 450, 130, 20), P(790, 390, 130, 20), P(1080, 330, 130, 20), P(1380, 270, 140, 20), P(1700, 340, 150, 20), P(2020, 410, 160, 20), P(2360, 350, 160, 20), P(2700, 290, 160, 20), P(3040, 230, 150, 20), P(3380, 305, 170, 20), P(3740, 380, 180, 20), P(4120, 320, 170, 20), P(4480, 290, 190, 20)],
  [R(675, 425, 80, 14, 2, 360), R(1850, 382, 80, 14, -2.2, 390), R(3240, 280, 90, 14, 2.6, 450)],
  [T(930, 374, 95, 16, 'phantom'), T(1240, 314, 80, 16, 'ice', { duration: 1.2 }), T(1540, 254, 85, 16, 'falseSpike'), T(1800, 324, 80, 16, 'falseSpike'), T(2200, 394, 90, 16, 'booster', { dir: 1, boost: 820, lift: 35 }), T(2580, 334, 86, 16, 'commitDrop', { reform: 2.4 }), T(2860, 274, 85, 16, 'vanish', { reform: 1.2 }), T(3200, 214, 80, 16, 'phantom'), T(3600, 360, 90, 16, 'ice', { duration: 1.35 }), T(4300, 304, 95, 16, 'booster', { dir: 1, boost: 880, lift: 20 })],
  [C(260, 460), C(560, 410), C(830, 350, 'dinar'), C(1120, 290), C(1420, 230, 'sela'), C(1740, 300), C(2060, 370, 'dinar'), C(2400, 310), C(2740, 250, 'sela'), C(3080, 190), C(3420, 265, 'dinar'), C(4160, 280), C(4520, 250, 'maneh')],
  [C(4620, 250, 'dinar')],
  [S(410, 481, 80, 24, 1.3, 1.1, 2.4), S(1620, 481, 80, 24, 1.7, 1.1, 2.7), S(2520, 481, 90, 24, 2.1, 1.2, 2.6), S(3320, 481, 90, 24, 2.4, 1.2, 2.5), S(4420, 481, 90, 24, 2.8, 1.1, 2.4), S(3860, 486, 80, 24, 1.2, 1, 2.2)],
  [E(2380, 316, 2360, 2510, 115, 'gravity', 'understanding beast'), E(4140, 286, 4080, 4300, 120, 'watcher', 'hidden watcher')],
  [
    G(920, 310, 120, 110, 'Binah shows a floor that was never there.', {}),
    G(2180, 330, 130, 100, 'The next push is aimed at a spike gap. Jump late.', {}),
    G(3340, 250, 110, 120, 'The absent floor calls down a visible ceiling.', { spikes: [{ x: 3460, y: 120, w: 72, h: 24, warning: 0.62, duration: 1.15, fallSpeed: 395 }, { x: 3542, y: 148, w: 76, h: 24, warning: 0.76, duration: 1.15, fallSpeed: 425 }, { x: 3630, y: 176, w: 80, h: 24, warning: 0.9, duration: 1.15, fallSpeed: 455 }] }),
    G(4300, 250, 130, 120, 'Understanding becomes a door.', { openExit: true })
  ],
  ['Binah makes absence visible.', 'Phantom floors teach distrust without clutter.', 'The real path is the high thought, not the low coin line.'],
  { fakeCoins: [F(1580, 215, 'sela', 'Binah asked: was that coin born yet?'), F(3650, 320, 'dinar', 'The hidden coin bit back.'), F(4210, 280, 'maneh', 'The visible reward was unborn teeth.')], trickCoins: [{ x: 2420, y: 310, kind: 'shyVanish', safeSide: 'left' }, { x: 3440, y: 265, kind: 'reverseRunner', speed: 340, min: 3380, max: 3700 }] }
);
