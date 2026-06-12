/**
 * B"H
 * Awtsmoos movement split vessel: visual-only readability, no gameplay authority.
 */
import {clamp,signOr} from '../poseMath.js';
export function motionMetrics(f,anim){const vx=f.vx||0,vy=f.vy||0,pvx=f.visualMotion?.previousVx??vx,pvy=f.visualMotion?.previousVy??vy,face=signOr(f.face||vx,1),sp=Math.hypot(vx,vy);return{speed:sp,horizontalSpeed:Math.abs(vx),verticalSpeed:vy,facing:face,movingDirection:signOr(vx,face),velocityDirection:{x:vx/(sp||1),y:vy/(sp||1)},grounded:!!f.grounded,airborne:!f.grounded,acceleration:{x:vx-pvx,y:vy-pvy},fastFallAmount:f.fastFalling?clamp((vy+2)/12,0,1):0,landingImpact:Math.max(anim.landingImpact||0,f.visualMotion?.lastLandingImpact||0),turnMismatch:vx&&Math.sign(vx)!==Math.sign(face)?1:0,footPhase:f.visualMotion?.footPhase||0,turnTimer:f.visualMotion?.visualTurnTimer||0}}
