/**
 * B"H
 * Next hyper-real animation vessel: visual-only mass, feet, gait, breath, intent, recovery, personality, damage, micro, impact.
 */
export function heelStrike(p,f,metrics,body,phase){if(!metrics.grounded)return p;const s=body.height,k=Math.max(0,phase.roll);const foot=phase.left?p.leftFoot:p.rightFoot;foot.y+=k*2*s;foot.x-=metrics.movingDirection*k*3*s;return p}
