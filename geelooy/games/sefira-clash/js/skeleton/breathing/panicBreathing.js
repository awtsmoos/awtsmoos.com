/**
 * B"H
 * Next hyper-real inner-life vessel: breath, intent, recovery, personality, damage, micro, impact. Visual-only.
 */
export function panicBreathing(f,breath,intent={}){const k=intent.panic||0;return{chest:k*6*Math.abs(Math.sin((f.motionClock||0)*.18)),shoulders:k*5*breath.wave,head:k*3*Math.sin((f.motionClock||0)*.29)}}
