/**
 * B"H
 * Next hyper-real animation vessel: visual-only mass, feet, gait, breath, intent, recovery, personality, damage, micro, impact.
 */
export function panicRunCycle(metrics,intent){const ph=(metrics.footPhase||0)*Math.PI*2;const k=intent.panic||0;return{weight:k,stride:Math.sin(ph*1.13)*18*k,lift:Math.abs(Math.sin(ph))*8*k,arm:Math.cos(ph)*28*k,wobble:Math.sin(ph*2.7)*5*k}}
