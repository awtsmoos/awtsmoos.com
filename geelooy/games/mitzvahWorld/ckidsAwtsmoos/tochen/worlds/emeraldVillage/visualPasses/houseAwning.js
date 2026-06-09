// B"H
/**
 * @file houseAwning.js
 * @description Chapter 335: Cloth shade softens every house front.
 */
import { box, p } from './shapeKit.js';
import { BANNERS } from './palette.js';
export function addHouseAwning(n, prop, index, front, sign) {
  box(n, `${prop.id}_awning`, 'Cloth awning', p(prop.center.x, 3.35, front + sign * 0.45), [5.8, 0.22, 1.4], BANNERS[(index + 2) % BANNERS.length], false);
}
