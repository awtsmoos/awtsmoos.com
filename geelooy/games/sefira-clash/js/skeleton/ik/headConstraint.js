/**
 * B"H
 * Hyper-real visual animation vessel. It shapes only pose/readability, never gameplay authority.
 */
import {LIMITS} from './jointLimits.js';
export function headConstraint(pose){const n=pose.neck,h=pose.head;if(!n||!h)return pose;const dx=h.x-n.x,dy=h.y-n.y,l=Math.hypot(dx,dy)||1,max=LIMITS.neck.max;if(l>max){h.x=n.x+dx/l*max;h.y=n.y+dy/l*max}return pose}
