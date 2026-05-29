// B"H
import { P, C, T } from '../levelPrimitives.js';

/**
 * Chapter 33: The Awtsmoos made the sky route obvious in every chamber.
 *
 * The upper route is no longer a puzzle of tiny shelves. It is a broad readable
 * staircase: each rung rises about one comfortable jump, each landing is wide,
 * and the final bridge is reached through an intermediate step instead of a
 * miracle leap.
 *
 * @param {object} level Mutable level clone receiving readable ascent shelves.
 * @param {number} index Zero-based campaign index for reward scaling.
 * @param {number} anchor Measured sky-vault anchor.
 * @returns {void}
 */
export function addGuaranteedAscent(level, index, anchor) {
  for (const [x, y, w] of ascentRungs()) level.platforms.push(P(x, y, w, 18));
  for (const [x, y, w] of midRouteEntryRungs()) level.platforms.push(P(x, y, w, 18));
  level.platforms.push(P(1320, -388, Math.max(620, anchor - 560), 18));
  level.trickPlatforms.push(T(anchor + 92, -44, 96, 14, index % 2 ? 'ice' : 'phantom', { duration: 1.25 }));
  level.coins.push(C(548, 382, 'perutah'), C(1088, -252, index > 12 ? 'sela' : 'dinar'));
}

/** @returns {Array<Array<number>>} `[x, y, width]` clear left ladder rungs. */
export function ascentRungs() {
  return [
    [535, 350, 140], [710, 320, 160], [865, 230, 170],
    [1018, 140, 180], [1168, 50, 184], [1320, -40, 184],
    [1490, -130, 184], [1680, -220, 184], [1870, -310, 184]
  ];
}

/** @returns {Array<Array<number>>} `[x, y, width]` clear mid-route sky rungs. */
export function midRouteEntryRungs() {
  return [
    [970, 190, 190], [1160, 145, 190], [1328, 55, 190],
    [1508, -35, 190], [1698, -125, 190], [1888, -215, 190],
    [2078, -305, 190]
  ];
}
