/**
 * B"H
 * Next hyper-real inner-life vessel: breath, intent, recovery, personality, damage, micro, impact. Visual-only.
 */
export function breathingCycle(f,profile={}){const rate=profile.breathRate||.075,t=(f.motionClock||0)*rate+(profile.idleOffset||0);return{inhale:(Math.sin(t)+1)/2,wave:Math.sin(t),rate}}
