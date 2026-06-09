// B"H
/**
 * @file lampGeometry.js
 * @description Chapter 345: One lamp has a post and warm glass, a tiny sun on
 * a stick.
 */
import { box, p } from './shapeKit.js';
import { P } from './palette.js';
export function addLampGeometry(n, lamp) {
  const h = lamp.height || 3.1;
  box(n, `${lamp.id}_post`, `${lamp.id} Post`, p(lamp.x, h / 2, lamp.z), [0.22, h, 0.22], P.darkWood, true);
  box(n, `${lamp.id}_glass`, `${lamp.id} Glass`, p(lamp.x, h + 0.16, lamp.z), [0.42, 0.36, 0.42], P.light, false);
}
