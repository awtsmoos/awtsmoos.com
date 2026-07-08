// B"H
/**
 * @file etzChayimRoots.js
 * @description Chapter 276: Roots crawl from the trunk like old stories across
 * the stone plaza.
 */
import { box, p, ringPoints } from './shapeKit.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { P } from './palette.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function addEtzChayimRoots(n, config) {
  ringPoints(config.rootCount, config.rootRadius, config.center.x, config.center.z).forEach((root, i) => {
    box(n, `etz_root_radial_${i}`, 'Etz Chayim exposed root', p(root.x * 0.62, 0.18, config.center.z + (root.z - config.center.z) * 0.62), [3.9, 0.36, 0.58], P.root, true);
  });
  ringPoints(10, 4.1, config.center.x, config.center.z).forEach((root, i) => {
    box(n, `etz_inner_root_knot_${i}`, 'Etz Chayim inner root knot', p(root.x, 0.44, root.z), [1.1, 0.7, 0.8], P.darkWood, true);
  });
}
