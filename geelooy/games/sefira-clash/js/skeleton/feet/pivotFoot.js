/**
 * B"H
 * Next hyper-real animation vessel: visual-only mass, feet, gait, breath, intent, recovery, personality, damage, micro, impact.
 */
export function pivotFoot(p,f,metrics,body,phase){if(!metrics.grounded||metrics.turnTimer<.2)return p;const s=body.height,foot=phase.left?p.leftFoot:p.rightFoot;foot.x-=metrics.facing*5*metrics.turnTimer*s;p.hip.x-=metrics.facing*3*metrics.turnTimer*s;return p}
