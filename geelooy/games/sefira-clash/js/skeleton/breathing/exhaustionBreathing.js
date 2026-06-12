/**
 * B"H
 * Next hyper-real inner-life vessel: breath, intent, recovery, personality, damage, micro, impact. Visual-only.
 */
export function exhaustionBreathing(f,breath,damage={}){const k=damage.breathStrain||0;return{chest:k*5*breath.inhale,shoulders:k*4*Math.abs(breath.wave),head:k*2*breath.wave}}
