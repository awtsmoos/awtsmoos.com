// B"H
/**
 * @file districtAccents.js
 * @description Chapter 484: Neighborhood banners are now density-aware, so
 * weak devices do not render every tiny motif.
 */
import { box, p } from './shapeKit.js';
import { DISTRICT_ACCENTS } from './districtAccentData.js';
import { scaledCount } from './visualDensityConfig.js';
export function addDistrictAccents(n, properties, density = {}) {
  DISTRICT_ACCENTS.slice(0, scaledCount(DISTRICT_ACCENTS.length, density.districtScale ?? 1, 8)).forEach(accent => {
    const prop = properties[accent.propertyOffset % properties.length];
    if (!prop) return;
    box(n, `${accent.id}_banner`, accent.label, p(prop.center.x + accent.local.x, accent.local.y, prop.center.z + accent.local.z), accent.size, accent.color, false);
  });
}
