//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the pose weights vessel in this instant, revealing
 * its focused js skeleton compose service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Hyper-real visual animation vessel. It shapes only pose/readability, never gameplay authority.
 */
import { clamp } from '../poseMath.js';
/**
 * Reveals the weight grounded behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} m The m value entering this behavior.
 */
export const weightGrounded = m => (m.grounded ? 1 : 0);
/**
 * Reveals the weight air behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} m The m value entering this behavior.
 */
export const weightAir = m => (m.airborne ? 1 : 0);
/**
 * Reveals the weight speed behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} m The m value entering this behavior.
 */
export const weightSpeed = m => clamp(m.horizontalSpeed / 10);
/**
 * Reveals the weight impact behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} m The m value entering this behavior.
 */
export const weightImpact = m => clamp(m.landingImpact || 0);
/**
 * Reveals the weight attack behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} f The f value entering this behavior.
 */
export const weightAttack = f => (f.attack ? 1 : 0);
