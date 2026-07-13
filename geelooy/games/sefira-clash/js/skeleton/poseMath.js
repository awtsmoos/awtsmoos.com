//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the pose math vessel in this instant, revealing
 * its focused js skeleton service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Awtsmoos movement split vessel: visual-only readability, no gameplay authority.
 */
export { clamp, lerp, smoothstep, approach, signOr, springValue } from './math/scalar.js';
export { vec, add, sub, mul, len, norm, perp as perpOf, angleOf } from './math/vector.js';
export { point, movePoint, lerpPoint, offsetAlong } from './math/posePoint.js';
import { norm } from './math/vector.js';
/**
 * Reveals the exact aim behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} aim The aim value entering this behavior.
 * @param {*} facing The facing value entering this behavior.
 */
export const exactAim = (aim, facing = 1) =>
	norm({ x: aim?.x ?? facing, y: aim?.y ?? 0 }, { x: facing || 1, y: 0 });
