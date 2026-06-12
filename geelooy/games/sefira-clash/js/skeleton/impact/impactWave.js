/**
 * B"H
 * Next hyper-real outer-life vessel: degradation, micro motion, impact, eyes. Visual-only.
 */
export function impactWave(f){const hit=f.stun?Math.min(1,f.stun/24):0,land=f.visualDustImpulse?.power||0;return{hit,land,total:Math.max(hit,land),phase:(f.motionClock||0)*.4}}
