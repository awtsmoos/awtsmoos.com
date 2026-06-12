/**
 * B"H
 * Hyper-real visual animation vessel. It shapes only pose/readability, never gameplay authority.
 */
import {clamp} from '../poseMath.js';
export const weightGrounded=m=>m.grounded?1:0;
export const weightAir=m=>m.airborne?1:0;
export const weightSpeed=m=>clamp(m.horizontalSpeed/10);
export const weightImpact=m=>clamp(m.landingImpact||0);
export const weightAttack=f=>f.attack?1:0;
