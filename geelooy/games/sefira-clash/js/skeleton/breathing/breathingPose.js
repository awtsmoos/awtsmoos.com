/**
 * B"H
 * Next hyper-real inner-life vessel: breath, intent, recovery, personality, damage, micro, impact. Visual-only.
 */
import {breathingCycle} from './breathingCycle.js';import {combatBreathing} from './combatBreathing.js';import {exhaustionBreathing} from './exhaustionBreathing.js';import {panicBreathing} from './panicBreathing.js';
export function breathingPose(p,f,body,intent,damage,profile){const s=body.height,b=breathingCycle(f,profile),c=combatBreathing(f,b),e=exhaustionBreathing(f,b,damage),panic=panicBreathing(f,b,intent),ch=c.chest+e.chest+panic.chest,sh=c.shoulders+e.shoulders+panic.shoulders,head=c.head+e.head+panic.head;p.chest.y-=ch*s*.2;p.leftShoulder.y-=sh*s*.15;p.rightShoulder.y-=sh*s*.15;p.head.y-=head*s*.1;f.visualBreath={cycle:b,combat:c,exhaustion:e,panic};return p}
