// B"H
/**
 * @file houseMicroPass.js
 * @description Chapter 477: House micro-detail scales by device density while
 * preserving enough lived-in signs near the entry.
 */
import { addHouseAwning } from './houseAwning.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { addHouseDoorAccent } from './houseDoorAccent.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { houseFront } from './houseFrontMath.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { addHouseJars } from './houseJars.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { addHouseLaundry } from './houseLaundry.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { addHouseShutters } from './houseShutters.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { addHouseSmoke } from './houseSmoke.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { scaledCount } from './visualDensityConfig.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function addHouseMicro(n, properties, density = {}) {
  const limit = scaledCount(Math.min(properties.length, 36), density.houseScale ?? 1, 8);
  properties.slice(0, limit).forEach((prop, index) => {
    const { front, sign } = houseFront(prop);
    addHouseDoorAccent(n, prop, index, front); addHouseShutters(n, prop, front); addHouseAwning(n, prop, index, front, sign); addHouseSmoke(n, prop);
    if ((density.houseScale ?? 1) > 0.5) addHouseLaundry(n, prop, index, front, sign);
    if ((density.houseScale ?? 1) > 0.6) addHouseJars(n, prop, front, sign);
  });
}
