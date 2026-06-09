// B"H
/**
 * @file etzChayimPlaque.js
 * @description Chapter 278: The plaque names the center so the player knows
 * they are at the beginning of a mitzvah journey.
 */
import { box, p } from './shapeKit.js';
import { P } from './palette.js';
export function addEtzChayimPlaque(n, config) {
  box(n, config.plaque.id, config.plaque.name, p(0, 1.5, -9.6), [4.9, 1.1, 0.18], P.gold, false);
  box(n, 'etz_chayim_subtitle_plaque', 'Tree of Life subtitle', p(0, 0.82, -9.45), [5.4, 0.5, 0.16], P.wood, false);
}
