// B"H
/**
 * @file architectureBanners.js
 * @description Chapter 287: Banners give every house a visible family flag.
 */
import { box, p } from './shapeKit.js';
import { BANNERS } from './palette.js';
export function addArchitectureBanner(n, prop, i) {
  box(n, `${prop.id}_banner`, 'Hanging house banner', p(prop.center.x + 5, 4.5, prop.center.z), [0.4, 2.2, 0.1], BANNERS[i % BANNERS.length], false);
}
