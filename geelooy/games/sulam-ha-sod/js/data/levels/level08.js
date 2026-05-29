// B"H
import { L, P, C, S, E, R, T, G } from '../levelKit.js';

/**
 * Chapter 8: Binah hides rooms inside questions, but the Awtsmoos widens the
 * question enough for a human answer. The womb remains mysterious; its ledges
 * now hold the player long enough to understand what was concealed.
 */
export default L('08 - - - - · Binah Womb of Hidden Rooms', 5250, { x: 50, y: 390 }, P(5050, 145, 44, 92), 'Binah conceals the path inside the question.',
  [P(0, 505, 300, 40), P(340, 445, 140, 22), P(580, 380, 145, 22), P(840, 315, 145, 22), P(1110, 250, 155, 22), P(1400, 185, 155, 22), P(1710, 250, 155, 22), P(2020, 315, 155, 22), P(2330, 380, 155, 22), P(2650, 320, 165, 22), P(2980, 260, 165, 22), P(3310, 200, 165, 22), P(3650, 260, 165, 22), P(3990, 320, 165, 22), P(4350, 255, 260, 24), P(4700, 215, 250, 24)],
  [R(490, 415, 75, 16, -2.2, 430), R(1230, 225, 80, 16, 2.4, 450), R(1860, 285, 80, 16, -2.5, 460), R(2840, 290, 85, 16, 2.5, 460), R(3820, 290, 90, 16, -2.4, 450)],
  [T(720, 350, 80, 18, 'vanish', { reform: 1.2 }), T(980, 285, 80, 18, 'shatter', { reform: 1.6 }), T(1540, 160, 82, 18, 'ambush', { range: 120, jump: 125 }), T(2190, 350, 80, 18, 'vanish', { reform: 1.2 }), T(3150, 230, 86, 18, 'shatter', { reform: 1.6 }), T(4180, 290, 88, 18, 'ambush', { range: 125, jump: 125 })],
  [C(370, 405, 'dinar'), C(610, 340), C(870, 275, 'sela'), C(1140, 210), C(1430, 145, 'dinar'), C(1740, 210), C(2050, 275, 'sela'), C(2360, 340), C(2680, 280, 'dinar'), C(3010, 220), C(3340, 160, 'sela'), C(3680, 220), C(4020, 280, 'dinar'), C(4410, 215, 'maneh')],
  [C(3340, 160)],
  [S(280, 473, 78, 30, 0.9, 0.9, 2.2), S(760, 473, 88, 30, 1.3, 0.9, 2.5), S(1320, 473, 90, 30, 1.7, 0.9, 2.8), S(1980, 473, 98, 30, 2.1, 0.9, 3.0), S(2620, 473, 104, 30, 2.5, 0.9, 3.2), S(3380, 473, 108, 30, 2.9, 0.9, 3.4), S(4200, 473, 116, 30, 3.2, 0.9, 3.6)],
  [E(590, 346, 580, 700, 165, 'scroll', 'womb scroll'), E(1720, 216, 1710, 1830, 175, 'gravity', 'binah inversion'), E(3660, 226, 3650, 3780, 185, 'golem', 'understanding stone')],
  [
    G(1080, 180, 120, 160, 'Binah asks: what is a door before it becomes a wall?', { moveDoor: { x: 4860, y: 205 }, platforms: [P(1260, 220, 120, 18)] }),
    G(2140, 240, 130, 160, 'A hidden room opens under the sentence.', { platforms: [P(2260, 285, 125, 18), P(2390, 300, 105, 18)], coins: [C(2310, 245, 'maneh')] }),
    G(3940, 250, 130, 150, 'Understanding gives a key without showing its hand.', { keys: [C(4080, 240)], spikes: [S(4050, 306, 90, 26, 0.85, 0.8, 1.9)] }),
    G(4620, 160, 120, 150, 'The womb becomes a doorway.', { openExit: true })
  ]);
