// B"H
/**
 * @file plazaBase.js
 * @description Chapter 294: The base stone disk gives the entry a readable
 * stage beneath the Etz Chayim.
 */
import { box, p } from './shapeKit.js';
import { P } from './palette.js';
export function addPlazaBase(n, config) {
  box(n, 'entry_circular_stone_plaza', 'Circular Entry Plaza', p(config.center.x, 0.05, config.center.z), config.baseSize, P.stone, true);
}
