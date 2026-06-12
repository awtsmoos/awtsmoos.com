/**
 * B"H
 * Next hyper-real animation vessel: visual-only mass, feet, gait, breath, intent, recovery, personality, damage, micro, impact.
 */
export function toePush(p,f,metrics,body,phase){if(!metrics.grounded)return p;const s=body.height,k=Math.max(0,-phase.roll)*Math.min(1,metrics.horizontalSpeed/8);const foot=phase.left?p.leftFoot:p.rightFoot;foot.x+=metrics.movingDirection*k*6*s;foot.y-=k*2*s;return p}
