/**
 * B"H
 * Next hyper-real animation vessel: visual-only mass, feet, gait, breath, intent, recovery, personality, damage, micro, impact.
 */
export function huntRunCycle(metrics,intent){const ph=(metrics.footPhase||0)*Math.PI*2;const k=intent.hunt||0;return{weight:k,stride:Math.sin(ph)*16*k,lift:Math.max(0,-Math.cos(ph))*3*k,arm:-Math.sin(ph)*10*k,lean:10*k}}
