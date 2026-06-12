/**
 * B"H
 * Next hyper-real animation vessel: visual-only mass, feet, gait, breath, intent, recovery, personality, damage, micro, impact.
 */
import {walkCycle} from './walkCycle.js';import {jogCycle} from './jogCycle.js';import {sprintCycle} from './sprintCycle.js';import {panicRunCycle} from './panicRunCycle.js';import {huntRunCycle} from './huntRunCycle.js';import {damagedRunCycle} from './damagedRunCycle.js';
export function gaitPose(p,f,metrics,body,intent,damage){const s=body.height,dir=metrics.movingDirection;for(const c of [walkCycle(metrics),jogCycle(metrics),sprintCycle(metrics),panicRunCycle(metrics,intent),huntRunCycle(metrics,intent),damagedRunCycle(metrics,damage)])apply(p,c,s,dir);return p}
function apply(p,c,s,dir){const w=c.weight||0;if(!w)return;p.leftFoot.x+=dir*c.stride*w*s;p.rightFoot.x-=dir*c.stride*w*s;p.leftFoot.y-=c.lift*w*s;p.rightFoot.y-=c.lift*w*s;p.leftHand.x+=dir*c.arm*w*s;p.rightHand.x-=dir*c.arm*w*s;p.chest.x+=dir*(c.lean||0)*w*s;p.head.x+=dir*((c.lean||0)*.45+(c.wobble||0))*w*s}
