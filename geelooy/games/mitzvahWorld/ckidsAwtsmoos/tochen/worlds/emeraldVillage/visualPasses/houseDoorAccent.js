// B"H
/**
 * @file houseDoorAccent.js
 * @description Chapter 333: A painted door turns a procedural house into a
 * dwelling with a face.
 */
import { box, p } from './shapeKit.js';
import { BANNERS } from './palette.js';
export function addHouseDoorAccent(n, prop, index, front) {
  box(n, `${prop.id}_painted_door`, 'Painted door accent', p(prop.center.x, 1.55, front), [2.2, 3.1, 0.18], BANNERS[index % BANNERS.length], false);
}
