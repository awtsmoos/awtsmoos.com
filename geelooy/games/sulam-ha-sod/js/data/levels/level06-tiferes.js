// B"H
import { P, C, F, S, E, R, T, G, L } from '../levelPrimitives.js';

/**
 * Tiferes: balance sharpened by visible deception.
 *
 * Chapter 20: The Awtsmoos removed cramped prism shelves and let symmetry
 * breathe. Beauty is not a ceiling pressing down on the climber; beauty is a
 * clean route where every true ledge has air and every fractured reflection is
 * visibly false. The prism remains fast, flat, readable, and fair.
 */
export const level06 = L(
  '6 · Tiferes Balance Prism', 4300, { x: 60, y: 420 }, P(4020, 300, 44, 90),
  'Tiferes balances beauty against betrayal: read rims, distrust hollow shine.',
  [
    P(0, 505, 560, 35), P(640, 455, 245, 22), P(1000, 405, 235, 22),
    P(1370, 355, 225, 22), P(1740, 305, 215, 22), P(2120, 355, 215, 22),
    P(2500, 405, 215, 22), P(2880, 355, 215, 22), P(3260, 305, 215, 22),
    P(3640, 300, 330, 22)
  ],
  [R(570, 480, 92, 14, 0.62, 120), R(2080, 330, 96, 14, -0.62, 120), R(3480, 282, 90, 14, 0.58, 115)],
  [
    T(900, 438, 95, 16, 'phantom'), T(850, 439, 96, 16, 'oneWay'),
    T(1260, 388, 98, 16, 'ghostSpike'), T(1665, 288, 90, 16, 'phantom'),
    T(2430, 389, 96, 16, 'oneWay'), T(2760, 388, 100, 16, 'falseSpike'),
    T(3580, 284, 110, 16, 'oneWay')
  ],
  [
    C(250, 460), C(700, 415), C(1060, 365, 'dinar'), C(1430, 315),
    C(1810, 265, 'sela'), C(2190, 315), C(2570, 365, 'dinar'),
    C(2950, 315), C(3330, 265, 'sela'), C(3700, 260, 'maneh')
  ],
  [C(3820, 260, 'dinar')],
  [S(520, 483, 52, 22, 2.8, 1.2, 4.4), S(1265, 483, 85, 25, 1.1, 1.0, 2.2), S(2460, 483, 52, 22, 3.0, 1.2, 4.5), S(2765, 483, 92, 25, 1.3, 1.0, 2.4)],
  [E(1450, 321, 1390, 1660, 62, 'husk', 'balance echo'), E(2960, 321, 2900, 3180, 64, 'scroll', 'prism scroll')],
  [
    G(1000, 350, 140, 100, 'Tiferes: the centered path is real; mirrored glitter lies.', {}),
    G(3250, 255, 140, 110, 'The door asks for all real coins, not bait.', { openExit: true })
  ],
  ['Tiferes is readable beauty.', 'Fake coin trails hang above hollow rungs.', 'Balance now means seeing the top rim.'],
  { fakeCoins: [F(910, 398), F(1268, 350, 'dinar'), F(1690, 250, 'sela'), F(2768, 350, 'dinar')], trickCoins: [] }
);
