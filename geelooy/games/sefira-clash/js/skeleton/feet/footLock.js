/**
 * B"H
 * Next hyper-real animation vessel: visual-only mass, feet, gait, breath, intent, recovery, personality, damage, micro, impact.
 */
export function footLock(p,f,metrics,body,phase){if(!metrics.grounded)return p;const foot=phase.left?p.leftFoot:p.rightFoot;foot.y=f.y+2;return p}
