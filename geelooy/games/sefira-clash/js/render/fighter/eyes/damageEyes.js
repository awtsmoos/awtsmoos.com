/**
 * B"H
 * Next hyper-real outer-life vessel: degradation, micro motion, impact, eyes. Visual-only.
 */
export function damageEyes(f){const k=f.visualStyle?.damage?.wobble||0;return{droop:k*.4,shake:Math.sin((f.motionClock||0)*.31)*k}}
