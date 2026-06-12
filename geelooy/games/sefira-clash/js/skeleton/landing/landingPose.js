/**
 * B"H
 * Ruthless audit repair vessel: active hyper-real animation, visual-only.
 */
import {landingCompression} from './landingCompression.js';import {heavyLandingPose} from './heavyLandingPose.js';import {landingRecovery} from './landingRecovery.js';import {landingRebound} from './landingRebound.js';import {landingDustImpulse} from './landingDustImpulse.js';
export function landingPose(p,f,m,body){landingCompression(p,f,m,body);heavyLandingPose(p,f,m,body);landingRecovery(p,f,m,body);landingRebound(p,f,m,body);landingDustImpulse(f,m);return p}
