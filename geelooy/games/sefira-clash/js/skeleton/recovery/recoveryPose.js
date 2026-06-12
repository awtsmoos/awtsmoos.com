/**
 * B"H
 * Next hyper-real inner-life vessel: breath, intent, recovery, personality, damage, micro, impact. Visual-only.
 */
import {stumbleRecovery} from './stumbleRecovery.js';import {attackRecoveryPose} from './attackRecovery.js';import {landingRecoveryPose} from './landingRecovery.js';import {panicRecovery} from './panicRecovery.js';import {balanceRecovery} from './balanceRecovery.js';
export function recoveryPose(p,f,m,body,intent){stumbleRecovery(p,f,m,body);attackRecoveryPose(p,f,m,body);landingRecoveryPose(p,f,m,body);panicRecovery(p,f,m,body,intent);balanceRecovery(p,f,m,body);return p}
