/**
 * B"H
 * Next hyper-real animation vessel: visual-only mass, feet, gait, breath, intent, recovery, personality, damage, micro, impact.
 */
import {footPhase} from './footPhase.js';import {heelStrike} from './heelStrike.js';import {toePush} from './toePush.js';import {pivotFoot} from './pivotFoot.js';import {brakingFoot} from './brakingFoot.js';import {footLock} from './footLock.js';import {footSlip} from './footSlip.js';
export function feetPose(p,f,metrics,body){const phase=footPhase(metrics);heelStrike(p,f,metrics,body,phase);toePush(p,f,metrics,body,phase);pivotFoot(p,f,metrics,body,phase);brakingFoot(p,f,metrics,body);footLock(p,f,metrics,body,phase);footSlip(p,f,metrics,body,phase);f.visualFeet=phase;return p}
