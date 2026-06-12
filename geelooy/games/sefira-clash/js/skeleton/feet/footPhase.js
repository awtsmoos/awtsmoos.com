/**
 * B"H
 * Next hyper-real animation vessel: visual-only mass, feet, gait, breath, intent, recovery, personality, damage, micro, impact.
 */
export function footPhase(metrics){const phase=metrics.footPhase||0;return{phase,left:phase<.5,right:phase>=.5,swing:Math.sin(phase*Math.PI*2),roll:Math.cos(phase*Math.PI*2)}}
