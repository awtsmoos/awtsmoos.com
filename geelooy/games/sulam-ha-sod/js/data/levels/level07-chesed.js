// B"H
import { P, C, F, S, E, R, T, G, L } from '../levelPrimitives.js';

/**
 * Chesed: overflowing kindness with treacherous excess.
 *
 * Chapter 7: The Awtsmoos poured rivers of green light through the cistern, and
 * the water itself became a question. Real blessings stand on broad banks. Fake
 * blessings float over transparent generosity, teaching that not every overflow
 * is a path and not every shine is mercy.
 */
export const level07 = L(
  '7 · Chesed Flood of Glass', 4700, { x: 60, y: 420 }, P(4440, 300, 44, 90),
  'Chesed overflows; follow the broad stream and ignore coins over glass lies.',
  [
    P(0, 505, 580, 35), P(680, 455, 265, 22), P(1070, 405, 250, 22),
    P(1460, 355, 240, 22), P(1850, 305, 230, 22), P(2240, 355, 230, 22),
    P(2630, 405, 230, 22), P(3020, 355, 230, 22), P(3410, 305, 230, 22),
    P(3800, 345, 270, 22), P(4200, 300, 300, 22), P(1580, 280, 165, 18),
    P(3160, 280, 165, 18)
  ],
  [R(600, 480, 92, 14, 0.58, 115), R(2200, 330, 96, 14, -0.62, 120), R(3760, 320, 96, 14, 0.6, 115)],
  [
    T(950, 438, 100, 16, 'phantom'), T(985, 439, 104, 16, 'oneWay'),
    T(1330, 388, 100, 16, 'ghostSpike'), T(1760, 288, 100, 16, 'phantom'),
    T(2170, 339, 104, 16, 'oneWay'), T(2580, 388, 104, 16, 'falseSpike'),
    T(3730, 289, 110, 16, 'oneWay'), T(4070, 318, 105, 16, 'phantom')
  ],
  [
    C(260, 460), C(750, 415), C(1140, 365, 'dinar'), C(1530, 315),
    C(1920, 265, 'sela'), C(2310, 315), C(2700, 365, 'dinar'),
    C(3090, 315), C(3480, 265, 'sela'), C(3870, 305), C(4260, 260, 'maneh')
  ],
  [C(4310, 260, 'dinar')],
  [S(600, 483, 48, 22, 2.9, 1.2, 4.5), S(1335, 483, 92, 25, 1.2, 1.0, 2.3), S(2585, 483, 95, 25, 1.4, 1.0, 2.5), S(2940, 483, 48, 22, 3.0, 1.2, 4.6)],
  [E(1540, 321, 1480, 1720, 64, 'husk', 'kind echo'), E(3890, 311, 3810, 4070, 66, 'scroll', 'glass scroll')],
  [
    G(1080, 350, 140, 100, 'Chesed gives too much; the fake river has no bank.', {}),
    G(3900, 290, 150, 110, 'The real blessing settles into the door.', { openExit: true })
  ],
  ['Chesed gives enough ground to learn.', 'Fake coins mark the flood that cannot hold you.', 'Mercy is generous, not blind.'],
  { fakeCoins: [F(955, 398), F(1338, 350, 'dinar'), F(1780, 250, 'sela'), F(2588, 350, 'dinar'), F(4085, 280, 'maneh')], trickCoins: [] }
);
