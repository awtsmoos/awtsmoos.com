/**
 * B"H
 * Next hyper-real animation vessel: visual-only mass, feet, gait, breath, intent, recovery, personality, damage, micro, impact.
 */
export function sprintCycle(metrics){const ph=(metrics.footPhase||0)*Math.PI*2;return{weight:metrics.grounded&&metrics.horizontalSpeed>=8?1:0,stride:Math.sin(ph)*44,lift:Math.max(0,-Math.cos(ph))*12,arm:-Math.sin(ph)*34,lean:Math.min(1,metrics.horizontalSpeed/14)}}
