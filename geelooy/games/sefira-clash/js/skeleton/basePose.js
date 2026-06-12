/**
 * B"H
 * Awtsmoos visual vessel: pure animation/readability, never gameplay authority.
 */
import {baseAnchors} from './base/baseAnchors.js';import {baseLimbs} from './base/baseLimbs.js';import {bodyArchetype} from './style/bodyArchetype.js';
export function basePose(f,metricsOrFacing,bodyOrWalk,balanceOrScale,anim,intent){const legacy=typeof metricsOrFacing==='number',m=legacy?{facing:metricsOrFacing,horizontalSpeed:Math.abs(f.vx||0),movingDirection:Math.sign(f.vx||metricsOrFacing||1),footPhase:(f.motionClock||0)*.067}:metricsOrFacing,body=legacy?bodyArchetype(f):bodyOrWalk,balance=legacy?{balanceLean:intent?.lean||0,recoveryLean:0,panicBackLean:0}:balanceOrScale;return baseLimbs(f,baseAnchors(f,m,body,balance,anim,intent),m,body)}
