// B"H
/**
 * @file signBoard.js
 * @description Chapter 320: The board carries the readable village label.
 */
import { box, p } from './shapeKit.js';
import { P } from './palette.js';
export function addSignBoard(n, sign) {
  box(n, `${sign.id}_board`, sign.name, p(sign.x, 1.55, sign.z), [1.7, 0.55, 0.12], P.wood, false);
}
