// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Crown Auction is a brutal final market of trust.
 *
 * The Awtsmoos auctions false certainty: the player must bid with patience,
 * climb to real crowns, stomp the auctioneer for one required coin, and refuse
 * the glitter that sits exactly where autopilot wants to land.
 */
export const level24 = L(
  '24 · Crown Auction of the Last Gate',
  13600,
  { x: 60, y: 420 },
  P(13220, 110, 44, 90),
  'The last gate is bought with attention, not speed.',
  [P(0, 505, 340, 35), P(520, 440, 120, 20), P(900, 365, 120, 20), P(1320, 285, 125, 20), P(1760, 205, 130, 20), P(2220, 125, 135, 20), P(2720, 205, 140, 20), P(3240, 285, 145, 20), P(3780, 365, 150, 20), P(4340, 295, 155, 20), P(4920, 225, 160, 20), P(5520, 145, 165, 20), P(6140, 225, 170, 20), P(6780, 305, 175, 20), P(7440, 225, 180, 20), P(8120, 145, 185, 20), P(8820, 65, 190, 20), P(9540, 155, 195, 20), P(10280, 245, 200, 20), P(11040, 175, 205, 20), P(11820, 95, 220, 20), P(12620, 135, 230, 20)],
  [R(760, 414, 82, 14, -3.8, 750), R(4100, 338, 96, 14, 4.3, 860), R(8580, 118, 108, 14, -4.8, 990), R(11620, 148, 116, 14, 4.7, 1010)],
  [T(1080, 349, 90, 16, 'falseSpike'), T(1540, 269, 92, 16, 'reverseBooster', { dir: 1, boost: 1040 }), T(2000, 189, 92, 16, 'ice', { duration: 1.7 }), T(2480, 109, 94, 16, 'booster', { dir: 1, boost: 1120, lift: 38 }), T(2980, 189, 96, 16, 'phantom'), T(3500, 269, 98, 16, 'commitDrop', { reform: 2.5 }), T(4660, 279, 100, 16, 'falseSpike'), T(5260, 209, 100, 16, 'magnet', { pull: 600 }), T(5880, 129, 102, 16, 'antiJump'), T(6520, 209, 104, 16, 'booster', { dir: -1, boost: 1120, lift: 34 }), T(7180, 289, 106, 16, 'fakeCheckpoint'), T(7860, 209, 108, 16, 'phantom'), T(8560, 129, 110, 16, 'ice', { duration: 1.75 }), T(9300, 49, 112, 16, 'falseSpike'), T(10040, 139, 114, 16, 'commitDrop', { reform: 2.55 }), T(10800, 229, 116, 16, 'reverseBooster', { dir: -1, boost: 1060 }), T(11580, 159, 118, 16, 'booster', { dir: 1, boost: 1210, lift: 38 }), T(12380, 79, 120, 16, 'antiSpeed')],
  [C(260, 460), C(555, 400), C(940, 325, 'dinar'), C(1360, 245), C(1800, 165, 'sela'), C(2260, 85), C(2760, 165, 'maneh'), C(3280, 245), C(3820, 325, 'dinar'), C(4380, 255), C(4960, 185, 'sela'), C(5560, 105), C(6180, 185, 'dinar'), C(6820, 265), C(7480, 185, 'sela'), C(8160, 105), C(8860, 25, 'maneh'), C(9580, 115), C(10320, 205, 'dinar'), C(11080, 135), C(11860, 55, 'sela'), C(12660, 95, 'maneh')],
  [C(13040, 90, 'dinar')],
  [S(380, 481, 90, 24, 1, 1, 2), S(3720, 481, 100, 24, 1.7, 1, 2.2), S(6600, 481, 110, 24, 2.1, 1, 2.2), S(9520, 481, 120, 24, 1.8, 1, 2.1), S(12300, 481, 130, 24, 2.4, 1, 2.2)],
  [E(2760, 171, 2700, 2880, 132, 'watcher', 'auctioneer watcher', { dropCoin: 'sela' }), E(5560, 111, 5500, 5700, 142, 'scroll', 'bid scroll', { dropCoin: 'dinar' }), E(7480, 191, 7420, 7640, 142, 'leaper', 'gavel leaper'), E(10320, 211, 10260, 10500, 152, 'herder', 'auction herder'), E(11860, 61, 11800, 12040, 136, 'baitGuard', 'last bid guard')],
  [G(1080, 245, 130, 130, 'The first bid is a lie-shaped bridge.', {}), G(2760, 110, 140, 120, 'The auctioneer carries a required coin.', {}), G(6140, 80, 140, 130, 'The gavel falls in three sharp calls.', { spikes: [{ x: 6280, y: 32, w: 72, h: 24, warning: 0.55, duration: 1.1, fallSpeed: 430 }, { x: 6370, y: 62, w: 76, h: 24, warning: 0.7, duration: 1.1, fallSpeed: 460 }, { x: 6465, y: 92, w: 80, h: 24, warning: 0.85, duration: 1.1, fallSpeed: 490 }] }), G(8860, 10, 140, 120, 'The honest crown is nearly offscreen until you climb.', {}), G(12380, 60, 160, 130, 'The last auction closes when all debts are counted.', { openExit: true })],
  ['The final auction sells patience.', 'A gavel can be a falling spike curtain.', 'The last crown is high, real, and surrounded by lies.'],
  { fakeCoins: [F(1080, 310, 'dinar', 'The opening bid stabbed back.'), F(9320, 22, 'maneh', 'The fake crown was the auction tooth.'), F(12400, 40, 'sela', 'The last cheap bid was a spike.')], trickCoins: [{ x: 1800, y: 165, kind: 'reverseRunner', speed: 400, min: 1660, max: 1980 }, { x: 5800, y: 105, kind: 'trapBait', baitX: 6140, speed: 280, min: 5620, max: 6200 }, { x: 8160, y: 105, kind: 'shyVanish', safeSide: 'left' }, { x: 10800, y: 205, kind: 'fakeRunner', min: 10640, max: 11040 }] }
);
