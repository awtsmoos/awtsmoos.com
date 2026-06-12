/**
 * B"H
 * Next hyper-real outer-life vessel: degradation, micro motion, impact, eyes. Visual-only.
 */
import {idleWeightShift} from './idleWeightShift.js';import {fingerMotion} from './fingerMotion.js';import {shoulderTick} from './shoulderTick.js';import {neckAdjustment} from './neckAdjustment.js';import {balanceCorrection} from './balanceCorrection.js';
export function microPose(p,f,m,body){idleWeightShift(p,f,m,body);shoulderTick(p,f,m,body);neckAdjustment(p,f,m,body);balanceCorrection(p,f,m,body);fingerMotion(f);return p}
