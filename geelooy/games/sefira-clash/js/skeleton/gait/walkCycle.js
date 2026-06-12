/**
 * B"H
 * Next hyper-real animation vessel: visual-only mass, feet, gait, breath, intent, recovery, personality, damage, micro, impact.
 */
export function walkCycle(metrics){const ph=(metrics.footPhase||0)*Math.PI*2;return{weight:metrics.grounded&&metrics.horizontalSpeed>0.5&&metrics.horizontalSpeed<4?1:0,stride:Math.sin(ph)*18,lift:Math.max(0,-Math.cos(ph))*4,arm:-Math.sin(ph)*14}}
