// B"H
import { L, P, C, S, E, R, T, G } from '../levelKit.js';

/**
 * Chapter 6: Tiferes balances beauty by giving the player enough ground to
 * breathe. The Awtsmoos keeps both sides dangerous, but the middle no longer
 * demands needle-perfect landings before the lesson has time to shine.
 */
export default L('06 - - - - · Tiferes Balance Over the Abyss', 4550, { x: 50, y: 390 }, P(4350, 170, 44, 92), 'Tiferes balances beauty by making both paths dangerous.',
  [P(0, 505, 300, 40), P(360, 455, 150, 22), P(620, 390, 150, 22), P(900, 325, 150, 22), P(1190, 260, 150, 22), P(1480, 195, 150, 22), P(1770, 260, 150, 22), P(2060, 325, 150, 22), P(2350, 390, 155, 22), P(2660, 330, 165, 22), P(2980, 270, 165, 22), P(3300, 210, 165, 22), P(3660, 285, 300, 24), P(4050, 250, 220, 22)],
  [R(500, 430, 75, 16, 2.0, 380), R(1050, 300, 75, 16, -2.2, 420), R(1630, 220, 75, 16, 2.1, 410), R(2520, 360, 80, 16, -2.1, 420), R(3480, 245, 90, 16, 2.0, 410)],
  [T(760, 360, 80, 18, 'vanish', { reform: 1.25 }), T(1330, 235, 80, 18, 'shatter', { reform: 1.6 }), T(1910, 295, 80, 18, 'ambush', { range: 115, jump: 115 }), T(2820, 300, 82, 18, 'vanish', { reform: 1.25 }), T(3160, 240, 82, 18, 'shatter', { reform: 1.6 }), T(3920, 260, 86, 18, 'ambush', { range: 120, jump: 120 })],
  [C(390, 415, 'dinar'), C(650, 350), C(930, 285, 'sela'), C(1220, 220), C(1510, 155, 'dinar'), C(1800, 220), C(2090, 285, 'sela'), C(2380, 350), C(2690, 290, 'dinar'), C(3010, 230), C(3330, 170, 'sela'), C(3730, 245, 'maneh')],
  [C(1505, 155)],
  [S(285, 475, 75, 28, 1.0, 1.0, 2.4), S(840, 306, 72, 26, 1.4, 1.1, 2.6), S(1400, 473, 92, 30, 1.8, 1.0, 2.8), S(2140, 473, 96, 30, 2.2, 1.0, 3.0), S(2890, 473, 100, 30, 2.6, 1.0, 3.2), S(3600, 473, 108, 30, 3.0, 1.0, 3.4)],
  [E(630, 356, 620, 740, 150, 'gilgul', 'balanced echo'), E(1780, 226, 1770, 1890, 160, 'scroll', 'beauty objection'), E(2990, 236, 2980, 3120, 170, 'gravity', 'harmony flipper')],
  [
    G(880, 250, 120, 140, 'Tiferes offers two beautiful lies. One pays in spikes.', { spikes: [S(1030, 473, 110, 30, 0.8, 0.8, 1.8)] }),
    G(2060, 250, 130, 150, 'The middle path appears because you resisted both extremes.', { platforms: [P(2190, 285, 140, 18), P(2340, 270, 120, 18)] }),
    G(3450, 150, 110, 150, 'Beauty signs the gate with a hidden key of light.', { keys: [C(3560, 120)], coins: [C(3500, 110, 'maneh')] }),
    G(4020, 180, 120, 150, 'Tiferes opens only when the two sides stop arguing.', { openExit: true })
  ]);
