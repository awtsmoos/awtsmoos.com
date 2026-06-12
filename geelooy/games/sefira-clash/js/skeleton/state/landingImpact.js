/**
 * B"H
 * Awtsmoos visual vessel: pure animation/readability, never gameplay authority.
 */
import {clamp} from '../poseMath.js';
export const landingImpact=f=>clamp(((f.preLandingVy||0)-7)/15,0,1);
export const landingSquash=f=>Math.min(.28,Math.max(0,(f.preLandingVy||0)-8)*.018);
