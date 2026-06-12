/**
 * B"H
 * Next hyper-real animation vessel: visual-only mass, feet, gait, breath, intent, recovery, personality, damage, micro, impact.
 */
export function bodyMomentum(f,metrics){const ax=metrics.acceleration?.x||0,ay=metrics.acceleration?.y||0;return{pushX:(f.vx||0)*.08+ax*.35,pushY:(f.vy||0)*.05+ay*.25,energy:Math.min(1,Math.hypot(f.vx||0,f.vy||0)/16)}}
