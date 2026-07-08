// B"H
/**
 * @file architectureBanners.js
 * @description Chapter 287: Banners give every house a visible family flag.
 */
import { box, p } from './shapeKit.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { BANNERS } from './palette.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function addArchitectureBanner(n, prop, i) {
  box(n, `${prop.id}_banner`, 'Hanging house banner', p(prop.center.x + 5, 4.5, prop.center.z), [0.4, 2.2, 0.1], BANNERS[i % BANNERS.length], false);
}
