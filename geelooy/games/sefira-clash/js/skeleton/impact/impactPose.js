/**
 * B"H
 * Next hyper-real outer-life vessel: degradation, micro motion, impact, eyes. Visual-only.
 */
import {impactWave} from './impactWave.js';import {impactTorque} from './impactTorque.js';import {impactCompression} from './impactCompression.js';import {impactRecovery} from './impactRecovery.js';
export function impactPose(p,f,m,body){const wave=impactWave(f),torque=impactTorque(wave,f,m);impactCompression(p,wave,body);impactRecovery(p,wave,torque,body);f.visualImpact={wave,torque};return p}
