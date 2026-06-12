/**
 * B"H
 * Next hyper-real animation vessel: visual-only mass, feet, gait, breath, intent, recovery, personality, damage, micro, impact.
 */
export function brakingFoot(p,f,metrics,body){if(!metrics.grounded||!metrics.turnMismatch)return p;const s=body.height;p.leftFoot.x-=metrics.facing*8*s;p.rightFoot.x-=metrics.facing*8*s;p.chest.x-=metrics.facing*5*s;return p}
