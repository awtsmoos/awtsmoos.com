// B"H
import { P, C, S, E, R, T, G, L } from '../levelPrimitives.js';

/**
 * Chochmah: fast, but fair.
 *
 * Chapter 9: The Awtsmoos made wisdom flash without becoming a blind cliff.
 * The route is longer and quicker than the earlier chambers, yet each leap has
 * a named landing, every coin is on the visible chain, and the final key stands
 * before the door like a clear spark instead of a cruel rumor.
 */
export const level09 = L(
  '9 · Chochmah Flash Run',
  5500,
  { x: 60, y: 420 },
  P(5220, 260, 44, 90),
  'Chochmah is quick insight: move with courage, but the line stays visible.',
  [
    P(0, 505, 610, 35), P(720, 455, 310, 22), P(1120, 405, 315, 22),
    P(1520, 355, 320, 22), P(1920, 305, 325, 22), P(2320, 355, 325, 22),
    P(2720, 405, 325, 22), P(3120, 355, 325, 22), P(3520, 305, 325, 22),
    P(3920, 245, 330, 22), P(4330, 285, 330, 22), P(4740, 260, 330, 22),
    P(5100, 260, 200, 22), P(840, 330, 190, 18), P(1660, 280, 200, 18),
    P(2480, 330, 200, 18), P(3300, 280, 200, 18), P(4540, 240, 200, 18)
  ],
  [R(640, 480, 94, 14, 0.32, 90), R(2280, 330, 98, 14, -0.32, 90), R(3900, 280, 98, 14, 0.32, 90)],
  [
    T(1030, 439, 104, 16, 'oneWay'), T(2240, 339, 104, 16, 'oneWay'),
    T(3845, 289, 110, 16, 'oneWay'), T(4665, 269, 110, 16, 'oneWay')
  ],
  [
    C(280, 460), C(790, 415), C(1190, 365, 'dinar'), C(1590, 315),
    C(1990, 265, 'sela'), C(2390, 315), C(2790, 365, 'dinar'),
    C(3190, 315), C(3590, 265, 'sela'), C(3990, 205), C(4400, 245),
    C(4810, 220), C(5140, 220, 'maneh')
  ],
  [C(5165, 220, 'dinar')],
  [S(620, 483, 48, 22, 3.0, 1.2, 4.6), S(3020, 483, 48, 22, 3.2, 1.2, 4.8), S(4700, 483, 48, 22, 3.3, 1.2, 4.9)],
  [E(1590, 321, 1520, 1790, 46, 'ayin', 'flash eye'), E(4400, 251, 4330, 4610, 50, 'scroll', 'wisdom scroll')],
  [
    G(1120, 350, 150, 100, 'Chochmah runs fast, but not blind.', {}),
    G(4740, 235, 150, 110, 'The final flash is a platform, not a guess.', { openExit: true })
  ],
  ['Chochmah is the joy of no hesitation.', 'Speed is allowed only when the landing is honest.', 'The final insight is possible.'],
  { fakeCoins: [], trickCoins: [] }
);
