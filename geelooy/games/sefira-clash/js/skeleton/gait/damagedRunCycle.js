/**
 * B"H
 * Next hyper-real animation vessel: visual-only mass, feet, gait, breath, intent, recovery, personality, damage, micro, impact.
 */
export function damagedRunCycle(metrics,damage){const ph=(metrics.footPhase||0)*Math.PI*2;const k=damage?.sag||0;return{weight:k,stride:Math.sin(ph*.9)*-10*k,lift:Math.max(0,-Math.cos(ph))*-3*k,arm:Math.sin(ph*.8)*12*k,wobble:Math.sin(ph*1.7)*6*k}}
