/**
 * B"H
 * Next hyper-real inner-life vessel: breath, intent, recovery, personality, damage, micro, impact. Visual-only.
 */
export function combatBreathing(f,breath){const k=f.attack||f.chargeGlow>.1?1:0;return{chest:k*(1.5+(f.chargeGlow||0)*3)*breath.inhale,shoulders:k*2*breath.wave,head:k*.8*breath.wave}}
