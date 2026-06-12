/**
 * B"H
 * Hyper-real visual animation vessel. It shapes only pose/readability, never gameplay authority.
 */
import {LIMITS} from './jointLimits.js';
export function armConstraint(pose,side){const sh=pose[side+'Shoulder'],el=pose[side+'Elbow'],ha=pose[side+'Hand'];if(!sh||!el||!ha)return pose;clampSeg(sh,el,LIMITS.arm.max*.55);clampSeg(el,ha,LIMITS.arm.max*.55);return pose}
function clampSeg(a,b,max){const dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy)||1;if(l>max){b.x=a.x+dx/l*max;b.y=a.y+dy/l*max}}
