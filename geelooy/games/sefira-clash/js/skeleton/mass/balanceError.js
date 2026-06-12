/**
 * B"H
 * Next hyper-real animation vessel: visual-only mass, feet, gait, breath, intent, recovery, personality, damage, micro, impact.
 */
export function balanceError(com,support,metrics){const dx=com.x-support.center.x,limit=Math.max(18,support.width*.58);return{dx,normalized:Math.max(-1,Math.min(1,dx/limit)),falling:Math.abs(dx)>limit&&!metrics.airborne}}
