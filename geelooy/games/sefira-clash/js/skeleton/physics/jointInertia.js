/**
 * B"H
 * Hyper-real visual animation vessel. It shapes only pose/readability, never gameplay authority.
 */
import {clamp} from '../poseMath.js';
export function jointInertia(pose,f,body){const mem=f.poseMemory?.points||{},s=body.height;lag(pose,'head',mem.head,.18*s,.28);lag(pose,'leftHand',mem.leftHand,.36*s,.45);lag(pose,'rightHand',mem.rightHand,.36*s,.45);lag(pose,'leftFoot',mem.leftFoot,.18*s,.25);lag(pose,'rightFoot',mem.rightFoot,.18*s,.25);return pose}
function lag(pose,name,m,max,k){if(!pose[name]||!m)return;pose[name].x-=clamp(m.vx*k,-max,max);pose[name].y-=clamp(m.vy*k,-max,max)}
