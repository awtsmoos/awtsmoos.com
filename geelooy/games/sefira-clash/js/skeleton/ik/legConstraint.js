/**
 * B"H
 * Hyper-real visual animation vessel. It shapes only pose/readability, never gameplay authority.
 */
import {LIMITS} from './jointLimits.js';
export function legConstraint(pose,side){const hp=pose[side+'Hip'],kn=pose[side+'Knee'],ft=pose[side+'Foot'];if(!hp||!kn||!ft)return pose;clampSeg(hp,kn,LIMITS.leg.max*.6);clampSeg(kn,ft,LIMITS.leg.max*.6);return pose}
function clampSeg(a,b,max){const dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy)||1;if(l>max){b.x=a.x+dx/l*max;b.y=a.y+dy/l*max}}
