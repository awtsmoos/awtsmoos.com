/**
 * B"H
 * Awtsmoos movement split vessel: visual-only readability, no gameplay authority.
 */
export {clamp,lerp,smoothstep,approach,signOr,springValue} from './math/scalar.js';
export {vec,add,sub,mul,len,norm,perp as perpOf,angleOf} from './math/vector.js';
export {point,movePoint,lerpPoint,offsetAlong} from './math/posePoint.js';
import {norm} from './math/vector.js';
export const exactAim=(aim,facing=1)=>norm({x:aim?.x??facing,y:aim?.y??0},{x:facing||1,y:0});
