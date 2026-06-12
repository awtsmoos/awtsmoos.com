/**
 * B"H
 * Next hyper-real animation vessel: visual-only mass, feet, gait, breath, intent, recovery, personality, damage, micro, impact.
 */
export function jogCycle(metrics){const ph=(metrics.footPhase||0)*Math.PI*2;return{weight:metrics.grounded&&metrics.horizontalSpeed>=4&&metrics.horizontalSpeed<8?1:0,stride:Math.sin(ph)*30,lift:Math.max(0,-Math.cos(ph))*8,arm:-Math.sin(ph)*24}}
