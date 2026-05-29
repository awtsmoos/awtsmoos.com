// B"H
import { L, P, C, S, E, R, T, G } from '../levelKit.js';

/**
 * Chapter 7: Chesed overflows, but the Awtsmoos gives the flood banks. The
 * cistern still gives too much and asks for discipline, yet wider shelves and
 * calmer machinery let the player learn generosity without drowning instantly.
 */
export default L('07 - - - - · Chesed Overflow Cistern', 4900, { x: 45, y: 390 }, P(4680, 210, 44, 92), 'Chesed gives too much, then asks where you put it.',
  [P(0, 505, 310, 40), P(380, 455, 155, 22), P(660, 405, 155, 22), P(960, 355, 155, 22), P(1260, 305, 155, 22), P(1560, 255, 155, 22), P(1880, 320, 165, 22), P(2200, 385, 165, 22), P(2520, 330, 165, 22), P(2850, 275, 165, 22), P(3180, 220, 165, 22), P(3520, 285, 165, 22), P(3890, 350, 285, 24), P(4230, 300, 205, 24), P(4520, 285, 170, 22)],
  [R(540, 430, 80, 16, 1.9, 370), R(1100, 330, 80, 16, -2.2, 420), R(1740, 275, 80, 16, 2.3, 430), R(2380, 360, 85, 16, -2.4, 440), R(3360, 250, 90, 16, 2.2, 430)],
  [T(810, 380, 82, 18, 'ambush', { range: 115, jump: 110 }), T(1420, 280, 82, 18, 'vanish', { reform: 1.25 }), T(2030, 350, 82, 18, 'shatter', { reform: 1.6 }), T(2700, 305, 82, 18, 'ambush', { range: 115, jump: 120 }), T(3700, 320, 88, 18, 'vanish', { reform: 1.2 }), T(4380, 270, 84, 18, 'shatter', { reform: 1.6 })],
  [C(410, 415), C(690, 365, 'dinar'), C(990, 315), C(1290, 265, 'sela'), C(1590, 215), C(1910, 280, 'dinar'), C(2230, 345), C(2550, 290, 'sela'), C(2880, 235), C(3210, 180, 'dinar'), C(3550, 245), C(3930, 310, 'sela'), C(4270, 260, 'maneh')],
  [C(3210, 180)],
  [S(300, 473, 78, 30, 1.0, 1.0, 2.4), S(920, 473, 90, 30, 1.4, 1.0, 2.7), S(1480, 473, 94, 30, 1.8, 1.0, 2.9), S(2140, 473, 98, 30, 2.2, 1.0, 3.1), S(2840, 473, 104, 30, 2.6, 1.0, 3.3), S(3660, 473, 112, 30, 3.0, 1.0, 3.5)],
  [E(970, 321, 960, 1090, 155, 'thief', 'overflow collector'), E(1890, 286, 1880, 2020, 165, 'ayin', 'kindness watcher'), E(3185, 186, 3180, 3320, 175, 'gilgul', 'generous slime')],
  [
    G(620, 320, 130, 150, 'Chesed overflows: coins appear, and so do thieves.', { coins: [C(760, 340, 'dinar'), C(790, 320, 'sela')], enemies: [E(820, 371, 790, 910, 150, 'thief', 'charity auditor')] }),
    G(1760, 210, 130, 170, 'Too much kindness becomes stepping stones over nothing.', { platforms: [P(1755, 235, 110, 18), P(1875, 255, 110, 18)] }),
    G(3020, 150, 130, 160, 'The cistern pours a secret key upward.', { keys: [C(3360, 180)], spikes: [S(3330, 473, 110, 30, 0.85, 0.8, 1.9)] }),
    G(4100, 220, 130, 160, 'The blessing opens the exit, but the floor asks repayment.', { openExit: true, spikes: [S(4200, 473, 110, 30, 0.85, 0.8, 1.9)] })
  ]);
